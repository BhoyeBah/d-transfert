from types import SimpleNamespace

import pytest

from app.services import notification_channel_service


def _settings(**overrides) -> SimpleNamespace:
    defaults = dict(
        smtp_host=None,
        smtp_port=587,
        smtp_username=None,
        smtp_password=None,
        smtp_from_email=None,
        smtp_use_tls=True,
        twilio_account_sid=None,
        twilio_auth_token=None,
        twilio_sms_from=None,
        twilio_whatsapp_from=None,
    )
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


def _configure_email(monkeypatch, **overrides):
    settings = _settings(
        smtp_host="smtp.example.com",
        smtp_from_email="notifications@d-transfert.test",
        **overrides,
    )
    monkeypatch.setattr(notification_channel_service, "get_settings", lambda: settings)
    return settings


def _configure_twilio(monkeypatch, **overrides):
    settings = _settings(
        twilio_account_sid="AC_test",
        twilio_auth_token="secret_token",
        twilio_sms_from="+10000000000",
        twilio_whatsapp_from="+10000000001",
        **overrides,
    )
    monkeypatch.setattr(notification_channel_service, "get_settings", lambda: settings)
    return settings


class _FakeSMTP:
    instances: list["_FakeSMTP"] = []

    def __init__(self, host, port, timeout=None):
        self.host = host
        self.port = port
        self.started_tls = False
        self.logged_in = None
        self.sent = None
        _FakeSMTP.instances.append(self)

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False

    def starttls(self):
        self.started_tls = True

    def login(self, username, password):
        self.logged_in = (username, password)

    def sendmail(self, from_addr, to_addrs, msg):
        self.sent = (from_addr, to_addrs, msg)


class _RaisingSMTP:
    def __init__(self, *args, **kwargs):
        raise ConnectionRefusedError("smtp down")


class _FakeTwilioResponse:
    def raise_for_status(self):
        pass


class _RaisingTwilioResponse:
    def raise_for_status(self):
        raise RuntimeError("twilio error")


class _FakeAsyncClient:
    calls: list[dict] = []
    response_cls = _FakeTwilioResponse

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc_info):
        return False

    async def post(self, url, data=None, auth=None):
        _FakeAsyncClient.calls.append({"url": url, "data": data, "auth": auth})
        return self.response_cls()


@pytest.fixture(autouse=True)
def _reset_fakes():
    _FakeSMTP.instances = []
    _FakeAsyncClient.calls = []
    _FakeAsyncClient.response_cls = _FakeTwilioResponse
    yield


@pytest.fixture(autouse=True)
def _no_real_system_log(monkeypatch):
    calls = []

    async def fake_log_standalone(level, source, message):
        calls.append((level, source, message))

    monkeypatch.setattr(notification_channel_service.system_log_service, "log_standalone", fake_log_standalone)
    return calls


async def test_send_email_noop_when_not_configured(monkeypatch):
    monkeypatch.setattr(notification_channel_service, "get_settings", lambda: _settings())
    monkeypatch.setattr(notification_channel_service.smtplib, "SMTP", _RaisingSMTP)

    await notification_channel_service.send_email("client@example.com", "Sujet", "Corps")

    assert _FakeSMTP.instances == []


async def test_send_email_configured_sends_via_smtp(monkeypatch):
    _configure_email(monkeypatch, smtp_username="user", smtp_password="pass")
    monkeypatch.setattr(notification_channel_service.smtplib, "SMTP", _FakeSMTP)

    await notification_channel_service.send_email("client@example.com", "Sujet", "Corps")

    assert len(_FakeSMTP.instances) == 1
    smtp = _FakeSMTP.instances[0]
    assert smtp.started_tls is True
    assert smtp.logged_in == ("user", "pass")
    from_addr, to_addrs, msg = smtp.sent
    assert from_addr == "notifications@d-transfert.test"
    assert to_addrs == ["client@example.com"]
    assert "Sujet" in msg


async def test_send_email_swallows_smtp_errors(monkeypatch, _no_real_system_log):
    _configure_email(monkeypatch)
    monkeypatch.setattr(notification_channel_service.smtplib, "SMTP", _RaisingSMTP)

    await notification_channel_service.send_email("client@example.com", "Sujet", "Corps")

    assert len(_no_real_system_log) == 1


async def test_send_sms_noop_when_not_configured(monkeypatch):
    monkeypatch.setattr(notification_channel_service, "get_settings", lambda: _settings())
    monkeypatch.setattr(notification_channel_service, "httpx", SimpleNamespace(AsyncClient=_FakeAsyncClient))

    await notification_channel_service.send_sms("+22400000000", "Bonjour")

    assert _FakeAsyncClient.calls == []


async def test_send_sms_configured_calls_twilio(monkeypatch):
    _configure_twilio(monkeypatch)
    monkeypatch.setattr(notification_channel_service, "httpx", SimpleNamespace(AsyncClient=_FakeAsyncClient))

    await notification_channel_service.send_sms("+22400000000", "Bonjour")

    assert len(_FakeAsyncClient.calls) == 1
    call = _FakeAsyncClient.calls[0]
    assert call["data"]["From"] == "+10000000000"
    assert call["data"]["To"] == "+22400000000"
    assert call["data"]["Body"] == "Bonjour"
    assert call["auth"] == ("AC_test", "secret_token")


async def test_send_whatsapp_prefixes_numbers(monkeypatch):
    _configure_twilio(monkeypatch)
    monkeypatch.setattr(notification_channel_service, "httpx", SimpleNamespace(AsyncClient=_FakeAsyncClient))

    await notification_channel_service.send_whatsapp("+22400000000", "Bonjour")

    assert len(_FakeAsyncClient.calls) == 1
    call = _FakeAsyncClient.calls[0]
    assert call["data"]["From"] == "whatsapp:+10000000001"
    assert call["data"]["To"] == "whatsapp:+22400000000"


async def test_send_sms_swallows_twilio_errors(monkeypatch, _no_real_system_log):
    _configure_twilio(monkeypatch)
    fake_client_cls = type(
        "RaisingAsyncClient",
        (_FakeAsyncClient,),
        {"response_cls": _RaisingTwilioResponse},
    )
    monkeypatch.setattr(notification_channel_service, "httpx", SimpleNamespace(AsyncClient=fake_client_cls))

    await notification_channel_service.send_sms("+22400000000", "Bonjour")

    assert len(_no_real_system_log) == 1


async def test_dispatch_calls_applicable_channels(monkeypatch):
    calls = []

    async def fake_send_email(to_email, subject, body):
        calls.append(("email", to_email))

    async def fake_send_sms(to_phone, body):
        calls.append(("sms", to_phone))

    async def fake_send_whatsapp(to_phone, body):
        calls.append(("whatsapp", to_phone))

    monkeypatch.setattr(notification_channel_service, "send_email", fake_send_email)
    monkeypatch.setattr(notification_channel_service, "send_sms", fake_send_sms)
    monkeypatch.setattr(notification_channel_service, "send_whatsapp", fake_send_whatsapp)

    await notification_channel_service.dispatch("client@example.com", "+22400000000", "Sujet", "Corps")
    assert set(calls) == {("email", "client@example.com"), ("sms", "+22400000000"), ("whatsapp", "+22400000000")}

    calls.clear()
    await notification_channel_service.dispatch("client@example.com", None, "Sujet", "Corps")
    assert calls == [("email", "client@example.com")]

    calls.clear()
    await notification_channel_service.dispatch(None, None, "Sujet", "Corps")
    assert calls == []
