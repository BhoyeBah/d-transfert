import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.system_log import SystemLog, SystemLogLevel
from app.repositories import system_log_repository

logger = logging.getLogger("dtransfert.system")


async def log(
    session: AsyncSession,
    level: SystemLogLevel,
    source: str,
    message: str,
    company_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
) -> SystemLog:
    return await system_log_repository.create(session, level, source, message, company_id, user_id)


async def list_recent(session: AsyncSession, limit: int = 500) -> list[SystemLog]:
    return await system_log_repository.list_recent(session, limit)


async def log_standalone(level: SystemLogLevel, source: str, message: str) -> None:
    """For call sites with no request-scoped session (e.g. the unhandled exception
    handler, which must not let a logging failure mask the original error)."""
    try:
        async with AsyncSessionLocal() as session:
            await system_log_repository.create(session, level, source, message)
            await session.commit()
    except Exception:
        logger.exception("Failed to persist system log: %s / %s", source, message)
