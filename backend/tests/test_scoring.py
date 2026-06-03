from __future__ import annotations

import unittest
from contextlib import closing
from pathlib import Path

from backend.customer_health.database import initialize_database
from backend.customer_health.models import ScoreInput
from backend.customer_health.scoring import calculate_score, recalculate_customer


TEST_DATA_DIR = Path(__file__).resolve().parents[1] / "test-data"


def reset_db(name: str) -> Path:
    TEST_DATA_DIR.mkdir(parents=True, exist_ok=True)
    db_path = TEST_DATA_DIR / name
    for candidate in [db_path, Path(f"{db_path}-wal"), Path(f"{db_path}-shm")]:
        if candidate.exists():
            candidate.unlink()
    return db_path


class ScoringEngineTest(unittest.TestCase):
    def test_calculates_red_score_for_low_usage_and_past_due_subscription(self) -> None:
        result = calculate_score(
            ScoreInput(
                customer_id="cust_test",
                login_count_30d=1,
                active_feature_count_30d=1,
                feature_event_count_30d=8,
                open_ticket_count=4,
                critical_ticket_count=2,
                average_ticket_satisfaction=40,
                subscription_status="past_due",
            )
        )

        self.assertLess(result.score, 40)
        self.assertEqual(result.health_status, "red")
        self.assertIn("support_tickets", result.components)
        self.assertTrue(result.explanation["drivers"])

    def test_weight_changes_affect_final_score(self) -> None:
        score_input = ScoreInput(
            customer_id="cust_test",
            login_count_30d=20,
            active_feature_count_30d=5,
            feature_event_count_30d=150,
            open_ticket_count=0,
            critical_ticket_count=0,
            average_ticket_satisfaction=95,
            subscription_status="past_due",
        )
        balanced = calculate_score(score_input)
        subscription_heavy = calculate_score(
            score_input,
            {
                "login_frequency": {"weight": 0.05, "config": {"target_logins_30d": 20}},
                "feature_usage": {"weight": 0.05, "config": {"target_events_30d": 150, "target_features_30d": 5}},
                "support_tickets": {"weight": 0.05, "config": {}},
                "subscription_status": {"weight": 0.85, "config": {"past_due_score": 20}},
            },
        )

        self.assertLess(subscription_heavy.score, balanced.score)

    def test_recalculate_persists_score_alert_and_recommendations(self) -> None:
        db_path = reset_db("scoring.sqlite3")
        try:
            with closing(initialize_database(db_path)) as conn:
                result = recalculate_customer(conn, "cust_kestrel")
                score_count = conn.execute("SELECT COUNT(*) AS count FROM health_scores WHERE customer_id = 'cust_kestrel'").fetchone()[
                    "count"
                ]
                alert_count = conn.execute("SELECT COUNT(*) AS count FROM alerts WHERE customer_id = 'cust_kestrel'").fetchone()["count"]
                recommendation_count = conn.execute(
                    "SELECT COUNT(*) AS count FROM recommendations WHERE customer_id = 'cust_kestrel'"
                ).fetchone()["count"]

            self.assertEqual(score_count, 1)
            self.assertGreaterEqual(alert_count, 1)
            self.assertGreaterEqual(recommendation_count, 1)
            self.assertEqual(result["health_status"], "red")
        finally:
            for candidate in [db_path, Path(f"{db_path}-wal"), Path(f"{db_path}-shm")]:
                if candidate.exists():
                    candidate.unlink()


if __name__ == "__main__":
    unittest.main()
