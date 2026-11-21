# Roadmap

What is built, what is next. Updated with every change.

## Built
- Own Postgres on the host disk, pgschema migrations, checks on every commit
- Workflow and catalog in YAML, validated with pydantic, every stage run recorded
- Resumable first: a checkpoint per unit of work, network drops wait and resume, crashes restart, repos that keep failing are given up on after 3 tries
- Autopilot (`drive`): metadata, extraction and history run as independent followers, a periodic loop runs sweep, chain, lake import, reanalyse, mine, score, graph and report
- Discovery: GitHub text and content search (including `Cargo.lock` and other Stellar crates), crates.io dependents, owner sweep, 3 keys rotating and hot-reloaded
- Extraction: commits-only sparse git fetch, Rust parsed with tree-sitter, 54 seed patterns plus mined ones, commits, fix commits with diffs, networks, contract ids
- History: issues, pull requests and releases through GraphQL
- Chain: every contract id checked on mainnet and testnet RPC (liveness, wasm, embedded spec), contract links ranked by evidence (verified, deployment, code, docs, fixture)
- On-chain history: ledger archive summarised on GitHub Actions runners (measured 64 ledgers/s per runner), imported automatically
- Self-improving loop: miner finds uncovered clusters, helpers, idioms, macros, vocabularies, fix terms, new topics. Strong helpers become patterns, accepted topics become search queries, stored source is re-matched when patterns change
- Reuse score by distinct owners with independence, mainnet, recency, fix evidence, size and library coverage, with the evidence stored
- Live UI: overview and discovery coverage, repos, patterns, proposals with evidence and real examples, candidates, chain, a readable focused graph, notes on repos and proposals, a morning report

## Next
1. Separate web app with the full 3D graph, open to anyone to explore, notes per repo
2. Deployer address for contracts (to separate "deploys" from "mentions" beyond file evidence)
3. LLM pass that names each proposal and drafts its macro sketch from the evidence
4. Non-GitHub hosts (GitLab, Codeberg)
5. Open dataset export and a methodology page

## Principles
- The catalog is seed vocabulary. Proposals come from the data and carry their evidence.
- Network (mainnet or testnet) is recorded everywhere. Chain truth beats repo hints.
- Everything is resumable and re-runnable. Nothing is redone from scratch.
