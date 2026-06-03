from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from sqlite3 import Connection

from .auth import hash_password


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = PACKAGE_ROOT.parent
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "customer_health.sqlite3"
MIGRATIONS_DIR = PACKAGE_ROOT / "migrations"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:16]}"


def connect(db_path: str | Path | None = None) -> Connection:
    path = Path(db_path) if db_path else DEFAULT_DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def apply_migrations(conn: Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version TEXT PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    for migration in sorted(MIGRATIONS_DIR.glob("*.sql")):
        version = migration.name
        exists = conn.execute("SELECT 1 FROM schema_migrations WHERE version = ?", (version,)).fetchone()
        if exists:
            continue
        conn.executescript(migration.read_text(encoding="utf-8"))
        conn.execute("INSERT INTO schema_migrations (version) VALUES (?)", (version,))
    conn.commit()


def initialize_database(db_path: str | Path | None = None, seed: bool = True) -> Connection:
    conn = connect(db_path)
    apply_migrations(conn)
    if seed:
        seed_demo_data(conn)
    return conn


def seed_demo_data(conn: Connection) -> None:
    if conn.execute("SELECT COUNT(*) AS count FROM roles").fetchone()["count"]:
        return

    roles = [
        ("role_admin", "admin", "Full access to customer health settings and all records."),
        ("role_manager", "manager", "Can manage customers, scores, alerts, and recommendations."),
        ("role_analyst", "analyst", "Can read portfolio data, run scoring, and export reports."),
        ("role_support", "support", "Can update customer activity and support data."),
        ("role_viewer", "viewer", "Read-only portfolio access."),
    ]
    conn.executemany("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)", roles)

    users = [
        ("user_admin", "role_admin", "admin@customerhealth.test", "Admin User", hash_password("Admin@123")),
        ("user_manager", "role_manager", "manager@customerhealth.test", "Maya Manager", hash_password("Manager@123")),
        ("user_analyst", "role_analyst", "analyst@customerhealth.test", "Ayaan Analyst", hash_password("Analyst@123")),
        ("user_support", "role_support", "support@customerhealth.test", "Sam Support", hash_password("Support@123")),
    ]
    conn.executemany(
        "INSERT INTO users (id, role_id, email, name, password_hash) VALUES (?, ?, ?, ?, ?)",
        users,
    )
    conn.execute("UPDATE users SET full_name = name WHERE full_name IS NULL")

    customers = [
        ("cust_kestrel", "Kestrel Financial", "KES-001", "active", "live", "red", 28, "user_manager"),
        ("cust_northstar", "Northstar Retail", "NSR-002", "active", "live", "red", 34, "user_manager"),
        ("cust_brightline", "Brightline Logistics", "BRL-003", "active", "live", "amber", 41, "user_manager"),
        ("cust_vertex", "Vertex Health Systems", "VTX-004", "active", "onboarding", "amber", 56, "user_analyst"),
        ("cust_meridian", "Meridian Education", "MER-005", "active", "live", "green", 88, "user_analyst"),
    ]
    conn.executemany(
        """
        INSERT INTO customers
          (id, name, external_ref, status, lifecycle_stage, health_status, current_health_score, owner_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        customers,
    )

    subscriptions = [
        ("sub_kestrel", "cust_kestrel", "Enterprise", "past_due", 18500, "2025-06-01", "2026-06-14", None),
        ("sub_northstar", "cust_northstar", "Enterprise", "active", 14200, "2025-08-01", "2026-08-28", None),
        ("sub_brightline", "cust_brightline", "Growth", "active", 9200, "2025-09-15", "2026-07-17", None),
        ("sub_vertex", "cust_vertex", "Enterprise", "trialing", 11800, "2026-04-01", "2026-09-10", None),
        ("sub_meridian", "cust_meridian", "Standard", "active", 6200, "2025-10-01", "2026-12-01", None),
    ]
    conn.executemany(
        """
        INSERT INTO subscriptions
          (id, customer_id, plan_name, status, monthly_recurring_revenue, started_at, renews_at, canceled_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        subscriptions,
    )

    weights = [
        ("weight_login", "login_frequency", "Login frequency", 0.25, 1, {"target_logins_30d": 20}),
        ("weight_feature", "feature_usage", "Feature usage", 0.30, 1, {"target_events_30d": 150, "target_features_30d": 5}),
        ("weight_support", "support_tickets", "Support tickets", 0.25, 1, {"open_ticket_penalty": 8, "critical_ticket_penalty": 18}),
        ("weight_subscription", "subscription_status", "Subscription status", 0.20, 1, {"past_due_score": 30, "active_score": 95}),
    ]
    conn.executemany(
        """
        INSERT INTO scoring_weights (id, metric_key, display_name, weight, enabled, config_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        [(id_, key, name, weight, enabled, json.dumps(config)) for id_, key, name, weight, enabled, config in weights],
    )

    activities = [
        ("act_kes_1", "cust_kestrel", "login", "2026-05-22T09:00:00+00:00", {"actor": "client_lead"}),
        ("act_kes_2", "cust_kestrel", "login", "2026-05-19T11:00:00+00:00", {"actor": "client_admin"}),
        ("act_nsr_1", "cust_northstar", "login", "2026-05-22T08:00:00+00:00", {}),
        ("act_nsr_2", "cust_northstar", "login", "2026-05-21T08:00:00+00:00", {}),
        ("act_nsr_3", "cust_northstar", "login", "2026-05-20T08:00:00+00:00", {}),
        ("act_brl_1", "cust_brightline", "login", "2026-05-22T08:30:00+00:00", {}),
        ("act_vtx_1", "cust_vertex", "login", "2026-05-22T07:42:00+00:00", {}),
        ("act_mer_1", "cust_meridian", "login", "2026-05-22T07:00:00+00:00", {}),
    ]
    conn.executemany(
        "INSERT INTO customer_activities (id, customer_id, activity_type, occurred_at, metadata_json) VALUES (?, ?, ?, ?, ?)",
        [(id_, customer, type_, at, json.dumps(meta)) for id_, customer, type_, at, meta in activities],
    )

    feature_rows = [
        ("usage_kes", "cust_kestrel", "compliance_workflow", 24, 3, "2026-05-22T00:00:00+00:00"),
        ("usage_nsr", "cust_northstar", "mobile_analytics", 44, 8, "2026-05-22T00:00:00+00:00"),
        ("usage_brl", "cust_brightline", "dispatch_api", 63, 6, "2026-05-22T00:00:00+00:00"),
        ("usage_vtx", "cust_vertex", "ehr_mapping", 88, 9, "2026-05-22T00:00:00+00:00"),
        ("usage_mer", "cust_meridian", "student_portal", 188, 18, "2026-05-22T00:00:00+00:00"),
    ]
    conn.executemany(
        """
        INSERT INTO feature_usage (id, customer_id, feature_key, usage_count, active_users, measured_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        feature_rows,
    )

    tickets = [
        ("ticket_kes_1", "cust_kestrel", "K-847", "Auth module review concerns", "open", "critical", None, "2026-05-17T10:00:00+00:00", None),
        ("ticket_kes_2", "cust_kestrel", "K-851", "Month-end milestone blocker", "open", "high", None, "2026-05-20T10:00:00+00:00", None),
        ("ticket_nsr_1", "cust_northstar", "N-220", "Checkout analytics scope", "open", "high", None, "2026-05-20T08:00:00+00:00", None),
        ("ticket_brl_1", "cust_brightline", "B-310", "Dispatch API sign-off", "open", "medium", None, "2026-05-19T09:30:00+00:00", None),
        ("ticket_vtx_1", "cust_vertex", "V-144", "EHR blockers", "open", "medium", None, "2026-05-15T08:00:00+00:00", None),
        ("ticket_mer_1", "cust_meridian", "M-010", "Support request closed", "closed", "low", 94, "2026-05-10T08:00:00+00:00", "2026-05-11T08:00:00+00:00"),
    ]
    conn.executemany(
        """
        INSERT INTO support_tickets
          (id, customer_id, external_ref, subject, status, priority, satisfaction_score, opened_at, closed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        tickets,
    )

    conn.commit()
