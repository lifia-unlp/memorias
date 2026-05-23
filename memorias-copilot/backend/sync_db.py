import asyncio

import asyncpg

# 1. Connection Strings
# Replace 'OTHER_MACHINE_IP' with the actual IP address of your other machine.
# If using an SSH tunnel, change 'OTHER_MACHINE_IP' to 'localhost' and port to 51216.
REMOTE_DSN = "postgresql://postgres:postgres@localhost:51216/default"
LOCAL_DSN = "postgresql://postgres:postgres@localhost:51214/default"

# 2. The tables to sync (order matters due to foreign keys!)
TABLES = ["Member", "Project", "Publication"]


async def sync() -> None:
    remote_conn = None
    local_conn = None
    try:
        print("[Sync] Connecting to remote and local databases...")
        remote_conn = await asyncpg.connect(REMOTE_DSN, ssl=False)
        local_conn = await asyncpg.connect(LOCAL_DSN, ssl=False)
        print("[Sync] Connected successfully.")

        # Temporarily disable foreign key constraints to allow bulk inserts
        await local_conn.execute("SET session_replication_role = 'replica';")

        for table in TABLES:
            print(f'[Sync] Fetching data for table "{table}"...')

            # Fetch all rows from remote
            rows = await remote_conn.fetch(f'SELECT * FROM "{table}"')
            print(f'[Sync] Found {len(rows)} rows in remote table "{table}".')

            # Truncate local table
            await local_conn.execute(f'TRUNCATE TABLE "{table}" CASCADE;')

            if not rows:
                continue

            # Get columns from the first row
            columns = ", ".join(f'"{col}"' for col in rows[0].keys())
            placeholders = ", ".join(f"${i + 1}" for i in range(len(rows[0])))

            insert_query = f'INSERT INTO "{table}" ({columns}) VALUES ({placeholders})'

            # Convert Record list to list of tuples for psycopg-like execution
            values = [tuple(row.values()) for row in rows]

            await local_conn.executemany(insert_query, values)
            print(
                f'[Sync] Successfully copied {len(rows)} rows to local table "{table}".'
            )

        # Re-enable foreign key constraints
        await local_conn.execute("SET session_replication_role = 'origin';")
        print("[Sync] Database sync completed successfully!")

    except Exception as e:
        print(f"[Sync] Error during database sync: {e}")
    finally:
        if remote_conn is not None:
            await remote_conn.close()
        if local_conn is not None:
            await local_conn.close()


if __name__ == "__main__":
    asyncio.run(sync())
