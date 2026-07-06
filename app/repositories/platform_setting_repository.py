from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.platform_setting import PlatformSetting


async def get(session: AsyncSession) -> PlatformSetting | None:
    result = await session.execute(select(PlatformSetting).limit(1))
    return result.scalar_one_or_none()


async def create_default(session: AsyncSession) -> PlatformSetting:
    setting = PlatformSetting(supported_currencies=["XOF", "GNF", "USD", "EUR"])
    session.add(setting)
    await session.flush()
    return setting
