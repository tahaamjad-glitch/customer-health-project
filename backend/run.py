from __future__ import annotations

import argparse
import os

from .customer_health.api import run_server


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Customer Health Python API")
    parser.add_argument("--host", default=os.environ.get("CUSTOMER_HEALTH_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("CUSTOMER_HEALTH_PORT", "8181")))
    parser.add_argument("--db", default=os.environ.get("CUSTOMER_HEALTH_DB"))
    args = parser.parse_args()

    server = run_server(args.host, args.port, args.db)
    print(f"Customer Health API listening on http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
