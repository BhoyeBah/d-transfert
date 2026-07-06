import uuid
from enum import StrEnum

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPKMixin


class SystemLogLevel(StrEnum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class SystemLog(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "system_logs"

    level: Mapped[SystemLogLevel] = mapped_column(
        Enum(SystemLogLevel, native_enum=False, length=16), nullable=False
    )
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    company_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
