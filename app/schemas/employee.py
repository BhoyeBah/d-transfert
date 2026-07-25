import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.permission_codes import PermissionCode

_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_optional_email(value: str | None) -> str | None:
    if value is not None and not _EMAIL_PATTERN.match(value):
        raise ValueError("Adresse email invalide.")
    return value


class EmployeeCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    full_name: str = Field(min_length=2, max_length=255)
    phone: str = Field(min_length=6, max_length=32)
    # Optionnel : requis uniquement pour recevoir les notifications par email.
    email: str | None = Field(default=None, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    permissions: list[PermissionCode] = Field(default_factory=list)

    @field_validator("email")
    @classmethod
    def _validate_email(cls, value: str | None) -> str | None:
        return _validate_optional_email(value)


class EmployeePermissionsUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    grant: list[PermissionCode] = Field(default_factory=list)
    revoke: list[PermissionCode] = Field(default_factory=list)


class EmployeeStatusUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_active: bool


class EmployeeUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = Field(default=None, min_length=6, max_length=32)
    email: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def _validate_email(cls, value: str | None) -> str | None:
        return _validate_optional_email(value)


class EmployeeResponse(BaseModel):
    id: uuid.UUID
    matricule: str
    full_name: str
    phone: str
    email: str | None
    is_active: bool
    permissions: list[PermissionCode]
    created_at: datetime
