import uuid

from app.core.security import create_access_token, hash_password
from app.models.user import User


async def _register_and_login_owner(client, **overrides) -> tuple[str, str]:
    payload = {
        "company_name": "Entreprise Admin",
        "company_phone": "+224901000001",
        "address": "Conakry",
        "default_currency": "GNF",
        "owner_full_name": "Owner Admin",
        "password": "SuperSecret123!",
        "password_confirmation": "SuperSecret123!",
    }
    payload.update(overrides)
    register_response = await client.post("/api/v1/auth/register", json=payload)
    matricule = register_response.json()["registration_code"]
    login_response = await client.post(
        "/api/v1/auth/login", json={"matricule": matricule, "password": payload["password"]}
    )
    return matricule, login_response.json()["access_token"]


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _create_super_admin_token(db_session) -> str:
    super_admin = User(
        company_id=None,
        matricule=f"SA-{uuid.uuid4().hex[:10]}",
        full_name="Super Admin",
        phone=f"+000{uuid.uuid4().int % 100000000:08d}",
        password_hash=hash_password("SuperAdminPass123!"),
        is_owner=False,
        is_super_admin=True,
        is_active=True,
    )
    db_session.add(super_admin)
    await db_session.flush()
    return create_access_token(str(super_admin.id), None)


async def test_owner_cannot_access_admin_endpoints(client):
    _, token = await _register_and_login_owner(client)
    response = await client.get("/api/v1/admin/companies", headers=_auth_headers(token))
    assert response.status_code == 403


async def test_super_admin_can_list_and_suspend_companies(client, db_session):
    _, owner_token = await _register_and_login_owner(client)
    admin_token = await _create_super_admin_token(db_session)

    list_response = await client.get("/api/v1/admin/companies", headers=_auth_headers(admin_token))
    assert list_response.status_code == 200
    companies = list_response.json()
    assert len(companies) == 1
    company_id = companies[0]["id"]

    suspend_response = await client.patch(
        f"/api/v1/admin/companies/{company_id}/status",
        json={"status": "suspended"},
        headers=_auth_headers(admin_token),
    )
    assert suspend_response.status_code == 200
    assert suspend_response.json()["status"] == "suspended"

    login_after_suspend = await client.post(
        "/api/v1/auth/login",
        json={"matricule": companies[0]["registration_code"], "password": "SuperSecret123!"},
    )
    assert login_after_suspend.status_code == 401


async def test_super_admin_can_view_platform_wide_audit_logs(client, db_session):
    _, owner_token = await _register_and_login_owner(client)
    admin_token = await _create_super_admin_token(db_session)

    own_logs = await client.get("/api/v1/admin/audit-logs", headers=_auth_headers(admin_token))
    assert own_logs.status_code == 200
    actions = {log["action"] for log in own_logs.json()}
    assert "login" in actions

    forbidden = await client.get("/api/v1/admin/audit-logs", headers=_auth_headers(owner_token))
    assert forbidden.status_code == 403


async def test_super_admin_can_view_platform_stats(client, db_session):
    _, owner_token = await _register_and_login_owner(client)
    admin_token = await _create_super_admin_token(db_session)

    response = await client.get("/api/v1/admin/stats", headers=_auth_headers(admin_token))
    assert response.status_code == 200
    stats = response.json()
    assert stats["companies_total"] >= 1
    assert stats["companies_active"] >= 1
    assert stats["users_total"] >= 1
    assert "volume_by_currency" in stats

    forbidden = await client.get("/api/v1/admin/stats", headers=_auth_headers(owner_token))
    assert forbidden.status_code == 403


async def test_super_admin_can_view_company_detail(client, db_session):
    _, owner_token = await _register_and_login_owner(client)
    admin_token = await _create_super_admin_token(db_session)

    companies = (await client.get("/api/v1/admin/companies", headers=_auth_headers(admin_token))).json()
    company_id = companies[0]["id"]

    detail = await client.get(
        f"/api/v1/admin/companies/{company_id}", headers=_auth_headers(admin_token)
    )
    assert detail.status_code == 200
    body = detail.json()
    assert body["users_count"] == 1
    assert body["wallets_count"] == 0
    assert body["entries_count"] == 0

    missing = await client.get(
        f"/api/v1/admin/companies/{uuid.uuid4()}", headers=_auth_headers(admin_token)
    )
    assert missing.status_code == 404

    forbidden = await client.get(
        f"/api/v1/admin/companies/{company_id}", headers=_auth_headers(owner_token)
    )
    assert forbidden.status_code == 403


async def test_super_admin_can_list_and_suspend_company_users(client, db_session):
    _, owner_token = await _register_and_login_owner(client)
    admin_token = await _create_super_admin_token(db_session)

    companies = (await client.get("/api/v1/admin/companies", headers=_auth_headers(admin_token))).json()
    company_id = companies[0]["id"]

    users_response = await client.get(
        f"/api/v1/admin/companies/{company_id}/users", headers=_auth_headers(admin_token)
    )
    assert users_response.status_code == 200
    users = users_response.json()
    assert len(users) == 1
    owner_user = users[0]
    assert owner_user["is_owner"] is True
    assert owner_user["is_active"] is True

    suspend_response = await client.patch(
        f"/api/v1/admin/users/{owner_user['id']}/status",
        json={"is_active": False},
        headers=_auth_headers(admin_token),
    )
    assert suspend_response.status_code == 200
    assert suspend_response.json()["is_active"] is False

    # The now-suspended owner can no longer authenticate.
    login_after_suspend = await client.post(
        "/api/v1/auth/login",
        json={"matricule": companies[0]["registration_code"], "password": "SuperSecret123!"},
    )
    assert login_after_suspend.status_code == 401


async def test_super_admin_can_view_system_logs_from_failed_login(client, db_session):
    matricule, owner_token = await _register_and_login_owner(client)
    admin_token = await _create_super_admin_token(db_session)

    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"matricule": matricule, "password": "wrong-password"},
    )
    assert bad_login.status_code == 401

    logs_response = await client.get("/api/v1/admin/system-logs", headers=_auth_headers(admin_token))
    assert logs_response.status_code == 200
    logs = logs_response.json()
    assert any(log["source"] == "auth" for log in logs)

    forbidden = await client.get("/api/v1/admin/system-logs", headers=_auth_headers(owner_token))
    assert forbidden.status_code == 403


async def test_super_admin_can_manage_platform_settings(client, db_session):
    _, owner_token = await _register_and_login_owner(client)
    admin_token = await _create_super_admin_token(db_session)

    get_response = await client.get("/api/v1/admin/settings", headers=_auth_headers(admin_token))
    assert get_response.status_code == 200
    assert get_response.json()["maintenance_mode"] is False

    update_response = await client.patch(
        "/api/v1/admin/settings",
        json={"maintenance_mode": True, "supported_currencies": ["XOF", "USD"]},
        headers=_auth_headers(admin_token),
    )
    assert update_response.status_code == 200
    body = update_response.json()
    assert body["maintenance_mode"] is True
    assert body["supported_currencies"] == ["XOF", "USD"]

    forbidden = await client.patch(
        "/api/v1/admin/settings",
        json={"maintenance_mode": True},
        headers=_auth_headers(owner_token),
    )
    assert forbidden.status_code == 403


async def test_super_admin_can_manage_company_subscription(client, db_session):
    _, owner_token = await _register_and_login_owner(client)
    admin_token = await _create_super_admin_token(db_session)

    companies = (await client.get("/api/v1/admin/companies", headers=_auth_headers(admin_token))).json()
    company_id = companies[0]["id"]

    get_response = await client.get(
        f"/api/v1/admin/companies/{company_id}/subscription", headers=_auth_headers(admin_token)
    )
    assert get_response.status_code == 200
    assert get_response.json()["plan"] == "free"

    update_response = await client.patch(
        f"/api/v1/admin/companies/{company_id}/subscription",
        json={"plan": "premium", "status": "active", "price": "49.99", "currency": "USD"},
        headers=_auth_headers(admin_token),
    )
    assert update_response.status_code == 200
    body = update_response.json()
    assert body["plan"] == "premium"
    assert body["price"] == "49.99"

    forbidden = await client.get(
        f"/api/v1/admin/companies/{company_id}/subscription", headers=_auth_headers(owner_token)
    )
    assert forbidden.status_code == 403
