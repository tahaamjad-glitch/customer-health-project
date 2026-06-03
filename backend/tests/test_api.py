from __future__ import annotations

import http.client
import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from typing import Any

from backend.customer_health.api import make_handler
from backend.customer_health.database import initialize_database
from backend.customer_health.project_import import MAX_IMPORT_BYTES


TEST_DATA_DIR = Path(__file__).resolve().parents[1] / "test-data"


def reset_db(name: str) -> Path:
    TEST_DATA_DIR.mkdir(parents=True, exist_ok=True)
    db_path = TEST_DATA_DIR / name
    for candidate in [db_path, Path(f"{db_path}-wal"), Path(f"{db_path}-shm")]:
        if candidate.exists():
            candidate.unlink()
    return db_path


class ApiTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.db_path = reset_db(f"{self._testMethodName}.sqlite3")
        initialize_database(self.db_path).close()
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(self.db_path))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.host, self.port = self.server.server_address
        self.admin_token = self.login("admin@customerhealth.test", "Admin@123")
        self.analyst_token = self.login("analyst@customerhealth.test", "Analyst@123")

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        for candidate in [self.db_path, Path(f"{self.db_path}-wal"), Path(f"{self.db_path}-shm")]:
            if candidate.exists():
                candidate.unlink()

    def request(self, method: str, path: str, body: dict[str, Any] | None = None, token: str | None = None) -> tuple[int, Any, dict[str, str]]:
        conn = http.client.HTTPConnection(self.host, self.port, timeout=10)
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        payload = json.dumps(body).encode("utf-8") if body is not None else None
        conn.request(method, path, body=payload, headers=headers)
        response = conn.getresponse()
        raw = response.read()
        response_headers = {key: value for key, value in response.getheaders()}
        conn.close()
        content_type = response_headers.get("Content-Type", "")
        if "application/json" in content_type:
            return response.status, json.loads(raw.decode("utf-8")), response_headers
        return response.status, raw, response_headers

    def request_raw(self, method: str, path: str, raw_body: bytes, content_type: str, token: str | None = None) -> tuple[int, Any, dict[str, str]]:
        conn = http.client.HTTPConnection(self.host, self.port, timeout=10)
        headers = {"Content-Type": content_type}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        conn.request(method, path, body=raw_body, headers=headers)
        response = conn.getresponse()
        raw = response.read()
        response_headers = {key: value for key, value in response.getheaders()}
        conn.close()
        content_type_header = response_headers.get("Content-Type", "")
        if "application/json" in content_type_header:
            return response.status, json.loads(raw.decode("utf-8")), response_headers
        return response.status, raw, response_headers

    def login(self, email: str, password: str) -> str:
        status, payload, _ = self.request("POST", "/api/auth/login", {"email": email, "password": password})
        self.assertEqual(status, 200)
        return payload["token"]

    def test_health_and_auth_me(self) -> None:
        status, payload, _ = self.request("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(payload["status"], "ok")

        status, payload, _ = self.request("GET", "/api/auth/me", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["user"]["role"], "admin")

    def test_register_duplicate_and_logout(self) -> None:
        body = {
            "full_name": "Nadia Viewer",
            "email": "nadia.viewer@example.test",
            "password": "Viewer@123",
            "confirm_password": "Viewer@123",
        }
        status, payload, _ = self.request("POST", "/api/auth/register", body)
        self.assertEqual(status, 201)
        self.assertEqual(payload["user"]["role"], "viewer")
        token = payload["token"]

        status, _, _ = self.request("POST", "/api/auth/register", body)
        self.assertEqual(status, 409)

        status, _, _ = self.request("POST", "/api/auth/logout", token=token)
        self.assertEqual(status, 200)

        status, _, _ = self.request("GET", "/api/auth/me", token=token)
        self.assertEqual(status, 403)

    def test_registration_validates_password_strength(self) -> None:
        status, payload, _ = self.request(
            "POST",
            "/api/auth/register",
            {
                "full_name": "Weak Password",
                "email": "weak@example.test",
                "password": "weak",
                "confirm_password": "weak",
            },
        )
        self.assertEqual(status, 400)
        self.assertIn("Password", payload["error"])

    def test_forgot_and_reset_password_flow(self) -> None:
        register_body = {
            "full_name": "Reset User",
            "email": "reset.user@example.test",
            "password": "OldPass@123",
            "confirm_password": "OldPass@123",
        }
        status, _, _ = self.request("POST", "/api/auth/register", register_body)
        self.assertEqual(status, 201)

        status, payload, _ = self.request("POST", "/api/auth/forgot-password", {"email": "reset.user@example.test"})
        self.assertEqual(status, 200)
        self.assertIn("reset_token", payload)

        status, _, _ = self.request(
            "POST",
            "/api/auth/reset-password",
            {"token": payload["reset_token"], "password": "NewPass@123", "confirm_password": "NewPass@123"},
        )
        self.assertEqual(status, 200)

        status, _, _ = self.request("POST", "/api/auth/login", {"email": "reset.user@example.test", "password": "OldPass@123"})
        self.assertEqual(status, 401)
        status, login_payload, _ = self.request("POST", "/api/auth/login", {"email": "reset.user@example.test", "password": "NewPass@123"})
        self.assertEqual(status, 200)
        self.assertEqual(login_payload["user"]["email"], "reset.user@example.test")

    def test_admin_can_list_and_disable_users(self) -> None:
        status, payload, _ = self.request("GET", "/api/users", token=self.admin_token)
        self.assertEqual(status, 200)
        analyst = next(user for user in payload["data"] if user["email"] == "analyst@customerhealth.test")

        status, patched, _ = self.request("PATCH", f"/api/users/{analyst['id']}", {"is_active": False}, token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertFalse(patched["data"]["is_active"])

        status, _, _ = self.request("POST", "/api/auth/login", {"email": "analyst@customerhealth.test", "password": "Analyst@123"})
        self.assertEqual(status, 401)

    def test_customers_filters_and_rbac(self) -> None:
        status, payload, _ = self.request("GET", "/api/customers?status=active&health_max=50", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(payload["data"]), 3)

        status, _, _ = self.request("POST", "/api/customers", {"name": "No Write Customer"}, token=self.analyst_token)
        self.assertEqual(status, 403)

    def test_project_import_valid_csv(self) -> None:
        csv_body = (
            "external_ref,customer_id,name,stage,project_manager,director,health_score,jira_risk,delivery_risk,milestone_confidence,active_signals,open_actions,next_milestone,due_date\n"
            "JIRA-KES-100,cust_kestrel,Compliance Portal Recovery,delivery,Hassan Ali,Fatima Raza,64,medium,42,70,4,3,UAT readiness,2026-07-15\n"
        ).encode("utf-8")
        status, payload, _ = self.request_raw("POST", "/api/projects/import?format=csv", csv_body, "text/csv", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["created"], 1)
        self.assertEqual(payload["updated"], 0)
        self.assertEqual(payload["failed"], 0)

        status, projects, _ = self.request("GET", "/api/projects", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertTrue(any(project["external_ref"] == "JIRA-KES-100" for project in projects["data"]))

    def test_project_import_valid_json(self) -> None:
        body = [
            {
                "externalRef": "JIRA-NS-200",
                "customerId": "cust_northstar",
                "name": "Mobile App Revamp Import",
                "stage": "delivery",
                "projectManager": "Sarah Khan",
                "director": "Omar Farooq",
                "healthScore": 72,
                "jiraRisk": "medium",
                "deliveryRisk": 35,
                "milestoneConfidence": 78,
                "activeSignals": 3,
                "openActions": 2,
                "nextMilestone": "UAT sign-off",
                "dueDate": "2026-07-20",
            }
        ]
        status, payload, _ = self.request_raw("POST", "/api/projects/import", json.dumps(body).encode("utf-8"), "application/json", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["created"], 1)
        self.assertEqual(payload["rows"][0]["project"]["health_status"], "green")

    def test_project_import_missing_required_fields(self) -> None:
        csv_body = "customer_id,name\ncust_kestrel,Incomplete Project\n".encode("utf-8")
        status, payload, _ = self.request_raw("POST", "/api/projects/import?format=csv", csv_body, "text/csv", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["created"], 0)
        self.assertEqual(payload["failed"], 1)
        self.assertTrue(any("Missing required field" in error["message"] for error in payload["errors"]))

    def test_project_import_invalid_date(self) -> None:
        csv_body = (
            "external_ref,customer_id,name,stage,project_manager,director,health_score,jira_risk,delivery_risk,milestone_confidence,active_signals,open_actions,next_milestone,due_date\n"
            "JIRA-BAD-DATE,cust_kestrel,Bad Date Project,delivery,Hassan Ali,Fatima Raza,64,medium,42,70,4,3,UAT readiness,07/15/2026\n"
        ).encode("utf-8")
        status, payload, _ = self.request_raw("POST", "/api/projects/import?format=csv", csv_body, "text/csv", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["failed"], 1)
        self.assertIn("due_date", payload["errors"][0]["message"])

    def test_project_import_duplicates_update_and_conflict(self) -> None:
        csv_body = (
            "external_ref,customer_id,name,stage,project_manager,director,health_score,jira_risk,delivery_risk,milestone_confidence,active_signals,open_actions,next_milestone,due_date\n"
            "JIRA-DUP-1,cust_kestrel,Duplicate Project,delivery,Hassan Ali,Fatima Raza,64,medium,42,70,4,3,UAT readiness,2026-07-15\n"
        ).encode("utf-8")
        status, payload, _ = self.request_raw("POST", "/api/projects/import?format=csv", csv_body, "text/csv", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["created"], 1)

        updated_body = csv_body.replace(b",64,", b",82,")
        status, payload, _ = self.request_raw("POST", "/api/projects/import?format=csv", updated_body, "text/csv", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["updated"], 1)
        self.assertEqual(payload["rows"][0]["project"]["health_score"], 82)

        conflict_body = csv_body.replace(b"cust_kestrel", b"cust_northstar")
        status, payload, _ = self.request_raw("POST", "/api/projects/import?format=csv", conflict_body, "text/csv", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["failed"], 1)
        self.assertIn("another customer", payload["errors"][0]["message"])

    def test_project_import_partial_failures(self) -> None:
        csv_body = (
            "external_ref,customer_id,name,stage,project_manager,director,health_score,jira_risk,delivery_risk,milestone_confidence,active_signals,open_actions,next_milestone,due_date\n"
            "JIRA-PARTIAL-1,cust_vertex,EHR Interface Upgrade,delivery,Amanda Lee,Fatima Raza,71,medium,34,75,3,2,Interface mapping,2026-08-01\n"
            "JIRA-PARTIAL-2,cust_vertex,Invalid Score,delivery,Amanda Lee,Fatima Raza,120,medium,34,75,3,2,Interface mapping,2026-08-01\n"
        ).encode("utf-8")
        status, payload, _ = self.request_raw("POST", "/api/projects/import?format=csv", csv_body, "text/csv", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["created"], 1)
        self.assertEqual(payload["failed"], 1)

    def test_project_import_large_file_limit(self) -> None:
        raw = b"x" * (MAX_IMPORT_BYTES + 1)
        status, payload, _ = self.request_raw("POST", "/api/projects/import?format=csv", raw, "text/csv", token=self.admin_token)
        self.assertEqual(status, 413)
        self.assertIn("exceeds", payload["error"])

    def test_recalculate_customer_creates_alert_and_notifications(self) -> None:
        status, payload, _ = self.request("POST", "/api/customers/cust_kestrel/health-score/recalculate", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(payload["data"]["health_status"], "red")
        self.assertTrue(payload["data"]["alerts"])

        status, alerts, _ = self.request("GET", "/api/alerts?customer_id=cust_kestrel", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(alerts["data"]), 1)

        status, notifications, _ = self.request("GET", "/api/notifications?status=queued", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(notifications["data"]), 1)

    def test_scoring_weights_are_admin_configurable(self) -> None:
        status, payload, _ = self.request("GET", "/api/scoring-weights", token=self.admin_token)
        self.assertEqual(status, 200)
        weight_id = next(item["id"] for item in payload["data"] if item["metric_key"] == "subscription_status")

        status, updated, _ = self.request("PATCH", f"/api/scoring-weights/{weight_id}", {"weight": 0.5}, token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertEqual(updated["data"]["weight"], 0.5)

    def test_report_exports_csv_and_xlsx(self) -> None:
        status, payload, headers = self.request("GET", "/api/reports/export?format=csv", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertIn("text/csv", headers["Content-Type"])
        self.assertIn(b"Kestrel Financial", payload)

        status, payload, headers = self.request("GET", "/api/reports/export?format=xlsx", token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertIn("spreadsheetml", headers["Content-Type"])
        self.assertTrue(payload.startswith(b"PK"))


if __name__ == "__main__":
    unittest.main()
