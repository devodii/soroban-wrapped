# Roadmap

What is built, what is next. Updated with every change.

## Built
- Own Postgres (docker compose, port 5442), pgschema migrations, CI on every commit
- Workflow and catalog in YAML, validated with pydantic, stages run in dependency order, every run recorded in `stage_runs`
- Discover (GitHub search with range splitting, crates.io) and metadata (batched GraphQL)
- Extraction building blocks: Rust parser (tree-sitter), catalog matcher, Cargo manifests, checksummed contract ids, network signals, git clone and history
- Live research UI and API (`soroban-wrapped serve`), reads the database directly, per-repo notes

## Next
1. Extract stage: clone, parse, match, commits, networks, contract refs, stored source
2. History stage: issues, PRs, releases, contributors
3. Chain: RPC state (live, ttl, wasm, spec), live follower, network totals, history backfill (route to be chosen)
4. Graph build and the self-improving loop: mine candidates from the corpus, propose from data, score, accept or demote
5. Full React app with the 3D graph, open to anyone to explore findings, notes per repo

## Principles
- The catalog is seed vocabulary. Proposals come from the data and carry their evidence.
- Network (mainnet or testnet) is recorded everywhere. Chain truth beats repo hints.
- Everything runs from the YAML workflow and can be re-run safely.
