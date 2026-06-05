from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
import datetime
import base64

app = Flask(__name__)
CORS(app)

# =========================================================================
# SAFARICOM DARAJA API CONFIGURATION (LIVE PRODUCTION ENVIRONMENT)
# =========================================================================
# Drop the live business credentials here when the client provides them:
CONSUMER_KEY = "YOUR_LIVE_PRODUCTION_CONSUMER_KEY"
CONSUMER_SECRET = "YOUR_LIVE_PRODUCTION_CONSUMER_SECRET"
LIPA_NA_MPESA_ONLINE_PASSKEY = "YOUR_LIVE_PRODUCTION_PASSKEY"

# If using a Paybill, use the Paybill number. If using a Till, use the Store Number.
BUSINESS_SHORT_CODE = "YOUR_LIVE_SHORTCODE"


@app.route("/api/stkpush", methods=["POST"])
def trigger_stk_push():
    try:
        data = request.json
        phone_number = str(data.get("phone")).strip()
        amount_raw = data.get("amount")

        # Clean the input amount strictly to integers
        amount = int("".join(filter(str.isdigit, str(amount_raw))))

        # 1. Generate LIVE Production Access Token
        token_url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        token_response = requests.get(
            token_url, auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET)
        )

        if token_response.status_code != 200:
            return (
                jsonify(
                    {
                        "CustomerMessage": "Safaricom Production Authentication failed. Please check your live keys."
                    }
                ),
                400,
            )

        access_token = token_response.json().get("access_token")

        # 2. Setup Timestamps & Live Password Encryption
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        password_string = BUSINESS_SHORT_CODE + LIPA_NA_MPESA_ONLINE_PASSKEY + timestamp
        encrypted_password = base64.b64encode(password_string.encode()).decode("utf-8")

        # 3. Construct Live Safaricom STK Push Payload
        stk_url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
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
            # Once hosted online, replace this with your actual URL to receive payment logs
            "CallBackURL": "https://callback-test-deejar.requestcatcher.com/test",
            "AccountReference": "DeejarAutoSpares",
            "TransactionDesc": "Payment for Vehicle Spare Parts",
        }

        # 4. Broadcast request straight to Safaricom's Production Core Network
        safaricom_response = requests.post(stk_url, json=payload, headers=headers)
        return jsonify(safaricom_response.json()), safaricom_response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
