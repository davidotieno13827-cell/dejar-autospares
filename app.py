import os
import datetime
import smtplib
from email.message import EmailMessage
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import database models
from database import db, init_db, Product, Order, Review, BusinessConfig, AdminUser, AuditLog, get_business_config

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# =========================================================================
# APPLICATION CONFIGURATION
# =========================================================================

# Flask configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///deejar_auto.db'  # Fallback to SQLite for development
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": os.getenv('CORS_ALLOWED_ORIGINS', '*').split(',')}})
init_db(app)

# =========================================================================
# PAYBILL PAYMENT CONFIGURATION
# =========================================================================

PAYBILL_NUMBER = os.getenv("PAYBILL_NUMBER", "542542").strip()
PAYBILL_ACCOUNT = os.getenv("PAYBILL_ACCOUNT", "131141").strip()
PAYMENT_HELP_PHONE = os.getenv("PAYMENT_HELP_PHONE", "+254721419479").strip()

SMTP_SERVER = os.getenv('SMTP_SERVER', '').strip()
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '').strip()
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '').strip()
NOTIFICATION_EMAIL = os.getenv('NOTIFICATION_EMAIL', '').strip()
BUSINESS_EMAIL = os.getenv('BUSINESS_EMAIL', SMTP_USERNAME or NOTIFICATION_EMAIL).strip()

DEBUG_MODE = os.getenv('FLASK_DEBUG', '0') == '1'
AUTHORIZED_ADMINS = os.getenv('AUTHORIZED_ADMIN_EMAILS', '').split(',')

# =========================================================================
# ETIMS / THIRD-PARTY INTEGRATION HELPERS
# =========================================================================

def create_etims_invoice(order):
    """Placeholder ETIMS integration helper.

    In a production integration, replace this stub with a real ETIMS API call.
    Use ETIMS_API_URL and ETIMS_API_KEY from environment configuration.
    """
    etims_url = os.getenv('ETIMS_API_URL', '').strip()
    etims_api_key = os.getenv('ETIMS_API_KEY', '').strip()

    if not etims_url or not etims_api_key:
        return None, 'not_configured'

    # TODO: implement the real ETIMS invoice creation API call here.
    # This stub currently generates a placeholder ETIMS invoice reference for tracking.
    etims_invoice_id = f"ETIMS-{order.order_number}"
    return etims_invoice_id, 'created'


def send_order_notification_email(order, subject, body, customer_email=None, send_to_customer=False):
    """Send a notification email for order events."""
    recipients = []
    if NOTIFICATION_EMAIL:
        recipients.append(NOTIFICATION_EMAIL)

    if send_to_customer and customer_email:
        recipients.append(customer_email)

    if not recipients:
        app.logger.warning("Email notification skipped because no recipient is configured.")
        return False, "no_recipients"

    from_address = BUSINESS_EMAIL or SMTP_USERNAME or NOTIFICATION_EMAIL or 'no-reply@dejarautosupplies.co.ke'
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_address
    message["To"] = ", ".join(recipients)
    message.set_content(body)

    try:
        if not SMTP_SERVER or not SMTP_PORT:
            raise RuntimeError("SMTP configuration is incomplete.")

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            if SMTP_USERNAME and SMTP_PASSWORD:
                smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(message)

        app.logger.info("Order notification email sent: %s", subject)
        return True, None
    except Exception as ex:
        app.logger.error("Failed to send order notification email: %s", ex, exc_info=True)
        return False, str(ex)


# =========================================================================
# VALIDATION HELPERS
# =========================================================================


# =========================================================================
# AUTHENTICATION & AUTHORIZATION
# =========================================================================

def require_admin(f):
    """Decorator to protect admin endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized - missing token'}), 401
        
        # In production, validate the JWT token from Google
        # For now, we'll accept any valid format
        token = auth_header.split(' ')[1]
        
        # Verify token is from authorized admin
        try:
            # Decode JWT (in production, verify signature with Google's public key)
            # This is a simplified version
            admin_email = request.headers.get('X-Admin-Email', '')
            if admin_email not in AUTHORIZED_ADMINS:
                return jsonify({'error': 'Unauthorized - not an admin'}), 403
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function


# =========================================================================
# API ROUTES
# =========================================================================

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint for uptime monitoring"""
    try:
        db.session.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return jsonify({
        "status": "ok",
        "environment": os.getenv("FLASK_ENV", "production"),
        "payment_method": "paybill",
        "database": db_status
    }), 200


@app.route("/api/config", methods=["GET"])
def get_config():
    """Get public business configuration"""
    try:
        config = get_business_config()
        return jsonify({
            "tax_rate": config.tax_rate,
            "business_shortcode": config.business_shortcode,
            "business_account": config.business_account
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/products", methods=["GET"])
def get_products():
    """Get all active products"""
    try:
        products = Product.query.filter_by(is_active=True).all()
        return jsonify([p.to_dict() for p in products]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    """Get approved customer reviews"""
    try:
        reviews = Review.query.filter_by(is_approved=True).all()
        return jsonify([r.to_dict() for r in reviews]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/reviews", methods=["GET"])
@require_admin
def get_admin_reviews():
    """Get customer reviews for moderation"""
    try:
        status = request.args.get('status', 'all').lower()
        query = Review.query

        if status == 'approved':
            query = query.filter_by(is_approved=True)
        elif status == 'pending':
            query = query.filter_by(is_approved=False)

        reviews = query.order_by(Review.created_at.desc()).all()
        return jsonify([r.to_dict() for r in reviews]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/orders", methods=["POST"])
def create_order():
    """Create a quick order with reference code"""
    try:
        data = request.json
        product_id = data.get('product_id')
        product_name = data.get('product_name')
        amount = data.get('amount_ksh')
        customer_name = data.get('customer_name')
        customer_phone = data.get('customer_phone', 'pending')
        customer_email = data.get('customer_email')

        if not product_name or not amount:
            return jsonify({"error": "Missing product name or amount"}), 400

        import uuid
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

        order = Order(
            order_number=order_number,
            customer_phone=customer_phone,
            customer_name=customer_name,
            customer_email=customer_email,
            product_name=product_name,
            product_id=product_id,
            quantity=1,
            amount_ksh=amount,
            status='pending',
            payment_method='paybill',
            source='web',
            tax_rate=16
        )
        db.session.add(order)
        db.session.commit()

        email_subject = f"New quick order created: {order.order_number}"
        email_body = f"""
A new quick order was created on {BUSINESS_EMAIL or 'Dejar Auto Supplies'}.
Order Number: {order.order_number}
Product: {order.product_name}
Amount: Ksh {order.amount_ksh:.2f}
Customer Name: {order.customer_name or 'N/A'}
Customer Phone: {order.customer_phone}
Customer Email: {customer_email or 'N/A'}
Source: {order.source}
"""
        send_order_notification_email(order, email_subject, email_body, customer_email=customer_email, send_to_customer=False)

        return jsonify({
            "id": order.id,
            "order_number": order_number,
            "product_name": product_name,
            "amount_ksh": amount,
            "customer_email": customer_email,
            "paybill": PAYBILL_NUMBER,
            "account": PAYBILL_ACCOUNT,
            "whatsapp": PAYMENT_HELP_PHONE
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/orders/<int:order_id>/send-etims", methods=["POST"])
def send_etims_invoice(order_id):
    """Send or retry ETIMS invoice creation for an order."""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        etims_invoice_id, etims_status = create_etims_invoice(order)
        if not etims_invoice_id:
            order.etims_status = etims_status
            db.session.commit()
            return jsonify({"error": "ETIMS integration not configured", "status": etims_status}), 500

        order.etims_invoice_id = etims_invoice_id
        order.etims_status = etims_status
        db.session.commit()

        return jsonify(order.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/orders", methods=["GET"])
def get_orders():
    """Get all orders for admin review"""
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify([o.to_dict() for o in orders]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/orders/<int:order_id>/mark-paid", methods=["PUT"])
def mark_order_paid(order_id):
    """Mark an order as paid and completed"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        order.status = 'completed'
        order.completed_at = datetime.datetime.utcnow()
        db.session.commit()

        email_subject = f"Order payment marked as paid: {order.order_number}"
        email_body = f"""
Order payment has been marked as paid.
Order Number: {order.order_number}
Product: {order.product_name}
Quantity: {order.quantity}
Total Amount: Ksh {order.amount_ksh:.2f}
Customer Name: {order.customer_name or 'N/A'}
Customer Phone: {order.customer_phone}
Payment Method: {order.payment_method}
Status: {order.status}
Completed At: {order.completed_at.isoformat()}
"""
        send_order_notification_email(order, email_subject, email_body, send_to_customer=False)

        return jsonify(order.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/reviews", methods=["POST"])
def submit_review():
    """Submit a new customer review"""
    try:
        data = request.json
        
        # Validate input
        if not data.get('customer_name') or not data.get('comment'):
            return jsonify({"error": "Name and comment are required"}), 400
        
        review = Review(
            customer_name=data.get('customer_name'),
            rating=data.get('rating', 5),
            comment=data.get('comment'),
            is_approved=True
        )
        
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            "message": "Review submitted successfully",
            "requires_approval": False
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/reviews/<int:review_id>/approve", methods=["PUT"])
@require_admin
def approve_review(review_id):
    """Approve a customer review"""
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404

        review.is_approved = True
        db.session.commit()

        return jsonify(review.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/reviews/<int:review_id>/reject", methods=["PUT"])
@require_admin
def reject_review(review_id):
    """Reject a customer review"""
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404

        review.is_approved = False
        db.session.commit()

        return jsonify(review.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/orders/confirm", methods=["POST"])
def confirm_order_payment():
    """Simple endpoint to confirm an order payment using an M-Pesa transaction ID.

    Accepts JSON: { order_id: int, mpesa_transaction_id: str, receipt_number?: str }
    Marks the order completed and saves the transaction id.
    """
    try:
        data = request.json or {}
        order_id = data.get('order_id')
        txn_id = data.get('mpesa_transaction_id')
        receipt = data.get('receipt_number')

        if not order_id or not txn_id:
            return jsonify({"error": "order_id and mpesa_transaction_id are required"}), 400

        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        order.mpesa_transaction_id = txn_id
        if receipt:
            order.mpesa_receipt_number = receipt
        order.status = 'completed'
        order.completed_at = datetime.datetime.utcnow()
        db.session.commit()

        customer_email = data.get('customer_email')
        email_subject = f"Order payment confirmed: {order.order_number}"
        email_body = f"""
Order payment has been confirmed.
Order Number: {order.order_number}
Product: {order.product_name}
Quantity: {order.quantity}
Total Amount: Ksh {order.amount_ksh:.2f}
Customer Name: {order.customer_name or 'N/A'}
Customer Phone: {order.customer_phone}
MPESA Transaction ID: {txn_id}
Receipt Number: {receipt or 'N/A'}
Status: {order.status}
Completed At: {order.completed_at.isoformat()}
"""
        send_order_notification_email(order, email_subject, email_body, customer_email=customer_email, send_to_customer=True)

        return jsonify({"message": "Order confirmed", "order": order.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=DEBUG_MODE)
