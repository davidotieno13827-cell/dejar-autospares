import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
import datetime
import base64

app = Flask(__name__)
CORS(app)

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
        data = request.json
        phone_number = str(data.get("phone")).strip()
        amount_raw = data.get("amount")

        if not phone_number or not amount_raw:
            return jsonify({"CustomerMessage": "Phone number and amount are required."}), 400

        if not all([CONSUMER_KEY, CONSUMER_SECRET, LIPA_NA_MPESA_ONLINE_PASSKEY, BUSINESS_SHORT_CODE]) or "YOUR_LIVE" in CONSUMER_KEY or "YOUR_LIVE" in CONSUMER_SECRET or "YOUR_LIVE" in LIPA_NA_MPESA_ONLINE_PASSKEY or "YOUR_LIVE" in BUSINESS_SHORT_CODE or "YOUR_PRODUCTION" in CONSUMER_KEY or "YOUR_PRODUCTION" in CONSUMER_SECRET or "YOUR_PRODUCTION" in LIPA_NA_MPESA_ONLINE_PASSKEY or "YOUR_SHORTCODE" in BUSINESS_SHORT_CODE:
            return jsonify({
                "CustomerMessage": "MPesa credentials are missing or placeholder values are still configured. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY and MPESA_BUSINESS_SHORTCODE in environment variables."
            }), 500

        # Clean the input amount strictly to integers
        amount = int("".join(filter(str.isdigit, str(amount_raw))))

        if amount <= 0:
            return jsonify({"CustomerMessage": "The payment amount must be greater than zero."}), 400

        normalized_phone = "".join(filter(str.isdigit, phone_number))
        if not normalized_phone.startswith("254") or len(normalized_phone) != 12:
            return jsonify({"CustomerMessage": "Please use a valid Kenyan phone number in the format 2547XXXXXXXX."}), 400

        phone_number = normalized_phone

        # 1. Generate access token for the selected Daraja environment.
        token_response = requests.get(
            OAUTH_URL, auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET)
        )

        if token_response.status_code != 200:
            mode_label = "sandbox" if MPESA_MODE == "sandbox" else "production"
            return (
                jsonify(
                    {
                        "CustomerMessage": f"Safaricom {mode_label.capitalize()} Authentication failed. Please check your Daraja keys."
                    }
                ),
                400,
            )

        access_token = token_response.json().get("access_token")

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
            "AccountReference": "DeejarAutoSpares",
            "TransactionDesc": "Payment for Vehicle Spare Parts",
        }

        # 4. Broadcast request to the selected Daraja environment
        safaricom_response = requests.post(STK_PUSH_URL, json=payload, headers=headers)
        return jsonify(safaricom_response.json()), safaricom_response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
