import re
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.company import CompanyStatus
from app.utils.currency import is_supported_currency

_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class CompanyMeResponse(BaseModel):
    id: uuid.UUID
    name: str
    registration_code: str
    address: str | None
    phone: str
    default_currency: str
    status: CompanyStatus


class CompanyPublicLookupResponse(BaseModel):
    name: str
    registration_code: str
    phone: str
    address: str | None
    status: CompanyStatus


class AdminCompanyStatusUpdateRequest(BaseModel):
    status: CompanyStatus


class AdminCompanyCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    company_name: str = Field(min_length=2, max_length=255)
    company_phone: str = Field(min_length=6, max_length=32)
    address: str = Field(min_length=2, max_length=255)
    default_currency: str = Field(min_length=3, max_length=8)
    owner_full_name: str = Field(min_length=2, max_length=255)
    # Optionnel : requis uniquement pour recevoir les notifications par email.
    owner_email: str | None = Field(default=None, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    password_confirmation: str = Field(min_length=8, max_length=128)
    status: CompanyStatus = CompanyStatus.ACTIVE

    @field_validator("default_currency")
    @classmethod
    def _validate_currency(cls, value: str) -> str:
        if not is_supported_currency(value):
            raise ValueError(f"Devise non supportée : {value}")
        return value.upper()

    @field_validator("owner_email")
    @classmethod
    def _validate_owner_email(cls, value: str | None) -> str | None:
        if value is not None and not _EMAIL_PATTERN.match(value):
            raise ValueError("Adresse email invalide.")
        return value

    @field_validator("password_confirmation")
    @classmethod
    def _passwords_match(cls, value: str, info) -> str:
        if info.data.get("password") is not None and value != info.data["password"]:
            raise ValueError("Les mots de passe ne correspondent pas.")
        return value


class AdminCompanyUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    address: str | None = None
    phone: str | None = Field(default=None, min_length=6, max_length=32)
    default_currency: str | None = Field(default=None, min_length=3, max_length=8)
