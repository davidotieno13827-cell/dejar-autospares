"""
Database Models for Dejar Auto Supplies
PostgreSQL-based data persistence for products, orders, reviews, and configuration.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()


class Product(db.Model):
    """Product inventory model"""
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, index=True)
    category = db.Column(db.String(100), nullable=False)  # engine, transmission, gear, brake
    vehicle_make = db.Column(db.String(100))
    description = db.Column(db.Text)
    price_ksh = db.Column(db.Float, nullable=False)
    quantity_in_stock = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'vehicle_make': self.vehicle_make,
            'description': self.description,
            'price_ksh': self.price_ksh,
            'quantity_in_stock': self.quantity_in_stock,
            'image_url': self.image_url,
            'is_active': self.is_active
        }


class Order(db.Model):
    """Order transaction model"""
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, index=True)
    customer_phone = db.Column(db.String(15), nullable=False)
    customer_name = db.Column(db.String(255))
    customer_email = db.Column(db.String(255))
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    product_name = db.Column(db.String(255))
    quantity = db.Column(db.Integer, default=1)
    amount_ksh = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, completed, failed, cancelled
    mpesa_transaction_id = db.Column(db.String(100))
    mpesa_receipt_number = db.Column(db.String(100))
    payment_method = db.Column(db.String(50))  # paybill, bank_transfer, mobile_money, cash, pos_terminal
    source = db.Column(db.String(50), default='web')  # web, pos, whatsapp, api
    etims_invoice_id = db.Column(db.String(100))
    etims_status = db.Column(db.String(50), default='not_sent')
    tax_rate = db.Column(db.Float)  # Store the tax rate at time of order
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    product = db.relationship('Product', backref='orders')

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'quantity': self.quantity,
            'amount_ksh': self.amount_ksh,
            'status': self.status,
            'mpesa_transaction_id': self.mpesa_transaction_id,
            'mpesa_receipt_number': self.mpesa_receipt_number,
            'payment_method': self.payment_method,
            'source': self.source,
            'etims_invoice_id': self.etims_invoice_id,
            'etims_status': self.etims_status,
            'tax_rate': self.tax_rate,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class Review(db.Model):
    """Customer review model"""
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Integer)  # 1-5 stars
    comment = db.Column(db.Text)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref='reviews')

    def to_dict(self):
        return {
            'id': self.id,
            'customer_name': self.customer_name,
            'rating': self.rating,
            'comment': self.comment,
            'product_id': self.product_id,
            'is_approved': self.is_approved,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class BusinessConfig(db.Model):
    """Business configuration and settings"""
    __tablename__ = 'business_config'
    
    id = db.Column(db.Integer, primary_key=True)
    tax_rate = db.Column(db.Float, default=16.0)  # VAT percentage
    business_shortcode = db.Column(db.String(50))  # Paybill shortcode (e.g., 542542)
    business_account = db.Column(db.String(50))  # Paybill account number (e.g., 131141)
    business_email = db.Column(db.String(255))
    business_phone = db.Column(db.String(15))
    business_location = db.Column(db.Text)
    auto_approve_reviews = db.Column(db.Boolean, default=False)
    notification_email = db.Column(db.String(255))  # Email to notify on new orders
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.String(255))  # Admin email who made the update

    def to_dict(self):
        return {
            'tax_rate': self.tax_rate,
            'business_shortcode': self.business_shortcode,
            'business_account': self.business_account,
            'business_email': self.business_email,
            'business_phone': self.business_phone,
            'business_location': self.business_location,
            'auto_approve_reviews': self.auto_approve_reviews,
            'notification_email': self.notification_email
        }


class AdminUser(db.Model):
    """Admin user with OAuth authentication"""
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255))
    google_id = db.Column(db.String(255), unique=True)  # Google OAuth ID
    role = db.Column(db.String(50), default='viewer')  # admin, editor, viewer
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class AuditLog(db.Model):
    """Audit trail for admin actions"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    admin_email = db.Column(db.String(255))
    action = db.Column(db.String(255))  # added_product, updated_config, generated_invoice, etc.
    resource_type = db.Column(db.String(100))  # product, order, review, config
    resource_id = db.Column(db.Integer)
    details = db.Column(db.Text)  # JSON string with change details
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'admin_email': self.admin_email,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    with app.app_context():
        db.create_all()
        
        # Ensure default business config exists
        config = BusinessConfig.query.first()
        if not config:
            config = BusinessConfig(
                tax_rate=16.0,
                business_shortcode='542542',
                business_account='131141'
            )
            db.session.add(config)
            db.session.commit()


def get_business_config():
    """Get current business configuration"""
    config = BusinessConfig.query.first()
    return config if config else BusinessConfig()
