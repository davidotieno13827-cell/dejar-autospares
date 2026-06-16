import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
from requests.exceptions import ConnectionError, Timeout
import datetime
import base64

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================================================================
# SAFARICOM DARAJA API CONFIGURATION (PRODUCTION OR SANDBOX)
# =========================================================================
# Configure these values in environment variables for safer deployment.
MPESA_MODE = os.getenv("MPESA_MODE", "production").strip().lower()
CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY", "YOUR_PRODUCTION_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "YOUR_PRODUCTION_CONSUMER_SECRET")
LIPA_NA_MPESA_ONLINE_PASSKEY = os.getenv("MPESA_PASSKEY", "YOUR_PRODUCTION_PASSKEY")
BUSINESS_SHORT_CODE = os.getenv("MPESA_BUSINESS_SHORTCODE", "YOUR_SHORTCODE")
CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL", "https://callback-test-deejar.requestcatcher.com/test")

BASE_URL = "https://sandbox.safaricom.co.ke" if MPESA_MODE == "sandbox" else "https://api.safaricom.co.ke"
OAUTH_URL = os.getenv("MPESA_OAUTH_URL", f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials")
STK_PUSH_URL = os.getenv("MPESA_STK_URL", f"{BASE_URL}/mpesa/stkpush/v1/processrequest")

DEBUG_MODE = os.getenv("FLASK_DEBUG", "0") == "1"


@app.route("/api/stkpush", methods=["POST"])
def trigger_stk_push():
    try:
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return jsonify({"CustomerMessage": "Invalid or missing JSON request body."}), 400

        phone_raw = data.get("phone")
        amount_raw = data.get("amount")

        if not phone_raw or not amount_raw:
            return jsonify({"CustomerMessage": "Phone number and amount are required."}), 400

        phone_number = str(phone_raw).strip()

        if not all([CONSUMER_KEY, CONSUMER_SECRET, LIPA_NA_MPESA_ONLINE_PASSKEY, BUSINESS_SHORT_CODE]) or "YOUR_LIVE" in CONSUMER_KEY or "YOUR_LIVE" in CONSUMER_SECRET or "YOUR_LIVE" in LIPA_NA_MPESA_ONLINE_PASSKEY or "YOUR_LIVE" in BUSINESS_SHORT_CODE or "YOUR_PRODUCTION" in CONSUMER_KEY or "YOUR_PRODUCTION" in CONSUMER_SECRET or "YOUR_PRODUCTION" in LIPA_NA_MPESA_ONLINE_PASSKEY or "YOUR_SHORTCODE" in BUSINESS_SHORT_CODE:
            return jsonify({
                "CustomerMessage": "MPesa credentials are missing or placeholder values are still configured. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY and MPESA_BUSINESS_SHORTCODE in environment variables."
            }), 500

        # Clean the input amount strictly to integers
        digits = "".join(filter(str.isdigit, str(amount_raw)))
        if not digits:
            return jsonify({"CustomerMessage": "The payment amount must be a valid number."}), 400
        amount = int(digits)

        if amount <= 0:
            return jsonify({"CustomerMessage": "The payment amount must be greater than zero."}), 400

        normalized_phone = "".join(filter(str.isdigit, phone_number))
        if not normalized_phone.startswith("254") or len(normalized_phone) != 12:
            return jsonify({"CustomerMessage": "Please use a valid Kenyan phone number in the format 2547XXXXXXXX."}), 400

        phone_number = normalized_phone

        # 1. Generate access token for the selected Daraja environment.
        mode_label = "sandbox" if MPESA_MODE == "sandbox" else "production"
        try:
            token_response = requests.get(
                OAUTH_URL, auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET), timeout=30
            )
        except (ConnectionError, Timeout) as exc:
            logger.error("Failed to connect to Safaricom OAuth endpoint: %s", exc)
            return jsonify({"CustomerMessage": f"Unable to reach Safaricom {mode_label.capitalize()} servers. Please try again later."}), 502

        if token_response.status_code != 200:
            logger.warning("Safaricom OAuth returned %s: %s", token_response.status_code, token_response.text)
            return (
                jsonify(
                    {
                        "CustomerMessage": f"Safaricom {mode_label.capitalize()} Authentication failed. Please check your Daraja keys."
                    }
                ),
                400,
            )

        try:
            token_data = token_response.json()
        except ValueError:
            logger.error("Safaricom OAuth returned non-JSON response: %s", token_response.text[:200])
            return jsonify({"CustomerMessage": "Unexpected response from Safaricom during authentication."}), 502

        access_token = token_data.get("access_token")
        if not access_token:
            logger.error("Safaricom OAuth response missing access_token: %s", token_data)
            return jsonify({"CustomerMessage": "Failed to obtain access token from Safaricom."}), 502

        # 2. Setup timestamp and password encryption for the environment.
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        password_string = BUSINESS_SHORT_CODE + LIPA_NA_MPESA_ONLINE_PASSKEY + timestamp
        encrypted_password = base64.b64encode(password_string.encode()).decode("utf-8")

        # 3. Construct Safaricom STK Push payload.
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "BusinessShortCode": BUSINESS_SHORT_CODE,
            "Password": encrypted_password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",  # Use 'CustomerBuyGoodsOnline' if it is a Till Number
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": BUSINESS_SHORT_CODE,
            "PhoneNumber": phone_number,
            # Once hosted online, replace this URL with your actual callback endpoint.
            "CallBackURL": CALLBACK_URL,
            "AccountReference": "DeejarLubricants",
            "TransactionDesc": "Payment for Lubricants",
        }

        # 4. Broadcast request to the selected Daraja environment
        try:
            safaricom_response = requests.post(STK_PUSH_URL, json=payload, headers=headers, timeout=30)
        except (ConnectionError, Timeout) as exc:
            logger.error("Failed to connect to Safaricom STK Push endpoint: %s", exc)
            return jsonify({"CustomerMessage": "Unable to reach Safaricom payment servers. Please try again later."}), 502

        try:
            response_data = safaricom_response.json()
        except ValueError:
            logger.error("Safaricom STK Push returned non-JSON response (HTTP %s): %s", safaricom_response.status_code, safaricom_response.text[:200])
            return jsonify({"CustomerMessage": "Unexpected response from Safaricom. Please try again later."}), 502

        return jsonify(response_data), safaricom_response.status_code

    except ValueError as e:
        logger.warning("Invalid input in STK push request: %s", e)
        return jsonify({"CustomerMessage": "Invalid input provided. Please check your phone number and amount."}), 400
    except Exception as e:
        logger.exception("Unhandled error in STK push endpoint")
        return jsonify({"CustomerMessage": "An internal error occurred. Please try again later."}), 500


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "environment": os.getenv("FLASK_ENV", "production"),
        "mpesa_mode": MPESA_MODE,
        "oauth_url": OAUTH_URL,
        "stk_push_url": STK_PUSH_URL,
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=DEBUG_MODE)
