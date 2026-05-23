#!/usr/bin/env python3
from pathlib import Path


def main() -> None:
    backend_dir = Path(__file__).parent.absolute()
    logs_dir = backend_dir / "logs"

    if not logs_dir.exists():
        print("No logs directory found.")
        return

    count = 0
    for f in logs_dir.glob("session_*.json"):
        try:
            f.unlink()
            count += 1
        except Exception as e:
            print(f"Failed to delete {f.name}: {e}")

    print(f"Successfully deleted {count} conversation log file(s).")


if __name__ == "__main__":
    main()
