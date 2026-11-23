from datetime import date, timedelta

from soroban_wrapped.api import records
from soroban_wrapped.api_models import Day
from soroban_wrapped.chain.lake_import import contract_id


def day(offset: int, calls: int, failed: int = 0, partial: bool = False) -> Day:
    return Day(
        day=date(2026, 1, 1) + timedelta(days=offset),
        ledgers=17000,
        transactions=2_000_000,
        failed_transactions=failed,
        operations=3_000_000,
        contract_calls=calls,
        contracts_called=10,
        partial=partial,
    )


def test_records_pick_the_extremes_of_finished_days_only():
    days = [
        day(0, 100, failed=1_000_000),
        day(1, 900, failed=200_000),
        day(2, 300, failed=400_000),
        day(3, 5000, partial=True),
    ]

    found = {r.kind: r for r in records(days)}

    assert found["most_calls"].day == days[1].day
    assert found["quietest"].day == days[0].day
    assert found["highest_failure_rate"].day == days[0].day
    assert found["lowest_failure_rate"].day == days[1].day
    assert found["biggest_jump"].value == 800


def test_a_contract_id_is_a_strkey_and_garbage_is_not():
    assert contract_id("00" * 32).startswith("C")
    assert contract_id(None) is None
    assert contract_id("not hex") is None
