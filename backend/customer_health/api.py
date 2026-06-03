from __future__ import annotations

import csv
import io
import json
import os
import zipfile
from contextlib import closing
from datetime import datetime, timedelta, timezone
from html import escape
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from sqlite3 import Connection
from typing import Any, Callable
from urllib.parse import parse_qs, urlparse

from .auth import (
    PASSWORD_RESET_TTL_MINUTES,
    get_user_for_token,
    hash_password,
    hash_token,
    has_permission,
    invalidate_session,
    invalidate_user_sessions,
    issue_session,
    verify_password,
)
from .database import DEFAULT_DB_PATH, initialize_database, new_id, utc_now
from .models import row_to_dict
from .project_import import MAX_IMPORT_BYTES, ImportTooLargeError, import_projects
from .scoring import calculate_for_customer, collect_score_input, recalculate_all_customers, recalculate_customer


Json = dict[str, Any]


def parse_body(handler: BaseHTTPRequestHandler) -> Json:
    length = int(handler.headers.get("Content-Length", "0") or "0")
    if length == 0:
        return {}
    raw = handler.rfile.read(length).decode("utf-8")
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON body: {exc}") from exc


def token_from_headers(handler: BaseHTTPRequestHandler) -> str | None:
    header = handler.headers.get("Authorization", "")
    if header.lower().startswith("bearer "):
        return header[7:].strip()
    return None


class CustomerHealthApi(BaseHTTPRequestHandler):
    server_version = "CustomerHealthApi/0.1"
    db_path: Path = DEFAULT_DB_PATH

    def _connect(self) -> Connection:
        return initialize_database(self.db_path)

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        self._dispatch("GET")

    def do_POST(self) -> None:
        self._dispatch("POST")

    def do_PATCH(self) -> None:
        self._dispatch("PATCH")

    def do_DELETE(self) -> None:
        self._dispatch("DELETE")

    def _dispatch(self, method: str) -> None:
        parsed = urlparse(self.path)
        parts = [part for part in parsed.path.split("/") if part]
        query = {key: values[-1] for key, values in parse_qs(parsed.query).items()}
        try:
            with closing(self._connect()) as conn:
                if parts == ["api", "health"] and method == "GET":
                    return self._json({"status": "ok", "service": "customer-health"})
                if parts == ["api", "auth", "login"] and method == "POST":
                    return self._login(conn)
                if parts == ["api", "auth", "register"] and method == "POST":
                    return self._register(conn)
                if parts == ["api", "auth", "forgot-password"] and method == "POST":
                    return self._forgot_password(conn)
                if parts == ["api", "auth", "reset-password"] and method == "POST":
                    return self._reset_password(conn)
                if parts == ["api", "auth", "logout"] and method == "POST":
                    return self._logout(conn)

                user = self._require_auth(conn)
                if parts == ["api", "auth", "me"] and method == "GET":
                    return self._json({"user": public_user(user)})
                if parts == ["api", "users"]:
                    return self._users(conn, method, user)
                if len(parts) == 3 and parts[:2] == ["api", "users"]:
                    return self._user_detail(conn, method, parts[2], user)

                if parts == ["api", "projects", "import"] and method == "POST":
                    return self._import_projects(conn, query, user)
                if parts == ["api", "projects"]:
                    return self._projects(conn, method, query, user)
                if len(parts) == 3 and parts[:2] == ["api", "projects"]:
                    return self._project_detail(conn, method, parts[2], user)

                if parts == ["api", "customers"]:
                    return self._customers(conn, method, query, user)
                if len(parts) == 3 and parts[:2] == ["api", "customers"]:
                    return self._customer_detail(conn, method, parts[2], user)
                if len(parts) == 4 and parts[:2] == ["api", "customers"] and parts[3] == "health-scores":
                    return self._customer_health_scores(conn, method, parts[2], user)
                if len(parts) == 5 and parts[:2] == ["api", "customers"] and parts[3] == "health-score" and parts[4] == "recalculate":
                    return self._recalculate(conn, method, parts[2], user)
                if len(parts) == 4 and parts[:2] == ["api", "customers"] and parts[3] == "metrics":
                    return self._customer_metrics(conn, method, parts[2], user)
                if len(parts) == 4 and parts[:2] == ["api", "customers"] and parts[3] == "health-trends":
                    return self._customer_trends(conn, method, parts[2], user)

                if parts == ["api", "health-scores"]:
                    return self._health_scores(conn, method, query, user)
                if len(parts) == 3 and parts[:2] == ["api", "health-scores"]:
                    return self._health_score_detail(conn, method, parts[2], user)

                if parts == ["api", "scoring-weights"]:
                    return self._scoring_weights(conn, method, user)
                if len(parts) == 3 and parts[:2] == ["api", "scoring-weights"]:
                    return self._scoring_weight_detail(conn, method, parts[2], user)

                if parts == ["api", "alerts"]:
                    return self._alerts(conn, method, query, user)
                if len(parts) == 3 and parts[:2] == ["api", "alerts"]:
                    return self._alert_detail(conn, method, parts[2], user)
                if parts == ["api", "notifications"]:
                    return self._notifications(conn, method, query, user)
                if len(parts) == 3 and parts[:2] == ["api", "notifications"]:
                    return self._notification_detail(conn, method, parts[2], user)
                if parts == ["api", "recommendations"]:
                    return self._recommendations(conn, method, query, user)
                if len(parts) == 3 and parts[:2] == ["api", "recommendations"]:
                    return self._recommendation_detail(conn, method, parts[2], user)

                if parts == ["api", "reports", "health-trends"] and method == "GET":
                    self._require_permission(user, "export")
                    return self._json({"data": health_trend_report(conn, query)})
                if parts == ["api", "reports", "health-distribution"] and method == "GET":
                    self._require_permission(user, "export")
                    return self._json({"data": health_distribution_report(conn)})
                if parts == ["api", "reports", "export"] and method == "GET":
                    self._require_permission(user, "export")
                    return self._export_report(conn, query)
                if parts == ["api", "jobs", "daily-health-monitor"] and method == "POST":
                    self._require_permission(user, "score")
                    results = recalculate_all_customers(conn)
                    return self._json({"results": results})

                return self._json({"error": "Route not found"}, HTTPStatus.NOT_FOUND)
        except PermissionError as exc:
            self._json({"error": str(exc)}, HTTPStatus.FORBIDDEN)
        except ValueError as exc:
            self._json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self._json({"error": "Internal server error", "detail": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def _login(self, conn: Connection) -> None:
        body = parse_body(self)
        email = str(body.get("email", "")).lower().strip()
        password = str(body.get("password", ""))
        if not email or not password:
            raise ValueError("Email and password are required")
        row = conn.execute(
            """
            SELECT users.*, roles.name AS role_name
            FROM users
            JOIN roles ON roles.id = users.role_id
            WHERE lower(users.email) = lower(?) AND users.is_active = 1
            """,
            (email,),
        ).fetchone()
        if not row or not verify_password(password, row["password_hash"]):
            return self._json({"error": "Invalid credentials"}, HTTPStatus.UNAUTHORIZED)
        token = issue_session(conn, row["id"])
        self._json({"token": token, "user": public_user(row)})

    def _register(self, conn: Connection) -> None:
        body = parse_body(self)
        full_name = str(body.get("full_name") or body.get("name") or "").strip()
        email = str(body.get("email", "")).lower().strip()
        password = str(body.get("password", ""))
        confirm_password = str(body.get("confirm_password", ""))
        if not full_name:
            raise ValueError("Full name is required")
        validate_email(email)
        validate_password_strength(password)
        if password != confirm_password:
            raise ValueError("Password confirmation does not match")
        exists = conn.execute("SELECT 1 FROM users WHERE lower(email) = lower(?)", (email,)).fetchone()
        if exists:
            return self._json({"error": "Email is already registered"}, HTTPStatus.CONFLICT)
        role = conn.execute("SELECT id FROM roles WHERE name = 'viewer'").fetchone()
        if not role:
            conn.execute("INSERT INTO roles (id, name, description) VALUES ('role_viewer', 'viewer', 'Read-only portfolio access.')")
            role_id = "role_viewer"
        else:
            role_id = role["id"]
        user_id = new_id("user")
        conn.execute(
            """
            INSERT INTO users (id, role_id, email, name, full_name, password_hash)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, role_id, email, full_name, full_name, hash_password(password)),
        )
        audit(conn, None, "register", "user", user_id, {"email": email})
        conn.commit()
        row = user_with_role(conn, user_id)
        token = issue_session(conn, user_id)
        self._json({"token": token, "user": public_user(row)}, HTTPStatus.CREATED)

    def _logout(self, conn: Connection) -> None:
        invalidate_session(conn, token_from_headers(self))
        self._json({"data": {"logged_out": True}})

    def _forgot_password(self, conn: Connection) -> None:
        body = parse_body(self)
        email = str(body.get("email", "")).lower().strip()
        validate_email(email)
        row = conn.execute("SELECT * FROM users WHERE lower(email) = lower(?) AND is_active = 1", (email,)).fetchone()
        payload: Json = {"message": "If the account exists, a password reset email has been sent."}
        if row:
            token = os.environ.get("CUSTOMER_HEALTH_FIXED_RESET_TOKEN") or os.urandom(32).hex()
            token_id = new_id("reset")
            expires_at = (datetime.now(timezone.utc) + timedelta(minutes=PASSWORD_RESET_TTL_MINUTES)).isoformat()
            conn.execute(
                """
                INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
                VALUES (?, ?, ?, ?)
                """,
                (token_id, row["id"], hash_token(token), expires_at),
            )
            audit(conn, row["id"], "request_password_reset", "user", row["id"], {"email": email})
            conn.commit()
            reset_base = os.environ.get("CUSTOMER_HEALTH_RESET_LINK_BASE", "http://127.0.0.1:5173/reset-password")
            reset_url = f"{reset_base}?token={token}"
            # Local/dev mode returns the token because this stdlib backend has no SMTP provider configured.
            if os.environ.get("CUSTOMER_HEALTH_RETURN_RESET_TOKEN", "1") == "1":
                payload["reset_token"] = token
                payload["reset_url"] = reset_url
        self._json(payload)

    def _reset_password(self, conn: Connection) -> None:
        body = parse_body(self)
        token = str(required(body, "token")).strip()
        password = str(body.get("password", ""))
        confirm_password = str(body.get("confirm_password", ""))
        validate_password_strength(password)
        if password != confirm_password:
            raise ValueError("Password confirmation does not match")
        row = conn.execute(
            """
            SELECT password_reset_tokens.*, users.email
            FROM password_reset_tokens
            JOIN users ON users.id = password_reset_tokens.user_id
            WHERE password_reset_tokens.token_hash = ?
              AND password_reset_tokens.used_at IS NULL
              AND password_reset_tokens.expires_at > ?
              AND users.is_active = 1
            """,
            (hash_token(token), datetime.now(timezone.utc).isoformat()),
        ).fetchone()
        if not row:
            return self._json({"error": "Reset token is invalid or expired"}, HTTPStatus.UNAUTHORIZED)
        conn.execute(
            "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (hash_password(password), row["user_id"]),
        )
        conn.execute("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?", (row["id"],))
        audit(conn, row["user_id"], "reset_password", "user", row["user_id"], {"email": row["email"]})
        conn.commit()
        invalidate_user_sessions(conn, row["user_id"])
        self._json({"message": "Password has been reset. Please sign in with the new password."})

    def _users(self, conn: Connection, method: str, user: Any) -> None:
        self._require_permission(user, "admin")
        if method != "GET":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        rows = conn.execute(
            """
            SELECT users.*, roles.name AS role_name
            FROM users
            JOIN roles ON roles.id = users.role_id
            ORDER BY users.created_at DESC
            """
        ).fetchall()
        return self._json({"data": [public_user(row) for row in rows]})

    def _user_detail(self, conn: Connection, method: str, user_id: str, user: Any) -> None:
        self._require_permission(user, "admin")
        row = user_with_role(conn, user_id)
        if not row:
            return self._json({"error": "User not found"}, HTTPStatus.NOT_FOUND)
        if method != "PATCH":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        body = parse_body(self)
        updates: Json = {}
        if "full_name" in body or "name" in body:
            full_name = str(body.get("full_name") or body.get("name") or "").strip()
            if not full_name:
                raise ValueError("Full name is required")
            updates["name"] = full_name
            updates["full_name"] = full_name
        if "email" in body:
            email = str(body["email"]).lower().strip()
            validate_email(email)
            duplicate = conn.execute("SELECT 1 FROM users WHERE lower(email) = lower(?) AND id != ?", (email, user_id)).fetchone()
            if duplicate:
                return self._json({"error": "Email is already registered"}, HTTPStatus.CONFLICT)
            updates["email"] = email
        if "is_active" in body:
            is_active = bool(body["is_active"])
            if user_id == user["id"] and not is_active:
                raise ValueError("Admins cannot disable their own account")
            updates["is_active"] = int(is_active)
            if not is_active:
                invalidate_user_sessions(conn, user_id)
        if "role" in body:
            role = conn.execute("SELECT id FROM roles WHERE name = ?", (str(body["role"]).lower(),)).fetchone()
            if not role:
                raise ValueError("Unknown role")
            updates["role_id"] = role["id"]
        if not updates:
            raise ValueError("No supported fields supplied")
        updates["updated_at"] = "CURRENT_TIMESTAMP"
        assignments = []
        values = []
        for key, value in updates.items():
            if value == "CURRENT_TIMESTAMP":
                assignments.append(f"{key} = CURRENT_TIMESTAMP")
            else:
                assignments.append(f"{key} = ?")
                values.append(value)
        values.append(user_id)
        conn.execute(f"UPDATE users SET {', '.join(assignments)} WHERE id = ?", values)
        audit(conn, user["id"], "update", "user", user_id, {key: value for key, value in body.items() if key != "password"})
        conn.commit()
        return self._json({"data": public_user(user_with_role(conn, user_id))})

    def _projects(self, conn: Connection, method: str, query: Json, user: Any) -> None:
        if method != "GET":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "read")
        filters = []
        params: list[Any] = []
        if query.get("customer_id"):
            filters.append("projects.customer_id = ?")
            params.append(query["customer_id"])
        if query.get("stage"):
            filters.append("projects.stage = ?")
            params.append(query["stage"])
        where = f"WHERE {' AND '.join(filters)}" if filters else ""
        rows = conn.execute(
            f"""
            SELECT projects.*, customers.name AS customer_name
            FROM projects
            JOIN customers ON customers.id = projects.customer_id
            {where}
            ORDER BY projects.updated_at DESC, projects.name
            """,
            params,
        ).fetchall()
        return self._json({"data": [row_to_dict(row) for row in rows]})

    def _project_detail(self, conn: Connection, method: str, project_id: str, user: Any) -> None:
        if method != "GET":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "read")
        row = conn.execute(
            """
            SELECT projects.*, customers.name AS customer_name
            FROM projects
            JOIN customers ON customers.id = projects.customer_id
            WHERE projects.id = ?
            """,
            (project_id,),
        ).fetchone()
        if not row:
            return self._json({"error": "Project not found"}, HTTPStatus.NOT_FOUND)
        return self._json({"data": row_to_dict(row)})

    def _import_projects(self, conn: Connection, query: Json, user: Any) -> None:
        self._require_permission(user, "write")
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length > MAX_IMPORT_BYTES:
            return self._json({"error": f"Import file exceeds {MAX_IMPORT_BYTES} bytes"}, HTTPStatus.REQUEST_ENTITY_TOO_LARGE)
        raw = self.rfile.read(length)
        try:
            result = import_projects(conn, raw, query.get("format"), self.headers.get("Content-Type", ""))
        except ImportTooLargeError as exc:
            return self._json({"error": str(exc)}, HTTPStatus.REQUEST_ENTITY_TOO_LARGE)
        audit(
            conn,
            user["id"],
            "import",
            "projects",
            "bulk",
            {
                "created": result["created"],
                "updated": result["updated"],
                "failed": result["failed"],
            },
        )
        conn.commit()
        return self._json(result)

    def _customers(self, conn: Connection, method: str, query: Json, user: Any) -> None:
        if method == "GET":
            self._require_permission(user, "read")
            filters = []
            params: list[Any] = []
            if query.get("status"):
                filters.append("status = ?")
                params.append(query["status"])
            if query.get("plan"):
                filters.append("id IN (SELECT customer_id FROM subscriptions WHERE plan_name = ?)")
                params.append(query["plan"])
            if query.get("health_min"):
                filters.append("current_health_score >= ?")
                params.append(int(query["health_min"]))
            if query.get("health_max"):
                filters.append("current_health_score <= ?")
                params.append(int(query["health_max"]))
            where = f"WHERE {' AND '.join(filters)}" if filters else ""
            rows = conn.execute(f"SELECT * FROM customers {where} ORDER BY name", params).fetchall()
            return self._json({"data": [row_to_dict(row) for row in rows]})
        if method == "POST":
            self._require_permission(user, "write")
            body = parse_body(self)
            customer_id = body.get("id") or new_id("cust")
            conn.execute(
                """
                INSERT INTO customers (id, name, external_ref, status, lifecycle_stage, owner_user_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    customer_id,
                    required(body, "name"),
                    body.get("external_ref"),
                    body.get("status", "active"),
                    body.get("lifecycle_stage", "live"),
                    body.get("owner_user_id"),
                ),
            )
            audit(conn, user["id"], "create", "customer", customer_id, body)
            conn.commit()
            return self._json({"data": get_by_id(conn, "customers", customer_id)}, HTTPStatus.CREATED)
        return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)

    def _customer_detail(self, conn: Connection, method: str, customer_id: str, user: Any) -> None:
        row = get_by_id(conn, "customers", customer_id)
        if not row:
            return self._json({"error": "Customer not found"}, HTTPStatus.NOT_FOUND)
        if method == "GET":
            self._require_permission(user, "read")
            return self._json({"data": row})
        if method == "PATCH":
            self._require_permission(user, "write")
            body = parse_body(self)
            patch_table(conn, "customers", customer_id, body, allowed={"name", "status", "lifecycle_stage", "owner_user_id", "external_ref"})
            audit(conn, user["id"], "update", "customer", customer_id, body)
            conn.commit()
            return self._json({"data": get_by_id(conn, "customers", customer_id)})
        if method == "DELETE":
            self._require_permission(user, "admin")
            conn.execute("UPDATE customers SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (customer_id,))
            audit(conn, user["id"], "delete", "customer", customer_id, {})
            conn.commit()
            return self._json({"data": {"id": customer_id, "status": "deleted"}})
        return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)

    def _customer_health_scores(self, conn: Connection, method: str, customer_id: str, user: Any) -> None:
        self._require_permission(user, "read")
        if method != "GET":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        rows = conn.execute(
            "SELECT * FROM health_scores WHERE customer_id = ? ORDER BY calculated_at DESC",
            (customer_id,),
        ).fetchall()
        return self._json({"data": [row_to_dict(row) for row in rows]})

    def _recalculate(self, conn: Connection, method: str, customer_id: str, user: Any) -> None:
        if method != "POST":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "score")
        if not get_by_id(conn, "customers", customer_id):
            return self._json({"error": "Customer not found"}, HTTPStatus.NOT_FOUND)
        result = recalculate_customer(conn, customer_id)
        audit(conn, user["id"], "recalculate", "customer", customer_id, result)
        conn.commit()
        return self._json({"data": result})

    def _customer_metrics(self, conn: Connection, method: str, customer_id: str, user: Any) -> None:
        if method != "GET":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "read")
        if not get_by_id(conn, "customers", customer_id):
            return self._json({"error": "Customer not found"}, HTTPStatus.NOT_FOUND)
        score_input = collect_score_input(conn, customer_id)
        breakdown = calculate_for_customer(conn, customer_id)
        return self._json({"data": {"input": score_input.__dict__, "calculated": breakdown.__dict__}})

    def _customer_trends(self, conn: Connection, method: str, customer_id: str, user: Any) -> None:
        if method != "GET":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "read")
        return self._json({"data": health_trend_report(conn, {"customer_id": customer_id})})

    def _health_scores(self, conn: Connection, method: str, query: Json, user: Any) -> None:
        if method == "GET":
            self._require_permission(user, "read")
            params: list[Any] = []
            where = ""
            if query.get("customer_id"):
                where = "WHERE customer_id = ?"
                params.append(query["customer_id"])
            rows = conn.execute(f"SELECT * FROM health_scores {where} ORDER BY calculated_at DESC", params).fetchall()
            return self._json({"data": [row_to_dict(row) for row in rows]})
        if method == "POST":
            self._require_permission(user, "write")
            body = parse_body(self)
            score_id = body.get("id") or new_id("score")
            score = int(required(body, "score"))
            conn.execute(
                """
                INSERT INTO health_scores (
                  id, customer_id, score, health_status, login_score, feature_usage_score,
                  support_score, subscription_score, explanation_json, calculated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    score_id,
                    required(body, "customer_id"),
                    score,
                    body.get("health_status", score_to_status(score)),
                    int(body.get("login_score", 0)),
                    int(body.get("feature_usage_score", 0)),
                    int(body.get("support_score", 0)),
                    int(body.get("subscription_score", 0)),
                    json.dumps(body.get("explanation", {})),
                    body.get("calculated_at", utc_now()),
                ),
            )
            conn.commit()
            return self._json({"data": get_by_id(conn, "health_scores", score_id)}, HTTPStatus.CREATED)
        return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)

    def _health_score_detail(self, conn: Connection, method: str, score_id: str, user: Any) -> None:
        row = get_by_id(conn, "health_scores", score_id)
        if not row:
            return self._json({"error": "Health score not found"}, HTTPStatus.NOT_FOUND)
        if method == "GET":
            self._require_permission(user, "read")
            return self._json({"data": row})
        if method == "PATCH":
            self._require_permission(user, "write")
            patch_table(conn, "health_scores", score_id, parse_body(self), allowed={"score", "health_status", "explanation_json"})
            conn.commit()
            return self._json({"data": get_by_id(conn, "health_scores", score_id)})
        if method == "DELETE":
            self._require_permission(user, "admin")
            conn.execute("DELETE FROM health_scores WHERE id = ?", (score_id,))
            conn.commit()
            return self._json({"data": {"id": score_id, "deleted": True}})
        return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)

    def _scoring_weights(self, conn: Connection, method: str, user: Any) -> None:
        if method == "GET":
            self._require_permission(user, "read")
            rows = conn.execute("SELECT * FROM scoring_weights ORDER BY metric_key").fetchall()
            return self._json({"data": [row_to_dict(row) for row in rows]})
        if method == "POST":
            self._require_permission(user, "admin")
            body = parse_body(self)
            weight_id = body.get("id") or new_id("weight")
            conn.execute(
                """
                INSERT INTO scoring_weights (id, metric_key, display_name, weight, enabled, config_json, updated_by_user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    weight_id,
                    required(body, "metric_key"),
                    required(body, "display_name"),
                    float(required(body, "weight")),
                    int(body.get("enabled", True)),
                    json.dumps(body.get("config", {})),
                    user["id"],
                ),
            )
            conn.commit()
            return self._json({"data": get_by_id(conn, "scoring_weights", weight_id)}, HTTPStatus.CREATED)
        return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)

    def _scoring_weight_detail(self, conn: Connection, method: str, weight_id: str, user: Any) -> None:
        if not get_by_id(conn, "scoring_weights", weight_id):
            return self._json({"error": "Scoring weight not found"}, HTTPStatus.NOT_FOUND)
        if method != "PATCH":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "admin")
        body = parse_body(self)
        if "config" in body:
            body["config_json"] = json.dumps(body.pop("config"))
        body["updated_by_user_id"] = user["id"]
        patch_table(conn, "scoring_weights", weight_id, body, allowed={"display_name", "weight", "enabled", "config_json", "updated_by_user_id"})
        conn.commit()
        return self._json({"data": get_by_id(conn, "scoring_weights", weight_id)})

    def _alerts(self, conn: Connection, method: str, query: Json, user: Any) -> None:
        if method == "GET":
            self._require_permission(user, "read")
            filters = []
            params = []
            if query.get("customer_id"):
                filters.append("customer_id = ?")
                params.append(query["customer_id"])
            if query.get("status"):
                filters.append("status = ?")
                params.append(query["status"])
            where = f"WHERE {' AND '.join(filters)}" if filters else ""
            rows = conn.execute(f"SELECT * FROM alerts {where} ORDER BY created_at DESC", params).fetchall()
            return self._json({"data": [row_to_dict(row) for row in rows]})
        if method == "POST":
            self._require_permission(user, "notify")
            body = parse_body(self)
            alert_id = body.get("id") or new_id("alert")
            conn.execute(
                """
                INSERT INTO alerts (id, customer_id, type, severity, status, threshold, title, message, health_score_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    alert_id,
                    required(body, "customer_id"),
                    body.get("type", "manual"),
                    body.get("severity", "medium"),
                    body.get("status", "open"),
                    int(body.get("threshold", 40)),
                    required(body, "title"),
                    required(body, "message"),
                    body.get("health_score_id"),
                ),
            )
            conn.commit()
            return self._json({"data": get_by_id(conn, "alerts", alert_id)}, HTTPStatus.CREATED)
        return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)

    def _alert_detail(self, conn: Connection, method: str, alert_id: str, user: Any) -> None:
        if not get_by_id(conn, "alerts", alert_id):
            return self._json({"error": "Alert not found"}, HTTPStatus.NOT_FOUND)
        if method == "GET":
            self._require_permission(user, "read")
            return self._json({"data": get_by_id(conn, "alerts", alert_id)})
        if method == "PATCH":
            self._require_permission(user, "write")
            body = parse_body(self)
            status = body.get("status")
            if status == "acknowledged":
                body["acknowledged_at"] = utc_now()
            if status == "resolved":
                body["resolved_at"] = utc_now()
            patch_table(conn, "alerts", alert_id, body, allowed={"status", "severity", "title", "message", "acknowledged_at", "resolved_at"})
            conn.commit()
            return self._json({"data": get_by_id(conn, "alerts", alert_id)})
        return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)

    def _notifications(self, conn: Connection, method: str, query: Json, user: Any) -> None:
        if method != "GET":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "read")
        status_filter = query.get("status")
        params = [status_filter] if status_filter else []
        where = "WHERE status = ?" if status_filter else ""
        rows = conn.execute(f"SELECT * FROM notifications {where} ORDER BY created_at DESC", params).fetchall()
        return self._json({"data": [row_to_dict(row) for row in rows]})

    def _notification_detail(self, conn: Connection, method: str, notification_id: str, user: Any) -> None:
        if method != "PATCH":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "notify")
        body = parse_body(self)
        if body.get("status") == "sent":
            body["sent_at"] = utc_now()
        patch_table(conn, "notifications", notification_id, body, allowed={"status", "sent_at"})
        conn.commit()
        return self._json({"data": get_by_id(conn, "notifications", notification_id)})

    def _recommendations(self, conn: Connection, method: str, query: Json, user: Any) -> None:
        if method == "GET":
            self._require_permission(user, "read")
            filters = []
            params = []
            if query.get("customer_id"):
                filters.append("customer_id = ?")
                params.append(query["customer_id"])
            if query.get("status"):
                filters.append("status = ?")
                params.append(query["status"])
            where = f"WHERE {' AND '.join(filters)}" if filters else ""
            rows = conn.execute(f"SELECT * FROM recommendations {where} ORDER BY created_at DESC", params).fetchall()
            return self._json({"data": [row_to_dict(row) for row in rows]})
        if method == "POST":
            self._require_permission(user, "write")
            body = parse_body(self)
            rec_id = body.get("id") or new_id("rec")
            conn.execute(
                """
                INSERT INTO recommendations (
                  id, customer_id, health_score_id, title, recommendation_type, priority, rationale, status, due_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    rec_id,
                    required(body, "customer_id"),
                    body.get("health_score_id"),
                    required(body, "title"),
                    body.get("recommendation_type", "manual"),
                    body.get("priority", "medium"),
                    required(body, "rationale"),
                    body.get("status", "open"),
                    body.get("due_at"),
                ),
            )
            conn.commit()
            return self._json({"data": get_by_id(conn, "recommendations", rec_id)}, HTTPStatus.CREATED)
        return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)

    def _recommendation_detail(self, conn: Connection, method: str, rec_id: str, user: Any) -> None:
        if not get_by_id(conn, "recommendations", rec_id):
            return self._json({"error": "Recommendation not found"}, HTTPStatus.NOT_FOUND)
        if method != "PATCH":
            return self._json({"error": "Method not allowed"}, HTTPStatus.METHOD_NOT_ALLOWED)
        self._require_permission(user, "write")
        patch_table(conn, "recommendations", rec_id, parse_body(self), allowed={"title", "priority", "rationale", "status", "due_at"})
        conn.commit()
        return self._json({"data": get_by_id(conn, "recommendations", rec_id)})

    def _export_report(self, conn: Connection, query: Json) -> None:
        rows = portfolio_rows(conn)
        file_format = query.get("format", "csv").lower()
        if file_format == "xlsx":
            content = build_xlsx(rows)
            self.send_response(HTTPStatus.OK)
            self._cors_headers()
            self.send_header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            self.send_header("Content-Disposition", "attachment; filename=customer-health-report.xlsx")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["id", "name", "status", "plan_name", "score", "health_status", "open_alerts"])
        writer.writeheader()
        writer.writerows(rows)
        content = output.getvalue().encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self._cors_headers()
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", "attachment; filename=customer-health-report.csv")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def _require_auth(self, conn: Connection):
        user = get_user_for_token(conn, token_from_headers(self))
        if not user:
            raise PermissionError("Authentication required")
        return user

    def _require_permission(self, user: Any, permission: str) -> None:
        if not has_permission(user["role_name"], permission):
            raise PermissionError(f"Missing permission: {permission}")

    def _json(self, payload: Json, status: HTTPStatus = HTTPStatus.OK) -> None:
        content = json.dumps(payload, default=str).encode("utf-8")
        self.send_response(status)
        self._cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def _cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", os.environ.get("CUSTOMER_HEALTH_ALLOWED_ORIGIN", "*"))
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")

    def log_message(self, fmt: str, *args: Any) -> None:
        if os.environ.get("CUSTOMER_HEALTH_LOG_REQUESTS") == "1":
            super().log_message(fmt, *args)


def required(body: Json, key: str) -> Any:
    value = body.get(key)
    if value is None or value == "":
        raise ValueError(f"Missing required field: {key}")
    return value


def public_user(row: Any) -> Json:
    keys = row.keys()
    full_name = row["full_name"] if "full_name" in keys and row["full_name"] else row["name"]
    return {
        "id": row["id"],
        "email": row["email"],
        "name": full_name,
        "full_name": full_name,
        "role": row["role_name"],
        "is_active": bool(row["is_active"]),
    }


def user_with_role(conn: Connection, user_id: str):
    return conn.execute(
        """
        SELECT users.*, roles.name AS role_name
        FROM users
        JOIN roles ON roles.id = users.role_id
        WHERE users.id = ?
        """,
        (user_id,),
    ).fetchone()


def validate_email(email: str) -> None:
    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        raise ValueError("A valid email address is required")


def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not any(char.islower() for char in password):
        raise ValueError("Password must include a lowercase letter")
    if not any(char.isupper() for char in password):
        raise ValueError("Password must include an uppercase letter")
    if not any(char.isdigit() for char in password):
        raise ValueError("Password must include a number")
    if not any(not char.isalnum() for char in password):
        raise ValueError("Password must include a symbol")


def get_by_id(conn: Connection, table: str, entity_id: str) -> Json | None:
    row = conn.execute(f"SELECT * FROM {table} WHERE id = ?", (entity_id,)).fetchone()
    return row_to_dict(row) if row else None


def patch_table(conn: Connection, table: str, entity_id: str, body: Json, allowed: set[str]) -> None:
    fields = {key: value for key, value in body.items() if key in allowed}
    if not fields:
        raise ValueError("No supported fields supplied")
    fields["updated_at"] = "CURRENT_TIMESTAMP" if table in {"customers", "subscriptions", "support_tickets", "recommendations"} else None
    assignments = []
    values = []
    for key, value in fields.items():
        if value == "CURRENT_TIMESTAMP":
            assignments.append(f"{key} = CURRENT_TIMESTAMP")
        elif value is not None:
            assignments.append(f"{key} = ?")
            values.append(value)
    values.append(entity_id)
    conn.execute(f"UPDATE {table} SET {', '.join(assignments)} WHERE id = ?", values)


def score_to_status(score: int) -> str:
    if score < 40:
        return "red"
    if score < 70:
        return "amber"
    return "green"


def audit(conn: Connection, actor_user_id: str | None, action: str, entity_type: str, entity_id: str, metadata: Json) -> None:
    conn.execute(
        """
        INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (new_id("audit"), actor_user_id, action, entity_type, entity_id, json.dumps(metadata)),
    )


def health_trend_report(conn: Connection, query: Json) -> list[Json]:
    filters = []
    params: list[Any] = []
    if query.get("customer_id"):
        filters.append("health_scores.customer_id = ?")
        params.append(query["customer_id"])
    where = f"WHERE {' AND '.join(filters)}" if filters else ""
    rows = conn.execute(
        f"""
        SELECT customers.name AS customer_name, health_scores.*
        FROM health_scores
        JOIN customers ON customers.id = health_scores.customer_id
        {where}
        ORDER BY health_scores.calculated_at DESC
        """,
        params,
    ).fetchall()
    return [row_to_dict(row) for row in rows]


def health_distribution_report(conn: Connection) -> Json:
    rows = conn.execute(
        """
        SELECT health_status, COUNT(*) AS count
        FROM customers
        WHERE status != 'deleted'
        GROUP BY health_status
        """
    ).fetchall()
    return {row["health_status"]: row["count"] for row in rows}


def portfolio_rows(conn: Connection) -> list[Json]:
    rows = conn.execute(
        """
        SELECT
          customers.id,
          customers.name,
          customers.status,
          subscriptions.plan_name,
          customers.current_health_score AS score,
          customers.health_status,
          COUNT(alerts.id) AS open_alerts
        FROM customers
        LEFT JOIN subscriptions ON subscriptions.customer_id = customers.id
        LEFT JOIN alerts ON alerts.customer_id = customers.id AND alerts.status != 'resolved'
        WHERE customers.status != 'deleted'
        GROUP BY customers.id, subscriptions.plan_name
        ORDER BY customers.current_health_score ASC
        """
    ).fetchall()
    return [row_to_dict(row) for row in rows]


def build_xlsx(rows: list[Json]) -> bytes:
    headers = ["id", "name", "status", "plan_name", "score", "health_status", "open_alerts"]

    def cell(value: Any) -> str:
        if isinstance(value, (int, float)):
            return f"<c><v>{value}</v></c>"
        return f'<c t="inlineStr"><is><t>{escape(str(value or ""))}</t></is></c>'

    xml_rows = []
    xml_rows.append("<row>" + "".join(cell(header) for header in headers) + "</row>")
    for row in rows:
        xml_rows.append("<row>" + "".join(cell(row.get(header, "")) for header in headers) + "</row>")

    worksheet = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        "<sheetData>"
        + "".join(xml_rows)
        + "</sheetData></worksheet>"
    )
    workbook = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<sheets><sheet name="Customer Health" sheetId="1" r:id="rId1"/></sheets></workbook>'
    )
    workbook_rels = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        "</Relationships>"
    )
    root_rels = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        "</Relationships>"
    )
    content_types = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        "</Types>"
    )
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", root_rels)
        archive.writestr("xl/workbook.xml", workbook)
        archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        archive.writestr("xl/worksheets/sheet1.xml", worksheet)
    return out.getvalue()


def make_handler(db_path: str | Path) -> type[CustomerHealthApi]:
    class BoundCustomerHealthApi(CustomerHealthApi):
        pass

    BoundCustomerHealthApi.db_path = Path(db_path)
    return BoundCustomerHealthApi


def run_server(host: str = "127.0.0.1", port: int = 8181, db_path: str | Path | None = None) -> ThreadingHTTPServer:
    path = Path(db_path or os.environ.get("CUSTOMER_HEALTH_DB", DEFAULT_DB_PATH))
    initialize_database(path).close()
    server = ThreadingHTTPServer((host, port), make_handler(path))
    return server
