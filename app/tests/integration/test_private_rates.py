async def _register_and_login_owner(client, **overrides) -> tuple[str, str]:
    payload = {
        "company_name": "Entreprise Taux",
        "company_phone": "+224910000001",
        "address": "Conakry",
        "default_currency": "GNF",
        "owner_full_name": "Owner Taux",
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


async def test_create_global_private_rate(client):
    _, token = await _register_and_login_owner(client)

    response = await client.post(
        "/api/v1/private-rates",
        json={"currency": "GNF", "rate": "14.5"},
        headers=_auth_headers(token),
    )
    assert response.status_code == 201
    body = response.json()
    assert body["currency"] == "GNF"
    assert body["rate"] == "14.5"
    assert body["collaboration_id"] is None
    assert body["is_active"] is True


async def test_create_private_rate_rejects_unsupported_currency(client):
    _, token = await _register_and_login_owner(client)

    response = await client.post(
        "/api/v1/private-rates",
        json={"currency": "ZZZ", "rate": "14.5"},
        headers=_auth_headers(token),
    )
    assert response.status_code == 422


async def test_create_private_rate_rejects_non_positive_rate(client):
    _, token = await _register_and_login_owner(client)

    response = await client.post(
        "/api/v1/private-rates",
        json={"currency": "GNF", "rate": "0"},
        headers=_auth_headers(token),
    )
    assert response.status_code == 422


async def test_list_private_rates_scoped_to_company(client):
    _, token_a = await _register_and_login_owner(
        client, company_name="Entreprise A", company_phone="+224910000010"
    )
    _, token_b = await _register_and_login_owner(
        client, company_name="Entreprise B", company_phone="+224910000011"
    )

    await client.post(
        "/api/v1/private-rates",
        json={"currency": "GNF", "rate": "14.5"},
        headers=_auth_headers(token_a),
    )

    list_a = await client.get("/api/v1/private-rates", headers=_auth_headers(token_a))
    assert list_a.status_code == 200
    assert len(list_a.json()) == 1

    list_b = await client.get("/api/v1/private-rates", headers=_auth_headers(token_b))
    assert list_b.status_code == 200
    assert list_b.json() == []


async def test_update_private_rate_status(client):
    _, token = await _register_and_login_owner(client)
    create_response = await client.post(
        "/api/v1/private-rates",
        json={"currency": "GNF", "rate": "14.5"},
        headers=_auth_headers(token),
    )
    rate_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/private-rates/{rate_id}/status",
        json={"is_active": False},
        headers=_auth_headers(token),
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False
    assert response.json()["deactivated_at"] is not None


async def test_update_private_rate_status_unknown_id_returns_404(client):
    _, token = await _register_and_login_owner(client)
    response = await client.patch(
        "/api/v1/private-rates/00000000-0000-0000-0000-000000000000/status",
        json={"is_active": False},
        headers=_auth_headers(token),
    )
    assert response.status_code == 404


async def _create_employee_without_permissions(client, owner_token: str) -> str:
    create_response = await client.post(
        "/api/v1/employees",
        json={
            "full_name": "Employé Sans Permission",
            "phone": "+224910099999",
            "password": "EmployeePass123!",
            "permissions": [],
        },
        headers=_auth_headers(owner_token),
    )
    employee_matricule = create_response.json()["matricule"]
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"matricule": employee_matricule, "password": "EmployeePass123!"},
    )
    return login_response.json()["access_token"]


async def test_list_private_rates_requires_view_permission(client):
    _, owner_token = await _register_and_login_owner(client)
    employee_token = await _create_employee_without_permissions(client, owner_token)

    response = await client.get("/api/v1/private-rates", headers=_auth_headers(employee_token))
    assert response.status_code == 403


async def test_create_private_rate_requires_manage_permission(client):
    _, owner_token = await _register_and_login_owner(client)
    employee_token = await _create_employee_without_permissions(client, owner_token)

    response = await client.post(
        "/api/v1/private-rates",
        json={"currency": "GNF", "rate": "14.5"},
        headers=_auth_headers(employee_token),
    )
    assert response.status_code == 403
