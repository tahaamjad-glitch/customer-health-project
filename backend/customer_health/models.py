from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


JsonDict = dict[str, Any]


@dataclass(frozen=True)
class Role:
    id: str
    name: str
    description: str = ""


@dataclass(frozen=True)
class User:
    id: str
    role_id: str
    email: str
    name: str
    password_hash: str
    is_active: bool = True

    def public_dict(self) -> JsonDict:
        data = asdict(self)
        data.pop("password_hash", None)
        return data


@dataclass(frozen=True)
class Customer:
    id: str
    name: str
    external_ref: str | None = None
    status: str = "active"
    lifecycle_stage: str = "live"
    health_status: str = "unknown"
    current_health_score: int = 0
    owner_user_id: str | None = None


@dataclass(frozen=True)
class Subscription:
    id: str
    customer_id: str
    plan_name: str
    status: str
    monthly_recurring_revenue: float
    started_at: str
    renews_at: str | None = None
    canceled_at: str | None = None


@dataclass(frozen=True)
class CustomerActivity:
    id: str
    customer_id: str
    activity_type: str
    occurred_at: str
    metadata_json: str = "{}"


@dataclass(frozen=True)
class FeatureUsage:
    id: str
    customer_id: str
    feature_key: str
    usage_count: int
    active_users: int
    measured_at: str


@dataclass(frozen=True)
class SupportTicket:
    id: str
    customer_id: str
    subject: str
    status: str
    priority: str
    opened_at: str
    external_ref: str | None = None
    satisfaction_score: int | None = None
    closed_at: str | None = None


@dataclass(frozen=True)
class ScoringWeight:
    id: str
    metric_key: str
    display_name: str
    weight: float
    enabled: bool = True
    config_json: str = "{}"


@dataclass(frozen=True)
class HealthScore:
    id: str
    customer_id: str
    score: int
    health_status: str
    login_score: int
    feature_usage_score: int
    support_score: int
    subscription_score: int
    explanation_json: str
    calculated_at: str


@dataclass(frozen=True)
class Alert:
    id: str
    customer_id: str
    type: str
    severity: str
    status: str
    threshold: int
    title: str
    message: str
    health_score_id: str | None = None
    created_at: str | None = None
    acknowledged_at: str | None = None
    resolved_at: str | None = None


@dataclass(frozen=True)
class Notification:
    id: str
    alert_id: str
    channel: str
    recipient: str
    subject: str
    body: str
    status: str = "queued"
    user_id: str | None = None
    sent_at: str | None = None


@dataclass(frozen=True)
class Recommendation:
    id: str
    customer_id: str
    title: str
    recommendation_type: str
    priority: str
    rationale: str
    status: str = "open"
    health_score_id: str | None = None
    due_at: str | None = None


@dataclass(frozen=True)
class ScoreInput:
    customer_id: str
    login_count_30d: int
    active_feature_count_30d: int
    feature_event_count_30d: int
    open_ticket_count: int
    critical_ticket_count: int
    average_ticket_satisfaction: float | None
    subscription_status: str
    plan_name: str | None = None


@dataclass(frozen=True)
class ScoreBreakdown:
    score: int
    health_status: str
    components: dict[str, int]
    explanation: dict[str, Any] = field(default_factory=dict)


def row_to_dict(row: Any) -> JsonDict:
    return {key: row[key] for key in row.keys()}
