import logging

from soroban_wrapped.runner import Context, stage
from soroban_wrapped.sql_loader import load_sql
from soroban_wrapped.workflow import Stage

log = logging.getLogger("soroban_wrapped")


@stage("catalog.sync")
async def sync_catalog(context: Context, _: Stage) -> None:
    catalog = context.catalog
    async with context.pool.acquire() as connection, connection.transaction():
        await connection.executemany(
            load_sql("catalog_upsert_pattern"),
            [
                (p.id, p.category, p.description, p.match.model_dump_json())
                for p in catalog.patterns
            ],
        )
        await connection.executemany(
            load_sql("catalog_upsert_bug_class"),
            [(b.id, b.name, b.description, b.severity) for b in catalog.bug_classes],
        )
        await connection.executemany(
            load_sql("catalog_upsert_proposal"),
            [
                (
                    p.id,
                    p.name,
                    p.kind,
                    p.summary,
                    p.sketch,
                    p.thresholds.min_repos,
                    p.thresholds.min_share,
                    p.thresholds.min_occurrences,
                    p.covered_by,
                )
                for p in catalog.proposals
            ],
        )
        await connection.execute(
            "DELETE FROM proposal_patterns WHERE proposal IN "
            "(SELECT id FROM proposals WHERE origin = 'seed')"
        )
        await connection.execute(
            "DELETE FROM proposal_bug_classes WHERE proposal IN "
            "(SELECT id FROM proposals WHERE origin = 'seed')"
        )
        await connection.executemany(
            load_sql("catalog_link_pattern"),
            [
                (p.id, item.id, item.role)
                for p in catalog.proposals
                for item in p.patterns
            ],
        )
        await connection.executemany(
            load_sql("catalog_link_bug_class"),
            [(p.id, bug) for p in catalog.proposals for bug in p.bug_classes],
        )
        await connection.execute(
            "DELETE FROM proposals WHERE origin = 'seed' AND id <> ALL($1::text[])",
            [p.id for p in catalog.proposals],
        )
        await connection.execute(
            "DELETE FROM patterns WHERE origin = 'seed' AND id <> ALL($1::text[])",
            [p.id for p in catalog.patterns],
        )
        await connection.execute(
            "DELETE FROM bug_classes WHERE id <> ALL($1::text[])",
            [b.id for b in catalog.bug_classes],
        )
    context.items = len(catalog.patterns) + len(catalog.proposals)
    log.info(
        "catalog: %s patterns, %s bug classes, %s proposals",
        len(catalog.patterns),
        len(catalog.bug_classes),
        len(catalog.proposals),
    )
