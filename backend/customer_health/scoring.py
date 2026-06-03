from __future__ import annotations

import json
from sqlite3 import Connection
from typing import Any

from .database import new_id, utc_now
from .models import ScoreBreakdown, ScoreInput


def health_status(score: int) -> str:
    if score < 40:
        return "red"
    if score < 70:
        return "amber"
    return "green"


def clamp_score(value: float) -> int:
    return max(0, min(100, round(value)))


def load_weights(conn: Connection) -> dict[str, dict[str, Any]]:
    rows = conn.execute("SELECT * FROM scoring_weights WHERE enabled = 1").fetchall()
    weights: dict[str, dict[str, Any]] = {}
    for row in rows:
        weights[row["metric_key"]] = {
            "weight": float(row["weight"]),
            "config": json.loads(row["config_json"] or "{}"),
        }
    return weights


def normalize_weights(weights: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    total = sum(item["weight"] for item in weights.values())
    if total <= 0:
        return weights
    return {key: {**value, "weight": value["weight"] / total} for key, value in weights.items()}


def calculate_score(score_input: ScoreInput, weights: dict[str, dict[str, Any]] | None = None) -> ScoreBreakdown:
    weights = normalize_weights(
        weights
        or {
            "login_frequency": {"weight": 0.25, "config": {"target_logins_30d": 20}},
            "feature_usage": {"weight": 0.30, "config": {"target_events_30d": 150, "target_features_30d": 5}},
            "support_tickets": {"weight": 0.25, "config": {"open_ticket_penalty": 8, "critical_ticket_penalty": 18}},
            "subscription_status": {"weight": 0.20, "config": {"past_due_score": 30, "active_score": 95}},
        }
    )

    login_config = weights.get("login_frequency", {}).get("config", {})
    target_logins = max(1, int(login_config.get("target_logins_30d", 20)))
    login_score = clamp_score((score_input.login_count_30d / target_logins) * 100)

    feature_config = weights.get("feature_usage", {}).get("config", {})
    target_events = max(1, int(feature_config.get("target_events_30d", 150)))
    target_features = max(1, int(feature_config.get("target_features_30d", 5)))
    event_score = (score_input.feature_event_count_30d / target_events) * 100
    breadth_score = (score_input.active_feature_count_30d / target_features) * 100
    feature_usage_score = clamp_score((event_score * 0.7) + (breadth_score * 0.3))

    support_config = weights.get("support_tickets", {}).get("config", {})
    open_ticket_penalty = float(support_config.get("open_ticket_penalty", 8))
    critical_ticket_penalty = float(support_config.get("critical_ticket_penalty", 18))
    support_score_raw = 100 - (score_input.open_ticket_count * open_ticket_penalty) - (
        score_input.critical_ticket_count * critical_ticket_penalty
    )
    if score_input.average_ticket_satisfaction is not None:
        support_score_raw = (support_score_raw * 0.75) + (score_input.average_ticket_satisfaction * 0.25)
    support_score = clamp_score(support_score_raw)

    subscription_config = weights.get("subscription_status", {}).get("config", {})
    subscription_status = score_input.subscription_status.lower()
    subscription_scores = {
        "active": float(subscription_config.get("active_score", 95)),
        "trialing": float(subscription_config.get("trialing_score", 75)),
        "past_due": float(subscription_config.get("past_due_score", 30)),
        "paused": float(subscription_config.get("paused_score", 40)),
        "canceled": float(subscription_config.get("canceled_score", 0)),
    }
    subscription_score = clamp_score(subscription_scores.get(subscription_status, 50))

    components = {
        "login_frequency": login_score,
        "feature_usage": feature_usage_score,
        "support_tickets": support_score,
        "subscription_status": subscription_score,
    }
    weighted_score = 0.0
    for key, component_score in components.items():
        weighted_score += component_score * weights.get(key, {"weight": 0})["weight"]

    score = clamp_score(weighted_score)
    explanation = {
        "inputs": score_input.__dict__,
        "weights": {key: value["weight"] for key, value in weights.items()},
        "drivers": build_drivers(components, score_input),
    }
    return ScoreBreakdown(score=score, health_status=health_status(score), components=components, explanation=explanation)


def build_drivers(components: dict[str, int], score_input: ScoreInput) -> list[str]:
    drivers: list[str] = []
    if components["login_frequency"] < 50:
        drivers.append("Login frequency is below the configured 30-day target.")
    if components["feature_usage"] < 50:
        drivers.append("Feature usage breadth or event volume is below the configured target.")
    if score_input.open_ticket_count > 0:
        drivers.append(f"{score_input.open_ticket_count} open support ticket(s) are reducing the support score.")
    if score_input.critical_ticket_count > 0:
        drivers.append(f"{score_input.critical_ticket_count} critical ticket(s) are adding extra risk.")
    if score_input.subscription_status in {"past_due", "paused", "canceled"}:
        drivers.append(f"Subscription status is {score_input.subscription_status}.")
    if not drivers:
        drivers.append("Customer activity, support, and subscription signals are within target range.")
    return drivers


def collect_score_input(conn: Connection, customer_id: str) -> ScoreInput:
    login_count = conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM customer_activities
        WHERE customer_id = ?
          AND activity_type = 'login'
          AND occurred_at >= datetime('now', '-30 days')
        """,
        (customer_id,),
    ).fetchone()["count"]
    feature_row = conn.execute(
        """
        SELECT
          COUNT(DISTINCT feature_key) AS feature_count,
          COALESCE(SUM(usage_count), 0) AS event_count
        FROM feature_usage
        WHERE customer_id = ?
          AND measured_at >= datetime('now', '-30 days')
        """,
        (customer_id,),
    ).fetchone()
    ticket_row = conn.execute(
        """
        SELECT
          SUM(CASE WHEN status != 'closed' THEN 1 ELSE 0 END) AS open_count,
          SUM(CASE WHEN status != 'closed' AND priority = 'critical' THEN 1 ELSE 0 END) AS critical_count,
          AVG(satisfaction_score) AS average_satisfaction
        FROM support_tickets
        WHERE customer_id = ?
        """,
        (customer_id,),
    ).fetchone()
    subscription_row = conn.execute(
        """
        SELECT status, plan_name
        FROM subscriptions
        WHERE customer_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (customer_id,),
    ).fetchone()

    return ScoreInput(
        customer_id=customer_id,
        login_count_30d=int(login_count or 0),
        active_feature_count_30d=int(feature_row["feature_count"] or 0),
        feature_event_count_30d=int(feature_row["event_count"] or 0),
        open_ticket_count=int(ticket_row["open_count"] or 0),
        critical_ticket_count=int(ticket_row["critical_count"] or 0),
        average_ticket_satisfaction=ticket_row["average_satisfaction"],
        subscription_status=subscription_row["status"] if subscription_row else "unknown",
        plan_name=subscription_row["plan_name"] if subscription_row else None,
    )


def calculate_for_customer(conn: Connection, customer_id: str) -> ScoreBreakdown:
    return calculate_score(collect_score_input(conn, customer_id), load_weights(conn))


def persist_health_score(conn: Connection, customer_id: str, breakdown: ScoreBreakdown) -> str:
    health_score_id = new_id("score")
    components = breakdown.components
    conn.execute(
        """
        INSERT INTO health_scores (
          id,
          customer_id,
          score,
          health_status,
          login_score,
          feature_usage_score,
          support_score,
          subscription_score,
          explanation_json,
          calculated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            health_score_id,
            customer_id,
            breakdown.score,
            breakdown.health_status,
            components["login_frequency"],
            components["feature_usage"],
            components["support_tickets"],
            components["subscription_status"],
            json.dumps(breakdown.explanation),
            utc_now(),
        ),
    )
    conn.execute(
        """
        UPDATE customers
        SET current_health_score = ?, health_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (breakdown.score, breakdown.health_status, customer_id),
    )
    conn.commit()
    return health_score_id


def recalculate_customer(conn: Connection, customer_id: str, create_alerts: bool = True) -> dict[str, Any]:
    previous = conn.execute(
        "SELECT score FROM health_scores WHERE customer_id = ? ORDER BY calculated_at DESC LIMIT 1",
        (customer_id,),
    ).fetchone()
    breakdown = calculate_for_customer(conn, customer_id)
    health_score_id = persist_health_score(conn, customer_id, breakdown)
    created_alerts: list[str] = []
    created_recommendations: list[str] = []
    if create_alerts:
        created_alerts = maybe_create_alerts(conn, customer_id, health_score_id, breakdown, previous["score"] if previous else None)
        created_recommendations = maybe_create_recommendations(conn, customer_id, health_score_id, breakdown)
    return {
        "health_score_id": health_score_id,
        "score": breakdown.score,
        "health_status": breakdown.health_status,
        "components": breakdown.components,
        "explanation": breakdown.explanation,
        "alerts": created_alerts,
        "recommendations": created_recommendations,
    }


def maybe_create_alerts(
    conn: Connection,
    customer_id: str,
    health_score_id: str,
    breakdown: ScoreBreakdown,
    previous_score: int | None,
) -> list[str]:
    alert_ids: list[str] = []
    threshold = 40
    score_drop = previous_score is not None and previous_score - breakdown.score >= 10
    if breakdown.score >= threshold and not score_drop:
        return alert_ids

    severity = "critical" if breakdown.score < 30 else "high" if breakdown.score < threshold else "medium"
    title = "Customer health score below threshold" if breakdown.score < threshold else "Customer health score dropped"
    message = "; ".join(breakdown.explanation["drivers"])
    alert_id = new_id("alert")
    conn.execute(
        """
        INSERT INTO alerts (
          id,
          customer_id,
          health_score_id,
          type,
          severity,
          status,
          threshold,
          title,
          message
        )
        VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?)
        """,
        (alert_id, customer_id, health_score_id, "health_score", severity, threshold, title, message),
    )
    alert_ids.append(alert_id)

    owner = conn.execute(
        """
        SELECT users.email, users.id
        FROM customers
        LEFT JOIN users ON users.id = customers.owner_user_id
        WHERE customers.id = ?
        """,
        (customer_id,),
    ).fetchone()
    if owner and owner["email"]:
        conn.execute(
            """
            INSERT INTO notifications (id, alert_id, user_id, channel, recipient, subject, body, status)
            VALUES (?, ?, ?, 'email', ?, ?, ?, 'queued')
            """,
            (
                new_id("notif"),
                alert_id,
                owner["id"],
                owner["email"],
                title,
                f"Health score is {breakdown.score}. {message}",
            ),
        )
    conn.commit()
    return alert_ids


def maybe_create_recommendations(
    conn: Connection,
    customer_id: str,
    health_score_id: str,
    breakdown: ScoreBreakdown,
) -> list[str]:
    if breakdown.health_status == "green":
        return []
    recommendation_ids: list[str] = []
    components = breakdown.components
    recommendations = []
    if components["login_frequency"] < 50:
        recommendations.append(("Increase executive engagement", "engagement", "high", "Schedule a stakeholder check-in and confirm weekly login owners."))
    if components["feature_usage"] < 50:
        recommendations.append(("Run adoption enablement", "adoption", "medium", "Review feature adoption blockers and schedule enablement for low-usage teams."))
    if components["support_tickets"] < 70:
        recommendations.append(("Close support risk", "support", "high", "Create a named-owner plan for open and critical support tickets."))
    if components["subscription_status"] < 70:
        recommendations.append(("Resolve subscription risk", "commercial", "high", "Ask the account owner to confirm renewal, billing, or payment blockers."))

    for title, rec_type, priority, rationale in recommendations:
        rec_id = new_id("rec")
        conn.execute(
            """
            INSERT INTO recommendations (
              id,
              customer_id,
              health_score_id,
              title,
              recommendation_type,
              priority,
              rationale
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (rec_id, customer_id, health_score_id, title, rec_type, priority, rationale),
        )
        recommendation_ids.append(rec_id)
    conn.commit()
    return recommendation_ids


def recalculate_all_customers(conn: Connection) -> list[dict[str, Any]]:
    rows = conn.execute("SELECT id FROM customers WHERE status != 'deleted'").fetchall()
    return [recalculate_customer(conn, row["id"]) for row in rows]
