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

## Discovery is not claimed to be complete
- **Known holes:** identical-size files can hit GitHub's 1,000-result cap inside one size bucket; code search skips most forks, non-default branches and large files; non-GitHub hosts are not searched; sibling repos of a found owner can be missed.
- **Closures built:** `Cargo.lock` and extra Stellar crate searches, crates.io dependents, an **owner sweep** that lists every repo of each confirmed owner through REST (not the search limit), a flag on search slices that hit the cap, and a capture-recapture coverage estimate on the Overview tab (shown only once text and content searches overlap on 30+ repos).
- **Still open:** non-GitHub hosts, and any repo no search or owner link reaches.

## On-chain history plan and budget (measured on a real runner)
- **Speed:** 48.8 ledgers/s per runner at 32 threads and 64 ledgers/s at 64 threads (a 2-core runner is CPU-bound). This machine does 1.7 ledgers/s, so a runner is about 30 to 40 times faster.
- **Size of the job:** mainnet 2026 is about 5.6M ledgers. At 64 ledgers/s that is about 87,500 runner-seconds, so **about 1,450 Actions minutes**, plus about 20 for job setup. Up to 20 jobs run at once, so the wall time is roughly 1.5 to 2.5 hours.
- **Budget:** the free plan gives 2,000 private Linux minutes a month. CI has used roughly 60 to 70 so far this month. The full run fits but with thin headroom. Safest is two batches: now and after the monthly reset on 1 December. Set Actions spending limit to 0 so nothing can ever bill. If it did bill, the worst case is about 10 to 15 USD (about 0.008 per minute).
- **Artifacts:** each day's summary is small (60 to 130 KB per 400 to 800 ledgers, roughly 0.5 to 2 MB per full day). A year could approach the free 500 MB artifact storage, so run in batches of 2 to 3 months, import, then delete the artifacts.
- **Not launched in full.** It needs your go-ahead. The command is `gh workflow run lake.yml -f network=mainnet -f start=2026-01-01 -f end=2026-02-28` then `gh run download` then `soroban-wrapped lake-import`.

## Open for the owner
- Approve the full-year on-chain run on GitHub Actions (or choose an AWS spot VM or BigQuery instead).
- Add the third GitHub token to `.env`.
