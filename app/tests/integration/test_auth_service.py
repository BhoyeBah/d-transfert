import re
import uuid

import pytest

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.company import Company, CompanyStatus
from app.models.user import User
from app.services import auth_service


async def _seed_user(db_session) -> User:
    company = Company(
        name="Entreprise Test",
        registration_code=f"DT-{uuid.uuid4().hex[:8].upper()}",
        phone=f"+2246{uuid.uuid4().int % 100000000:08d}",
        default_currency="GNF",
        status=CompanyStatus.ACTIVE,
    )
    db_session.add(company)
    await db_session.flush()

    user = User(
        company_id=company.id,
        matricule=company.registration_code,
        full_name="Owner Test",
        phone=company.phone,
        password_hash=hash_password("Secret123!"),
        is_owner=True,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest.fixture
def force_production_environment(monkeypatch):
    """get_settings() est mis en cache (lru_cache) : on force ENVIRONMENT=production pour ce
    test puis on vide le cache avant/après pour ne pas polluer les autres tests."""
    get_settings.cache_clear()
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-not-the-repo-default")
    monkeypatch.setenv("SUPER_ADMIN_INITIAL_PASSWORD", "test-password-not-the-repo-default")
    yield
    get_settings.cache_clear()


async def test_otp_not_logged_in_clear_in_production(db_session, caplog, force_production_environment):
    user = await _seed_user(db_session)

    with caplog.at_level("INFO", logger="dtransfert.auth"):
        await auth_service.request_password_reset(db_session, user.matricule)

    assert str(user.id) in caplog.text
    # Le message garde le user_id (qui peut contenir des suites de chiffres par hasard, un UUID
    # étant hexadécimal) mais ne doit jamais contenir le code OTP après le ": ".
    assert re.search(r"généré pour user_id=.*: \d{6}", caplog.text) is None


async def test_otp_logged_in_clear_outside_production(db_session, caplog, monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("ENVIRONMENT", "development")
    user = await _seed_user(db_session)

    with caplog.at_level("INFO", logger="dtransfert.auth"):
        await auth_service.request_password_reset(db_session, user.matricule)

    assert re.search(r"généré pour user_id=.*: \d{6}", caplog.text) is not None
    get_settings.cache_clear()
