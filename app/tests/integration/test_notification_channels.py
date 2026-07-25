import asyncio

from app.services import notification_channel_service


async def _register_and_login_owner(client, **overrides) -> tuple[str, str]:
    payload = {
        "company_name": "Entreprise Canaux",
        "company_phone": "+224899500001",
        "address": "Conakry",
        "default_currency": "GNF",
        "owner_full_name": "Owner Canaux",
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


async def test_notify_schedules_external_dispatch_for_recipient_owner(client, monkeypatch):
    calls = []

    async def fake_dispatch(to_email, to_phone, subject, body):
        calls.append((to_email, to_phone, subject, body))

    monkeypatch.setattr(notification_channel_service, "dispatch", fake_dispatch)

    matricule_a, token_a = await _register_and_login_owner(
        client,
        company_name="Entreprise Canaux A",
        company_phone="+224899500001",
        owner_email="a@example.com",
    )
    matricule_b, token_b = await _register_and_login_owner(
        client,
        company_name="Entreprise Canaux B",
        company_phone="+224899500002",
        owner_email="b@example.com",
    )

    await client.post(
        "/api/v1/collaborations",
        json={"target_matricule": matricule_b, "currency": "GNF", "initial_rate": "16"},
        headers=_auth_headers(token_a),
    )

    # Le dispatch externe est planifié en tâche de fond après le commit (voir
    # notification_service._broadcast_after_commit) : laisser la boucle asyncio lui
    # donner l'occasion de s'exécuter avant de vérifier.
    for _ in range(20):
        if calls:
            break
        await asyncio.sleep(0.02)

    assert len(calls) == 1
    to_email, to_phone, _subject, body = calls[0]
    assert to_email == "b@example.com"
    assert to_phone == "+224899500002"
    assert "Entreprise Canaux A" in body


async def test_notify_without_configured_channels_does_not_break_the_request(client):
    matricule_a, token_a = await _register_and_login_owner(
        client, company_name="Entreprise Canaux C", company_phone="+224899500003"
    )
    _matricule_b, _token_b = await _register_and_login_owner(
        client, company_name="Entreprise Canaux D", company_phone="+224899500004"
    )

    response = await client.post(
        "/api/v1/collaborations",
        json={"target_matricule": _matricule_b, "currency": "GNF", "initial_rate": "16"},
        headers=_auth_headers(token_a),
    )
    assert response.status_code == 201
