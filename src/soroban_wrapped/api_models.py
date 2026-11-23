from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel


class Totals(BaseModel):
    ledgers: int
    transactions: int
    failed_transactions: int
    operations: int
    contract_calls: int
    days: int
    first_day: date
    last_day: date
    contracts_called: int
    call_pairs: int
    synced_at: datetime | None
    has_partial_day: bool


class Day(BaseModel):
    day: date
    ledgers: int
    transactions: int
    failed_transactions: int
    operations: int
    contract_calls: int
    contracts_called: int
    partial: bool


class Month(BaseModel):
    month: date
    transactions: int
    failed_transactions: int
    contract_calls: int
    peak_contracts_called: int
    new_contracts: int


class Weekday(BaseModel):
    weekday: int
    contract_calls: int
    transactions: int
    failure_percent: float


class DayRecord(BaseModel):
    kind: Literal[
        "most_calls",
        "most_transactions",
        "highest_failure_rate",
        "lowest_failure_rate",
        "biggest_jump",
        "quietest",
    ]
    day: date
    value: float


class Contract(BaseModel):
    contract_id: str
    invocations: int
    successful: int
    active_days: int
    first_day: date
    last_day: date
    peak_daily_accounts: int
    peak_day: date
    peak_invocations: int
    top_function: str | None
    live: bool | None
    sdk_version: str | None
    function_count: int | None
    wasm_size: int | None


class Concentration(BaseModel):
    contracts: int
    total_calls: int
    top_1: int
    top_10: int
    top_100: int
    contracts_for_half: int
    contracts_for_ninety: int
    one_day_contracts: int
    under_ten_calls: int


class GraphTotals(BaseModel):
    pairs: int
    calls: int
    callers: int
    callees: int
    self_calls: int


class SdkVersion(BaseModel):
    version: str
    contracts: int
    invocations: int


class WasmStats(BaseModel):
    contracts: int
    wasm_modules: int
    live: int
    expired: int
    largest_wasm: int | None
    average_wasm: int | None
    most_functions: int | None


class ParetoPoint(BaseModel):
    contracts: int
    share: float


class SizeBucket(BaseModel):
    from_kb: int
    contracts: int


class Wrapped(BaseModel):
    network: Literal["mainnet", "testnet"]
    generated_at: datetime
    totals: Totals
    days: list[Day]
    months: list[Month]
    weekdays: list[Weekday]
    records: list[DayRecord]
    top_contracts: list[Contract]
    concentration: Concentration
    graph_totals: GraphTotals
    pareto: list[ParetoPoint]
    wasm_sizes: list[SizeBucket]
    sdk_versions: list[SdkVersion]
    wasm: WasmStats
