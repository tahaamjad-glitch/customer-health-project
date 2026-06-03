from __future__ import annotations

import csv
import json
import re
from datetime import date
from io import StringIO
from sqlite3 import Connection
from typing import Any

from .database import new_id
from .models import row_to_dict


Json = dict[str, Any]
MAX_IMPORT_BYTES = 1_000_000
MAX_IMPORT_ROWS = 1_000

ALLOWED_STAGES = {"discovery", "delivery", "hypercare", "managed_service"}
ALLOWED_HEALTH_STATUSES = {"green", "amber", "red"}
ALLOWED_RISK_LEVELS = {"critical", "high", "medium", "low"}

FIELD_ALIASES: dict[str, set[str]] = {
    "id": {"id", "projectid"},
    "external_ref": {"externalref", "externalid", "projectref", "projectcode", "jiraid", "jirakey"},
    "customer_id": {"customerid", "clientid", "accountid"},
    "customer_external_ref": {"customerexternalref", "clientexternalref", "accountref"},
    "customer_name": {"customername", "clientname", "company", "accountname"},
    "name": {"name", "projectname"},
    "stage": {"stage", "projectstage"},
    "project_manager": {"projectmanager", "pm", "owner", "projectowner"},
    "director": {"director", "projectdirector", "pd"},
    "health_score": {"healthscore", "projecthealthscore", "score"},
    "health_status": {"healthstatus", "projecthealth", "status"},
    "jira_risk": {"jir risk", "jirarisk", "risk", "risklevel", "deliveryrisklevel"},
    "delivery_risk": {"deliveryrisk", "deliveryriskscore"},
    "milestone_confidence": {"milestoneconfidence", "confidence"},
    "active_signals": {"activesignals", "signals"},
    "open_actions": {"openactions", "actions"},
    "next_milestone": {"nextmilestone", "milestone"},
    "due_date": {"duedate", "milestoneduedate", "date"},
}

REQUIRED_FIELDS = {
    "customer_id",
    "name",
    "stage",
    "project_manager",
    "director",
    "health_score",
    "jira_risk",
    "delivery_risk",
    "milestone_confidence",
    "active_signals",
    "open_actions",
    "next_milestone",
    "due_date",
}


def import_projects(conn: Connection, raw: bytes, requested_format: str | None = None, content_type: str = "") -> Json:
    if len(raw) > MAX_IMPORT_BYTES:
        raise ImportTooLargeError(f"Import file exceeds {MAX_IMPORT_BYTES} bytes")

    rows = parse_import_rows(raw, requested_format, content_type)
    if len(rows) > MAX_IMPORT_ROWS:
        raise ValueError(f"Import cannot exceed {MAX_IMPORT_ROWS} rows")

    result: Json = {
        "created": 0,
        "updated": 0,
        "failed": 0,
        "errors": [],
        "rows": [],
    }
    seen_identifiers: set[str] = set()

    for row_number, source_row in rows:
        normalized = canonicalize_row(source_row)
        project, errors = validate_project_row(conn, normalized)
        identifier = row_identifier(project or normalized)

        if not errors and identifier in seen_identifiers:
            errors.append("Duplicate project identifier appears more than once in this import file")
        if identifier:
            seen_identifiers.add(identifier)

        if errors or project is None:
            result["failed"] += 1
            row_errors = [{"row": row_number, "message": message} for message in errors]
            result["errors"].extend(row_errors)
            result["rows"].append({"row": row_number, "status": "failed", "errors": errors})
            continue

        existing, conflict = find_existing_project(conn, project)
        if conflict:
            result["failed"] += 1
            result["errors"].append({"row": row_number, "message": conflict})
            result["rows"].append({"row": row_number, "status": "failed", "errors": [conflict]})
            continue

        if existing:
            update_project(conn, existing["id"], project)
            result["updated"] += 1
            saved = get_project(conn, existing["id"])
            result["rows"].append({"row": row_number, "status": "updated", "project": saved})
        else:
            project_id = project["id"] or new_id("proj")
            insert_project(conn, {**project, "id": project_id})
            result["created"] += 1
            result["rows"].append({"row": row_number, "status": "created", "project": get_project(conn, project_id)})

    conn.commit()
    return result


class ImportTooLargeError(ValueError):
    pass


def parse_import_rows(raw: bytes, requested_format: str | None, content_type: str) -> list[tuple[int, Json]]:
    text = raw.decode("utf-8-sig")
    import_format = infer_format(requested_format, content_type, text)
    if import_format == "csv":
        reader = csv.DictReader(StringIO(text))
        if not reader.fieldnames:
            raise ValueError("CSV import requires a header row")
        return [(index, dict(row)) for index, row in enumerate(reader, start=2)]
    if import_format == "json":
        payload = json.loads(text)
        if isinstance(payload, dict) and "projects" in payload:
            payload = payload["projects"]
        if not isinstance(payload, list):
            raise ValueError("JSON import must be an array or an object with a projects array")
        rows: list[tuple[int, Json]] = []
        for index, item in enumerate(payload, start=1):
            if not isinstance(item, dict):
                raise ValueError("Each JSON project row must be an object")
            rows.append((index, item))
        return rows
    raise ValueError("Unsupported import format")


def infer_format(requested_format: str | None, content_type: str, text: str) -> str:
    explicit = (requested_format or "").strip().lower()
    if explicit in {"csv", "json"}:
        return explicit
    lowered_type = content_type.lower()
    if "json" in lowered_type:
        return "json"
    if "csv" in lowered_type or "text/plain" in lowered_type:
        return "csv"
    stripped = text.lstrip()
    if stripped.startswith("[") or stripped.startswith("{"):
        return "json"
    return "csv"


def canonicalize_row(row: Json) -> Json:
    tokenized = {field_token(key): value for key, value in row.items()}
    canonical: Json = {}
    for field, aliases in FIELD_ALIASES.items():
        for alias in aliases | {field_token(field)}:
            if alias in tokenized:
                canonical[field] = tokenized[alias]
                break
    return canonical


def validate_project_row(conn: Connection, row: Json) -> tuple[Json | None, list[str]]:
    errors: list[str] = []
    customer_id = resolve_customer_id(conn, row, errors)

    for field in REQUIRED_FIELDS:
        if field == "customer_id":
            continue
        if clean_text(row.get(field)) == "":
            errors.append(f"Missing required field: {field}")

    name = clean_text(row.get("name"))
    stage = normalize_choice(row.get("stage"), ALLOWED_STAGES, "stage", errors)
    project_manager = clean_text(row.get("project_manager"))
    director = clean_text(row.get("director"))
    health_score = parse_int(row.get("health_score"), "health_score", errors, min_value=0, max_value=100)
    health_status = normalize_health_status(row.get("health_status"), health_score, errors)
    jira_risk = normalize_choice(row.get("jira_risk"), ALLOWED_RISK_LEVELS, "jira_risk", errors)
    delivery_risk = parse_int(row.get("delivery_risk"), "delivery_risk", errors, min_value=0, max_value=100)
    milestone_confidence = parse_int(row.get("milestone_confidence"), "milestone_confidence", errors, min_value=0, max_value=100)
    active_signals = parse_int(row.get("active_signals"), "active_signals", errors, min_value=0)
    open_actions = parse_int(row.get("open_actions"), "open_actions", errors, min_value=0)
    next_milestone = clean_text(row.get("next_milestone"))
    due_date = parse_iso_date(row.get("due_date"), "due_date", errors)
    external_ref = clean_text(row.get("external_ref")) or None
    project_id = clean_text(row.get("id")) or None

    if errors or not customer_id:
        return None, errors

    return {
        "id": project_id,
        "customer_id": customer_id,
        "external_ref": external_ref,
        "name": name,
        "normalized_name": normalize_project_name(name),
        "stage": stage,
        "project_manager": project_manager,
        "director": director,
        "health_score": health_score,
        "health_status": health_status,
        "jira_risk": jira_risk,
        "delivery_risk": delivery_risk,
        "milestone_confidence": milestone_confidence,
        "active_signals": active_signals,
        "open_actions": open_actions,
        "next_milestone": next_milestone,
        "due_date": due_date,
    }, []


def resolve_customer_id(conn: Connection, row: Json, errors: list[str]) -> str | None:
    customer_id = clean_text(row.get("customer_id"))
    if customer_id:
        found = conn.execute("SELECT id FROM customers WHERE id = ?", (customer_id,)).fetchone()
        if found:
            return found["id"]
        errors.append(f"Unknown customer_id: {customer_id}")
        return None

    external_ref = clean_text(row.get("customer_external_ref"))
    if external_ref:
        found = conn.execute("SELECT id FROM customers WHERE lower(external_ref) = lower(?)", (external_ref,)).fetchone()
        if found:
            return found["id"]
        errors.append(f"Unknown customer_external_ref: {external_ref}")
        return None

    customer_name = clean_text(row.get("customer_name"))
    if customer_name:
        found = conn.execute("SELECT id FROM customers WHERE lower(name) = lower(?)", (customer_name,)).fetchone()
        if found:
            return found["id"]
        errors.append(f"Unknown customer_name: {customer_name}")
        return None

    errors.append("Missing required field: customer_id")
    return None


def find_existing_project(conn: Connection, project: Json) -> tuple[Any | None, str | None]:
    matches = []
    if project["id"]:
        row = conn.execute("SELECT * FROM projects WHERE id = ?", (project["id"],)).fetchone()
        if row:
            matches.append(row)
    if project["external_ref"]:
        row = conn.execute("SELECT * FROM projects WHERE external_ref = ?", (project["external_ref"],)).fetchone()
        if row:
            matches.append(row)
    row = conn.execute(
        "SELECT * FROM projects WHERE customer_id = ? AND normalized_name = ?",
        (project["customer_id"], project["normalized_name"]),
    ).fetchone()
    if row:
        matches.append(row)

    unique_matches = {row["id"]: row for row in matches}
    if len(unique_matches) > 1:
        return None, "Project identifiers match multiple existing projects"
    if not unique_matches:
        return None, None

    existing = next(iter(unique_matches.values()))
    if existing["customer_id"] != project["customer_id"]:
        return None, "Project duplicate belongs to another customer"
    if existing["external_ref"] and project["external_ref"] and existing["external_ref"] != project["external_ref"]:
        return None, "Project name matches an existing project with a different external_ref"
    return existing, None


def insert_project(conn: Connection, project: Json) -> None:
    conn.execute(
        """
        INSERT INTO projects (
          id, customer_id, external_ref, name, normalized_name, stage, project_manager,
          director, health_score, health_status, jira_risk, delivery_risk,
          milestone_confidence, active_signals, open_actions, next_milestone, due_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        project_values(project),
    )


def update_project(conn: Connection, project_id: str, project: Json) -> None:
    conn.execute(
        """
        UPDATE projects
        SET customer_id = ?, external_ref = COALESCE(?, external_ref), name = ?, normalized_name = ?,
            stage = ?, project_manager = ?, director = ?, health_score = ?, health_status = ?,
            jira_risk = ?, delivery_risk = ?, milestone_confidence = ?, active_signals = ?,
            open_actions = ?, next_milestone = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            project["customer_id"],
            project["external_ref"],
            project["name"],
            project["normalized_name"],
            project["stage"],
            project["project_manager"],
            project["director"],
            project["health_score"],
            project["health_status"],
            project["jira_risk"],
            project["delivery_risk"],
            project["milestone_confidence"],
            project["active_signals"],
            project["open_actions"],
            project["next_milestone"],
            project["due_date"],
            project_id,
        ),
    )


def project_values(project: Json) -> tuple[Any, ...]:
    return (
        project["id"],
        project["customer_id"],
        project["external_ref"],
        project["name"],
        project["normalized_name"],
        project["stage"],
        project["project_manager"],
        project["director"],
        project["health_score"],
        project["health_status"],
        project["jira_risk"],
        project["delivery_risk"],
        project["milestone_confidence"],
        project["active_signals"],
        project["open_actions"],
        project["next_milestone"],
        project["due_date"],
    )


def get_project(conn: Connection, project_id: str) -> Json | None:
    row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    return row_to_dict(row) if row else None


def row_identifier(row: Json) -> str:
    external_ref = clean_text(row.get("external_ref"))
    project_id = clean_text(row.get("id"))
    customer_id = clean_text(row.get("customer_id"))
    name = clean_text(row.get("name"))
    if external_ref:
        return f"external_ref:{external_ref.lower()}"
    if project_id:
        return f"id:{project_id}"
    return f"name:{customer_id}:{normalize_project_name(name)}"


def field_token(key: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", key.lower())


def clean_text(value: Any) -> str:
    return "" if value is None else str(value).strip()


def normalize_project_name(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def normalize_choice(value: Any, allowed: set[str], field: str, errors: list[str]) -> str:
    raw = clean_text(value).lower().replace("-", "_").replace(" ", "_")
    if raw in allowed:
        return raw
    errors.append(f"{field} must be one of: {', '.join(sorted(allowed))}")
    return raw


def normalize_health_status(value: Any, score: int, errors: list[str]) -> str:
    raw = clean_text(value)
    if not raw:
        if score >= 70:
            return "green"
        if score >= 50:
            return "amber"
        return "red"
    normalized = raw.lower()
    if normalized in ALLOWED_HEALTH_STATUSES:
        return normalized
    errors.append("health_status must be one of: amber, green, red")
    return normalized


def parse_int(value: Any, field: str, errors: list[str], min_value: int | None = None, max_value: int | None = None) -> int:
    raw = clean_text(value)
    try:
        parsed = int(raw)
    except ValueError:
        errors.append(f"{field} must be an integer")
        return 0
    if min_value is not None and parsed < min_value:
        errors.append(f"{field} must be at least {min_value}")
    if max_value is not None and parsed > max_value:
        errors.append(f"{field} must be at most {max_value}")
    return parsed


def parse_iso_date(value: Any, field: str, errors: list[str]) -> str:
    raw = clean_text(value)
    try:
        parsed = date.fromisoformat(raw)
    except ValueError:
        errors.append(f"{field} must be a valid ISO date in YYYY-MM-DD format")
        return raw
    return parsed.isoformat()
