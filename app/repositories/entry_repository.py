import uuid
from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entry import Entry
from app.models.entry_allocation import EntryAllocation, EntryAllocationTargetType
from app.models.entry_line import EntryLine
from app.utils.pagination import paginate

_SORTABLE_COLUMNS = {
    "reference": Entry.reference,
    "created_at": Entry.created_at,
}


async def get_by_company_and_reference(
    session: AsyncSession, company_id: uuid.UUID, reference: str
) -> Entry | None:
    result = await session.execute(
        select(Entry).where(Entry.company_id == company_id, Entry.reference == reference)
    )
    return result.scalar_one_or_none()


async def count_by_company_and_reference_prefix(
    session: AsyncSession, company_id: uuid.UUID, prefix: str
) -> int:
    result = await session.execute(
        select(func.count()).select_from(Entry).where(
            Entry.company_id == company_id, Entry.reference.like(f"{prefix}%")
        )
    )
    return int(result.scalar_one())


async def get_by_company_and_id(
    session: AsyncSession, company_id: uuid.UUID, entry_id: uuid.UUID
) -> Entry | None:
    result = await session.execute(
        select(Entry).where(Entry.company_id == company_id, Entry.id == entry_id)
    )
    return result.scalar_one_or_none()


async def lock_by_company_and_id(
    session: AsyncSession, company_id: uuid.UUID, entry_id: uuid.UUID
) -> Entry | None:
    result = await session.execute(
        select(Entry)
        .where(Entry.company_id == company_id, Entry.id == entry_id)
        .with_for_update()
    )
    return result.scalar_one_or_none()


async def list_by_company(session: AsyncSession, company_id: uuid.UUID) -> list[Entry]:
    result = await session.execute(
        select(Entry).where(Entry.company_id == company_id).order_by(Entry.created_at.desc())
    )
    return list(result.scalars().all())


async def aggregate_in_period(
    session: AsyncSession,
    company_id: uuid.UUID,
    start_date: date | None = None,
    end_date: date | None = None,
) -> tuple[int, dict[str, Decimal]]:
    """Pour le rapport journalier/mensuel : compte les entrées et somme leurs lignes par devise
    directement en SQL, au lieu de charger tout l'historique de l'entreprise (avec une requête
    de lignes par entrée) puis agréger en Python.
    """
    date_filters = []
    if start_date:
        date_filters.append(Entry.created_at >= start_date)
    if end_date:
        date_filters.append(Entry.created_at <= datetime.combine(end_date, time.max))

    count_stmt = select(func.count()).select_from(Entry).where(Entry.company_id == company_id, *date_filters)
    count = int((await session.execute(count_stmt)).scalar_one())

    sum_stmt = (
        select(EntryLine.currency, func.sum(EntryLine.amount))
        .join(Entry, Entry.id == EntryLine.entry_id)
        .where(Entry.company_id == company_id, *date_filters)
        .group_by(EntryLine.currency)
    )
    sums = {currency: amount for currency, amount in (await session.execute(sum_stmt)).all()}
    return count, sums


async def list_by_company_page(
    session: AsyncSession,
    company_id: uuid.UUID,
    page: int,
    page_size: int,
    search: str | None = None,
    sort_by: str | None = None,
    sort_dir: str = "desc",
) -> tuple[list[Entry], int]:
    stmt = select(Entry).where(Entry.company_id == company_id)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Entry.reference.ilike(pattern),
                Entry.client_name.ilike(pattern),
                Entry.client_phone.ilike(pattern),
            )
        )
    column = _SORTABLE_COLUMNS.get(sort_by, Entry.created_at)
    stmt = stmt.order_by(column.asc() if sort_dir == "asc" else column.desc())
    return await paginate(session, stmt, page, page_size)


async def get_lines(session: AsyncSession, entry_id: uuid.UUID) -> list[EntryLine]:
    result = await session.execute(
        select(EntryLine).where(EntryLine.entry_id == entry_id).order_by(EntryLine.created_at)
    )
    return list(result.scalars().all())


async def get_allocations(session: AsyncSession, entry_id: uuid.UUID) -> list[EntryAllocation]:
    result = await session.execute(
        select(EntryAllocation)
        .where(EntryAllocation.entry_id == entry_id)
        .order_by(EntryAllocation.created_at)
    )
    return list(result.scalars().all())


async def get_allocation_by_target(
    session: AsyncSession, target_type: EntryAllocationTargetType, target_id: uuid.UUID
) -> EntryAllocation | None:
    result = await session.execute(
        select(EntryAllocation).where(
            EntryAllocation.target_type == target_type, EntryAllocation.target_id == target_id
        )
    )
    return result.scalar_one_or_none()


async def count_all(session: AsyncSession) -> int:
    result = await session.execute(select(func.count()).select_from(Entry))
    return int(result.scalar_one())
