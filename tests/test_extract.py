from soroban_wrapped.config import ROOT
from soroban_wrapped.extract.manifest import parse_cargo, parse_lock
from soroban_wrapped.extract.networks import network_hits, network_of_ref
from soroban_wrapped.extract.strkey import find_contract_ids, is_contract_id
from soroban_wrapped.workflow import load_workflow

USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"

CRATE = """
[package]
name = "token"
version = "0.1.0"
edition = "2021"
[lib]
crate-type = ["cdylib"]
[dependencies]
soroban-sdk = { workspace = true }
stellar-access = { git = "https://github.com/OpenZeppelin/stellar-contracts", features = ["x"] }
[dev-dependencies]
soroban-sdk = { workspace = true, features = ["testutils"] }
"""


def test_a_workspace_inherited_sdk_resolves_and_marks_a_contract():
    info = parse_cargo("contracts/token/Cargo.toml", CRATE, {"soroban-sdk": "23.0.1"})

    assert info.is_contract
    assert info.soroban_sdk_requirement == "23.0.1"
    git = next(d for d in info.dependencies if d.name == "stellar-access")
    assert git.source == "git" and git.features == ["x"]


def test_locked_versions_keep_only_stellar_related_packages():
    lock = '[[package]]\nname="soroban-sdk"\nversion="23.0.1"\n[[package]]\nname="serde"\nversion="1"'

    assert parse_lock(lock) == {"soroban-sdk": "23.0.1"}


def test_only_checksummed_contract_ids_count():
    assert is_contract_id(USDC)
    assert not is_contract_id("C" + "A" * 55)
    assert find_contract_ids(f"const A = '{USDC}';\n// C{'B' * 55}") == [(USDC, 1)]


def test_a_ref_takes_the_network_nearest_to_it():
    signals = load_workflow(ROOT / "workflow" / "workflow.yaml").networks_signals
    text = (
        "rpc = 'https://soroban-testnet.stellar.org'\n"
        + "\n" * 100
        + ("NETWORK=mainnet\n")
    )
    hits = network_hits(text, signals)

    assert {h.network for h in hits} == {"testnet", "mainnet"}
    assert network_of_ref(2, hits, set()) == "testnet"
    assert network_of_ref(102, hits, set()) == "mainnet"
