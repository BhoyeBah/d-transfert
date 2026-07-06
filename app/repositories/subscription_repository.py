import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import Subscription


async def get_by_company(session: AsyncSession, company_id: uuid.UUID) -> Subscription | None:
    result = await session.execute(select(Subscription).where(Subscription.company_id == company_id))
    return result.scalar_one_or_none()


async def create_default(session: AsyncSession, company_id: uuid.UUID) -> Subscription:
    subscription = Subscription(company_id=company_id)
    session.add(subscription)
    await session.flush()
    return subscription
