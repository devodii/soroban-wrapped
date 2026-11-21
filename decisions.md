# Decisions

Decisions made while building, with the reason, so they can be challenged. Newest at the bottom of each section.

## Scope
- **Window is 2026-01-01 to today.** Only commits, issues, PRs and releases inside it are stored. A repo qualifies if it was pushed to in the window and contains Rust.
- **"Soroban repo" means the code uses the Soroban SDK**: a direct dependency, a `Cargo.lock` entry or a `soroban_sdk` import. Repos that only mention Soroban in text are not counted until the code confirms it.
- **Network is recorded everywhere** (mainnet, testnet). Repo signals are hints. The RPC lookup of each contract id is the truth.

## Data sources
- **GitHub search finds candidates only.** The real work (clone, history) does not touch the search limit. Two keys rotate, a third can be appended to `GITHUB_TOKENS` in `.env` and is picked up within 30 seconds without a restart.
- **Extraction uses a commits-only, sparse git fetch** (`--filter=tree:0`, sparse checkout of `.rs`, `Cargo.*`, docs and signal files). A full clone of every repo is tens of GB and the connection here does about 1 MB/s. Commit file lists are fetched only for fix commits.
- **Smallest repos first** so coverage grows fast. Huge repos go last and are skipped over 750 MB.
- **No Stellar Expert.** Mainnet contract endpoints are paywalled and the free quota is tiny. Horizon cannot serve per-contract data (it rejects contract addresses).
- **Mainnet RPC keeps about 7 days.** It is used for current state: does the contract exist, wasm hash, TTL, wasm, embedded spec and metadata.
- **Full-year on-chain history comes from the public AWS ledger lake**, summarised on GitHub Actions runners (fast datacenter link) so only a few MB come home. The workflow is built and tested on a small slice. **It is not launched in full without a go-ahead** because it spends the repo's free Actions minutes.

## Resilience
- **Everything is resumable first.** Every unit of work (search slice and page, crates.io lookup, repo, lake day) has a row in `checkpoints`. A network drop waits until online and leaves the unit pending.
- **One autopilot (`soroban-wrapped drive`)** runs every stage, restarts crashed stages with backoff and follows new work as it appears. It runs under `caffeinate` so the machine does not idle-sleep.

## Proposals and the catalog
- **YAML catalog entries are seeds, not conclusions.** Real proposals are mined from the data and stored with their evidence. Seeds are scored the same way and can be marked unsupported.
- **Reuse is scored by distinct owners, not repos**, with forks removed, because copies of one template are not independent demand.
- **Exact copies and independent rewrites are scored differently.** Same body hash across repos means a template spread. Same structure with different bodies means people each wrote it, the stronger "missing macro" signal.
- **Weight goes up** for mainnet-confirmed repos, recent activity, lines removable per adopter and fix commits or issues tied to the pattern. **Weight goes down** when OpenZeppelin or the SDK already covers it.

## Interfaces
- **Live research UI** (`soroban-wrapped serve`, port 8787) reads the database directly. It is the base for the later React and 3D app, which will use the same API.

## Open for the owner
- Approve the full-year on-chain run on GitHub Actions (or choose an AWS spot VM or BigQuery instead).
- Add the third GitHub token to `.env`.
