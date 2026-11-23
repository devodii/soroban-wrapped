# soroban-wrapped

The year of Soroban on-chain activity in one page: transactions, contract calls, the busiest contracts, who calls whom, which SDK versions run the network, and how concentrated it all is. Mainnet and testnet.

The GitHub side (repos, tooling needs, RFPs) lives in `state-of-soroban`.

## How it works

1. `lake.yml` (manual backfill) and `lake-today.yml` (every 6 hours) read the public ledger archive on Actions runners and upload small parquet summaries.
2. `soroban-wrapped sync` downloads finished runs with `gh`, imports them into Postgres and looks up new contracts on the RPC.
3. `soroban-wrapped serve` returns one cached document per network at `/api/wrapped/{network}` and hosts the web app.

## Run it

```sh
docker compose up -d --wait db
uv sync
uv run soroban-wrapped schema apply
uv run soroban-wrapped sync --watch    # keeps the data current
uv run soroban-wrapped serve           # http://localhost:8787
```

Web app: `cd web && pnpm install && pnpm dev` (proxies `/api` to :8787), `pnpm storybook` for the components, `pnpm types` after an API change, `pnpm build` for `serve` to host.

Backfill a range on Actions: run the `lake` workflow with a network and dates. Then `sync` imports it.
