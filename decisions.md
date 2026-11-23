# Decisions

## Two products, two repos
- **soroban-wrapped** (this repo) is the on-chain product: the public ledger archive summarised on GitHub Actions, synced into one small Postgres, shown on one page.
- **state-of-soroban** (`devodii/state-of-soroban`) holds everything about GitHub: discovery, extraction, ecosystem graph, tooling needs and RFPs. It has its own database and can run on another machine. It was copied from this repo on 2026-11-23 with its full history and an exact copy of the database.
- The GitHub tables were dropped here only after the copy was checked byte for byte. Every on-chain table kept its exact row count.

## Data
- **The ledger archive is the source.** The public AWS parquet lake is read on Actions runners (fast datacenter link) and only a few MB per day come home.
- **No Stellar Expert.** The RPC is only used for current contract state (wasm hash, TTL, sdk version).
- **A day is `done` once it has ended.** Today is `partial` and is replaced by every later run, so imports are idempotent upserts and never add twice.
- **Networks are recorded everywhere** (`mainnet`, `testnet`).

## Freshness
- `lake-today.yml` runs every 6 hours, scans yesterday and today for both networks and uploads artifacts.
- `soroban-wrapped sync --watch` downloads finished runs, imports them, deletes the artifacts and looks up the most called contracts it has not seen yet.

## App
- One page, no routes. The API returns one cached `Wrapped` document per network and the types are generated from its OpenAPI schema.
