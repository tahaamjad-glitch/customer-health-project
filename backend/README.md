# Customer Health Python Backend

This backend adds a dependency-free Python API for customer health scoring, alerts, recommendations, reporting, and scheduled monitoring. It uses SQLite plus standard-library HTTP handling so it can run without installing packages.

## Run

```powershell
python -m backend.run --host 127.0.0.1 --port 8181
```

If the system `python` command is unavailable in this workspace, use the bundled runtime:

```powershell
& 'C:\Users\taha.amjad\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m backend.run --host 127.0.0.1 --port 8181
```

The default SQLite database is created at `backend/data/customer_health.sqlite3`.

Start the React app in another terminal:

```powershell
$env:VITE_CUSTOMER_HEALTH_API_BASE="http://127.0.0.1:8181"
npm run dev
```

Open `http://127.0.0.1:5173/login`.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `CUSTOMER_HEALTH_ALLOWED_ORIGIN` | `*` | CORS origin for the frontend app. |
| `CUSTOMER_HEALTH_RESET_LINK_BASE` | `http://127.0.0.1:5173/reset-password` | Base URL used in password reset links. |
| `CUSTOMER_HEALTH_RETURN_RESET_TOKEN` | `1` | Returns reset tokens in local/dev mode because SMTP is not configured. Set to `0` in production after adding an email provider. |
| `CUSTOMER_HEALTH_LOG_REQUESTS` | unset | Set to `1` to print HTTP request logs. |

## Seed Users

Use `POST /api/auth/login` to get a bearer token.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@customerhealth.test` | `Admin@123` |
| Manager | `manager@customerhealth.test` | `Manager@123` |
| Analyst | `analyst@customerhealth.test` | `Analyst@123` |
| Support | `support@customerhealth.test` | `Support@123` |

## Schema

The migration in `backend/migrations/001_customer_health.sql` creates:

- Access control: `roles`, `users`, `sessions`
- Customer data: `customers`, `subscriptions`, `customer_activities`, `feature_usage`, `support_tickets`
- Scoring: `scoring_weights`, `health_scores`
- Actioning: `alerts`, `notifications`, `recommendations`, `audit_logs`

The auth migration in `backend/migrations/002_auth_flows.sql` adds:

- `users.full_name`
- `password_reset_tokens` with hashed reset tokens, expiry, and used timestamps

Foreign keys and indexes are included for customer lookups, trends, open alerts, notification queues, and support ticket status.

## API Surface

- `GET /api/health`
- `POST /api/auth/login`, `POST /api/auth/register`
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users`, `PATCH /api/users/{id}` admin-only user management
- `GET /api/projects`, `GET /api/projects/{id}`
- `POST /api/projects/import?format=csv`
- `POST /api/projects/import?format=json`
- `GET|POST /api/customers`
- `GET|PATCH|DELETE /api/customers/{id}`
- `GET /api/customers/{id}/health-scores`
- `POST /api/customers/{id}/health-score/recalculate`
- `GET /api/customers/{id}/metrics`
- `GET /api/customers/{id}/health-trends`
- `GET|POST /api/health-scores`
- `GET|PATCH|DELETE /api/health-scores/{id}`
- `GET|POST /api/scoring-weights`
- `PATCH /api/scoring-weights/{id}`
- `GET|POST /api/alerts`
- `GET|PATCH /api/alerts/{id}`
- `GET /api/notifications`
- `PATCH /api/notifications/{id}`
- `GET|POST /api/recommendations`
- `PATCH /api/recommendations/{id}`
- `GET /api/reports/health-trends`
- `GET /api/reports/health-distribution`
- `GET /api/reports/export?format=csv`
- `GET /api/reports/export?format=xlsx`
- `POST /api/jobs/daily-health-monitor`

### Auth Payloads

```json
POST /api/auth/login
{ "email": "admin@customerhealth.test", "password": "Admin@123" }
```

```json
POST /api/auth/register
{ "full_name": "Nadia Viewer", "email": "nadia@example.test", "password": "Viewer@123", "confirm_password": "Viewer@123" }
```

```json
POST /api/auth/forgot-password
{ "email": "nadia@example.test" }
```

```json
POST /api/auth/reset-password
{ "token": "reset-token", "password": "NewPass@123", "confirm_password": "NewPass@123" }
```

Authenticated endpoints require:

```text
Authorization: Bearer <token>
```

## Project Import

Project import accepts raw CSV (`text/csv`) or raw JSON (`application/json`) at `POST /api/projects/import`. The user must have the `write` permission.

Required fields:

```text
customer_id, name, stage, project_manager, director, health_score, jira_risk, delivery_risk, milestone_confidence, active_signals, open_actions, next_milestone, due_date
```

Optional fields:

```text
id, external_ref, health_status, customer_external_ref, customer_name
```

Validation rules:

- `stage`: `discovery`, `delivery`, `hypercare`, `managed_service`
- `jira_risk`: `critical`, `high`, `medium`, `low`
- score/risk/confidence fields: integers from `0` to `100`
- `active_signals` and `open_actions`: integers `0` or greater
- `due_date`: ISO date in `YYYY-MM-DD` format
- customer must resolve by `customer_id`, `customer_external_ref`, or `customer_name`

Duplicate handling uses `external_ref` first, then `id`, then `(customer_id, normalized project name)`. Existing projects are updated only when the matched project belongs to the same customer and identifiers do not conflict; otherwise the row is reported as failed.

CSV example:

```csv
external_ref,customer_id,name,stage,project_manager,director,health_score,jira_risk,delivery_risk,milestone_confidence,active_signals,open_actions,next_milestone,due_date
JIRA-NS-001,cust_northstar,Mobile App Revamp,delivery,Sarah Khan,Omar Farooq,72,medium,35,78,3,2,UAT sign-off,2026-07-15
```

JSON example:

```json
[
  {
    "external_ref": "JIRA-NS-001",
    "customer_id": "cust_northstar",
    "name": "Mobile App Revamp",
    "stage": "delivery",
    "project_manager": "Sarah Khan",
    "director": "Omar Farooq",
    "health_score": 72,
    "jira_risk": "medium",
    "delivery_risk": 35,
    "milestone_confidence": 78,
    "active_signals": 3,
    "open_actions": 2,
    "next_milestone": "UAT sign-off",
    "due_date": "2026-07-15"
  }
]
```

Response summary:

```json
{
  "created": 1,
  "updated": 0,
  "failed": 0,
  "errors": [],
  "rows": [{ "row": 2, "status": "created" }]
}
```

## Scoring Logic

The scoring engine combines login frequency, feature usage, support ticket pressure, and subscription status. Weights and component configuration are stored in `scoring_weights`, so admins can tune scoring without changing code.

When a customer recalculates below the configured risk threshold, the API creates open alerts, queued email notifications, and recommendations for follow-up.

## Tests

```powershell
python -m unittest discover -s backend\tests
```

The tests cover score calculations, configurable weights, score persistence, RBAC, login, registration, logout, password reset, admin user management, alerts, notifications, and CSV/XLSX export.
