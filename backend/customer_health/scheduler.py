from __future__ import annotations

import argparse
import time
from contextlib import closing
from pathlib import Path

from .database import initialize_database
from .scoring import recalculate_all_customers


SECONDS_PER_DAY = 60 * 60 * 24


def run_daily_monitor(db_path: str | Path | None = None) -> list[dict]:
    with closing(initialize_database(db_path)) as conn:
        return recalculate_all_customers(conn)


def run_forever(db_path: str | Path | None = None, interval_seconds: int = SECONDS_PER_DAY) -> None:
    while True:
        results = run_daily_monitor(db_path)
        print(f"daily customer health monitor completed: {len(results)} customers")
        time.sleep(interval_seconds)


def main() -> None:
    parser = argparse.ArgumentParser(description="Customer Health scheduled monitor")
    parser.add_argument("--db", default=None, help="SQLite database path")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--interval-seconds", type=int, default=SECONDS_PER_DAY)
    args = parser.parse_args()

    if args.once:
        results = run_daily_monitor(args.db)
        print({"results": results})
        return
    run_forever(args.db, args.interval_seconds)


if __name__ == "__main__":
    main()
