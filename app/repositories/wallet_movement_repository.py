import uuid
from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wallet_movement import MovementDirection, WalletMovement
from app.utils.pagination import paginate


async def create(
    session: AsyncSession,
    wallet_id: uuid.UUID,
    direction: MovementDirection,
    amount: Decimal,
    currency: str,
    balance_before: Decimal,
    balance_after: Decimal,
    source_type: str,
    source_id: uuid.UUID,
    created_by_id: uuid.UUID,
    note: str | None = None,
) -> WalletMovement:
    movement = WalletMovement(
        wallet_id=wallet_id,
        direction=direction,
        amount=amount,
        currency=currency,
        balance_before=balance_before,
        balance_after=balance_after,
        source_type=source_type,
        source_id=source_id,
        created_by_id=created_by_id,
        note=note,
    )
    session.add(movement)
    await session.flush()
    return movement


async def list_by_wallet(session: AsyncSession, wallet_id: uuid.UUID) -> list[WalletMovement]:
    result = await session.execute(
        select(WalletMovement)
        .where(WalletMovement.wallet_id == wallet_id)
        .order_by(WalletMovement.created_at)
    )
    return list(result.scalars().all())


async def list_by_wallet_in_period(
    session: AsyncSession,
    wallet_id: uuid.UUID,
    page: int,
    page_size: int,
    start_date: date | None = None,
    end_date: date | None = None,
) -> tuple[list[WalletMovement], int]:
    """Pour le rapport d'historique wallet : filtre par période directement en SQL et pagine,
    au lieu de charger tout l'historique du wallet puis filtrer en Python.
    """
    stmt = select(WalletMovement).where(WalletMovement.wallet_id == wallet_id)
    if start_date:
        stmt = stmt.where(WalletMovement.created_at >= start_date)
    if end_date:
        end_dt = datetime.combine(end_date, time.max)
        stmt = stmt.where(WalletMovement.created_at <= end_dt)
    stmt = stmt.order_by(WalletMovement.created_at.desc())
    return await paginate(session, stmt, page, page_size)
