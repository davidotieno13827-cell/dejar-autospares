"""Unit tests for app.py Flask backend."""

import os
import json
from unittest.mock import patch, MagicMock

import pytest

# Set environment variables before importing app
os.environ["MPESA_CONSUMER_KEY"] = "test_consumer_key"
os.environ["MPESA_CONSUMER_SECRET"] = "test_consumer_secret"
os.environ["MPESA_PASSKEY"] = "test_passkey"
os.environ["MPESA_BUSINESS_SHORTCODE"] = "174379"
os.environ["MPESA_MODE"] = "sandbox"
os.environ["MPESA_CALLBACK_URL"] = "https://example.com/callback"

import app as flask_app


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    flask_app.app.config["TESTING"] = True
    with flask_app.app.test_client() as client:
        yield client


class TestSearchRouting:
    """Tests for the search entry route."""

    def test_search_route_returns_index_page(self, client):
        response = client.get("/search?q=oil")
        assert response.status_code == 200
        assert b"Dejar Zion Auto Supplies" in response.data


class TestHealthEndpoint:
    """Tests for the /health endpoint."""

    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_returns_json(self, client):
        response = client.get("/health")
        data = response.get_json()
        assert data["status"] == "ok"

    def test_health_includes_mpesa_mode(self, client):
        response = client.get("/health")
        data = response.get_json()
        assert "mpesa_mode" in data
        assert data["mpesa_mode"] == "sandbox"

    def test_health_includes_urls(self, client):
        response = client.get("/health")
        data = response.get_json()
        assert "oauth_url" in data
        assert "stk_push_url" in data
        assert "sandbox" in data["oauth_url"]


class TestStkPushValidation:
    """Tests for /api/stkpush input validation."""

    def test_missing_phone_number(self, client):
        response = client.post(
            "/api/stkpush",
            json={"amount": 100},
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        # When phone is None, it normalizes to empty string and fails phone validation
        assert "CustomerMessage" in data

    def test_missing_amount(self, client):
        response = client.post(
            "/api/stkpush",
            json={"phone": "254712345678"},
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "Phone number and amount are required" in data["CustomerMessage"]

    def test_empty_body(self, client):
        response = client.post(
            "/api/stkpush",
            json={},
            content_type="application/json",
        )
        assert response.status_code == 400

    def test_invalid_phone_format_short(self, client):
        response = client.post(
            "/api/stkpush",
            json={"phone": "07123", "amount": 100},
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "valid Kenyan phone number" in data["CustomerMessage"]

    def test_invalid_phone_format_no_254_prefix(self, client):
        response = client.post(
            "/api/stkpush",
            json={"phone": "123456789012", "amount": 100},
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "valid Kenyan phone number" in data["CustomerMessage"]

    def test_zero_amount(self, client):
        response = client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": "0"},
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "greater than zero" in data["CustomerMessage"]

    def test_negative_amount_stripped_to_digits(self, client):
        """Amount cleaning strips non-digits, so '-100' becomes '100' which is valid."""
        with patch("app.requests.get") as mock_get:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"access_token": "fake_token"}
            mock_get.return_value = mock_response

            with patch("app.requests.post") as mock_post:
                mock_stk = MagicMock()
                mock_stk.status_code = 200
                mock_stk.json.return_value = {
                    "MerchantRequestID": "123",
                    "CheckoutRequestID": "456",
                    "ResponseCode": "0",
                    "ResponseDescription": "Success",
                    "CustomerMessage": "Success. Request accepted.",
                }
                mock_post.return_value = mock_stk

                response = client.post(
                    "/api/stkpush",
                    json={"phone": "254712345678", "amount": "-100"},
                    content_type="application/json",
                )
                assert response.status_code == 200


class TestStkPushAuthentication:
    """Tests for the OAuth token acquisition step."""

    @patch("app.requests.get")
    def test_oauth_failure_returns_400(self, mock_get, client):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_get.return_value = mock_response

        response = client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": 500},
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "Authentication failed" in data["CustomerMessage"]

    @patch("app.requests.get")
    def test_oauth_failure_mentions_sandbox(self, mock_get, client):
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_get.return_value = mock_response

        response = client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": 500},
            content_type="application/json",
        )
        data = response.get_json()
        assert "Sandbox" in data["CustomerMessage"]


class TestStkPushSuccess:
    """Tests for successful STK push flow."""

    @patch("app.requests.post")
    @patch("app.requests.get")
    def test_successful_stk_push(self, mock_get, mock_post, client):
        # Mock OAuth token
        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {"access_token": "test_access_token"}
        mock_get.return_value = mock_token_resp

        # Mock STK push response
        mock_stk_resp = MagicMock()
        mock_stk_resp.status_code = 200
        mock_stk_resp.json.return_value = {
            "MerchantRequestID": "29115-34620561-1",
            "CheckoutRequestID": "ws_CO_191220191020363925",
            "ResponseCode": "0",
            "ResponseDescription": "Success. Request accepted for processing",
            "CustomerMessage": "Success. Request accepted for processing",
        }
        mock_post.return_value = mock_stk_resp

        response = client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": 1500},
            content_type="application/json",
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["ResponseCode"] == "0"

    @patch("app.requests.post")
    @patch("app.requests.get")
    def test_stk_push_constructs_correct_payload(self, mock_get, mock_post, client):
        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {"access_token": "test_access_token"}
        mock_get.return_value = mock_token_resp

        mock_stk_resp = MagicMock()
        mock_stk_resp.status_code = 200
        mock_stk_resp.json.return_value = {"ResponseCode": "0"}
        mock_post.return_value = mock_stk_resp

        client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": 2000},
            content_type="application/json",
        )

        # Verify the STK push API was called with correct payload
        call_kwargs = mock_post.call_args
        payload = call_kwargs.kwargs.get("json") or call_kwargs[1].get("json")
        assert payload["BusinessShortCode"] == "174379"
        assert payload["Amount"] == 2000
        assert payload["PhoneNumber"] == "254712345678"
        assert payload["PartyA"] == "254712345678"
        assert payload["TransactionType"] == "CustomerPayBillOnline"
        assert payload["AccountReference"] == "DeejarLubricants"
        assert payload["CallBackURL"] == "https://example.com/callback"

    @patch("app.requests.post")
    @patch("app.requests.get")
    def test_stk_push_uses_bearer_token(self, mock_get, mock_post, client):
        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {"access_token": "my_token_123"}
        mock_get.return_value = mock_token_resp

        mock_stk_resp = MagicMock()
        mock_stk_resp.status_code = 200
        mock_stk_resp.json.return_value = {"ResponseCode": "0"}
        mock_post.return_value = mock_stk_resp

        client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": 100},
            content_type="application/json",
        )

        call_kwargs = mock_post.call_args
        headers = call_kwargs.kwargs.get("headers") or call_kwargs[1].get("headers")
        assert headers["Authorization"] == "Bearer my_token_123"

    @patch("app.requests.post")
    @patch("app.requests.get")
    def test_amount_with_string_formatting(self, mock_get, mock_post, client):
        """Amount like '1,500' should be cleaned to 1500."""
        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {"access_token": "token"}
        mock_get.return_value = mock_token_resp

        mock_stk_resp = MagicMock()
        mock_stk_resp.status_code = 200
        mock_stk_resp.json.return_value = {"ResponseCode": "0"}
        mock_post.return_value = mock_stk_resp

        response = client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": "1,500"},
            content_type="application/json",
        )
        assert response.status_code == 200

        call_kwargs = mock_post.call_args
        payload = call_kwargs.kwargs.get("json") or call_kwargs[1].get("json")
        assert payload["Amount"] == 1500


class TestStkPushErrorHandling:
    """Tests for exception handling in STK push."""

    @patch("app.requests.get")
    def test_network_error_returns_500(self, mock_get, client):
        mock_get.side_effect = Exception("Connection timeout")

        response = client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": 100},
            content_type="application/json",
        )
        assert response.status_code == 500
        data = response.get_json()
        assert "error" in data
        assert "Connection timeout" in data["error"]

    @patch("app.requests.post")
    @patch("app.requests.get")
    def test_stk_api_error_propagated(self, mock_get, mock_post, client):
        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {"access_token": "token"}
        mock_get.return_value = mock_token_resp

        mock_stk_resp = MagicMock()
        mock_stk_resp.status_code = 500
        mock_stk_resp.json.return_value = {
            "errorCode": "500.001.1001",
            "errorMessage": "Internal Server Error",
        }
        mock_post.return_value = mock_stk_resp

        response = client.post(
            "/api/stkpush",
            json={"phone": "254712345678", "amount": 100},
            content_type="application/json",
        )
        assert response.status_code == 500


class TestPhoneNormalization:
    """Tests for phone number normalization logic."""

    @patch("app.requests.post")
    @patch("app.requests.get")
    def test_phone_with_spaces(self, mock_get, mock_post, client):
        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {"access_token": "token"}
        mock_get.return_value = mock_token_resp

        mock_stk_resp = MagicMock()
        mock_stk_resp.status_code = 200
        mock_stk_resp.json.return_value = {"ResponseCode": "0"}
        mock_post.return_value = mock_stk_resp

        response = client.post(
            "/api/stkpush",
            json={"phone": "254 712 345 678", "amount": 100},
            content_type="application/json",
        )
        assert response.status_code == 200

    @patch("app.requests.post")
    @patch("app.requests.get")
    def test_phone_with_plus_prefix(self, mock_get, mock_post, client):
        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {"access_token": "token"}
        mock_get.return_value = mock_token_resp

        mock_stk_resp = MagicMock()
        mock_stk_resp.status_code = 200
        mock_stk_resp.json.return_value = {"ResponseCode": "0"}
        mock_post.return_value = mock_stk_resp

        response = client.post(
            "/api/stkpush",
            json={"phone": "+254712345678", "amount": 100},
            content_type="application/json",
        )
        assert response.status_code == 200


class TestCredentialValidation:
    """Tests for credential placeholder detection."""

    def test_placeholder_consumer_key(self, client):
        with patch.object(flask_app, "CONSUMER_KEY", "YOUR_PRODUCTION_CONSUMER_KEY"):
            response = client.post(
                "/api/stkpush",
                json={"phone": "254712345678", "amount": 100},
                content_type="application/json",
            )
            assert response.status_code == 500
            data = response.get_json()
            assert "credentials are missing" in data["CustomerMessage"]

    def test_placeholder_shortcode(self, client):
        with patch.object(flask_app, "BUSINESS_SHORT_CODE", "YOUR_SHORTCODE"):
            response = client.post(
                "/api/stkpush",
                json={"phone": "254712345678", "amount": 100},
                content_type="application/json",
            )
            assert response.status_code == 500
            data = response.get_json()
            assert "credentials are missing" in data["CustomerMessage"]
