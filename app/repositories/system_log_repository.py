import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.system_log import SystemLog, SystemLogLevel


async def create(
    session: AsyncSession,
    level: SystemLogLevel,
    source: str,
    message: str,
    company_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
) -> SystemLog:
    log = SystemLog(
        level=level, source=source, message=message[:1000], company_id=company_id, user_id=user_id
    )
    session.add(log)
    await session.flush()
    return log


async def list_recent(session: AsyncSession, limit: int = 500) -> list[SystemLog]:
    result = await session.execute(
        select(SystemLog).order_by(SystemLog.created_at.desc()).limit(limit)
    )
    return list(result.scalars().all())
