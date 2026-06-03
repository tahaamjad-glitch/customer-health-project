from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from sqlite3 import Connection


SESSION_TTL_HOURS = 8
PASSWORD_RESET_TTL_MINUTES = 30
ROLE_PERMISSIONS: dict[str, set[str]] = {
    "admin": {"read", "write", "admin", "export", "score", "notify"},
    "manager": {"read", "write", "export", "score", "notify"},
    "analyst": {"read", "export", "score"},
    "support": {"read", "write"},
    "viewer": {"read"},
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str, salt: str | None = None) -> str:
    raw_salt = base64.b64decode(salt) if salt else secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), raw_salt, 120_000)
    return f"pbkdf2_sha256${base64.b64encode(raw_salt).decode('ascii')}${base64.b64encode(digest).decode('ascii')}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, salt, digest = stored_hash.split("$", 2)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    candidate = hash_password(password, salt).split("$", 2)[2]
    return hmac.compare_digest(candidate, digest)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def issue_session(conn: Connection, user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=SESSION_TTL_HOURS)).isoformat()
    conn.execute(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires_at),
    )
    conn.commit()
    return token


def invalidate_session(conn: Connection, token: str | None) -> bool:
    if not token:
        return False
    cursor = conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    return cursor.rowcount > 0


def invalidate_user_sessions(conn: Connection, user_id: str) -> None:
    conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
    conn.commit()


def get_user_for_token(conn: Connection, token: str | None):
    if not token:
        return None
    row = conn.execute(
        """
        SELECT users.*, roles.name AS role_name
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        JOIN roles ON roles.id = users.role_id
        WHERE sessions.token = ? AND sessions.expires_at > ? AND users.is_active = 1
        """,
        (token, utc_now_iso()),
    ).fetchone()
    return row


def has_permission(role_name: str, permission: str) -> bool:
    role_key = role_name.lower()
    return permission in ROLE_PERMISSIONS.get(role_key, set())
