// ====================================================================
// TOAST NOTIFICATION SYSTEM
// ====================================================================

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = `<i class="fa-solid fa-${getToastIcon(type)}"></i> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto;
    `;
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        'success': 'circle-check',
        'error': 'circle-exclamation',
        'info': 'circle-info',
        'warning': 'triangle-exclamation'
    };
    return icons[type] || 'circle-info';
}

// Add toast styles dynamically
(function () {
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
            animation: slideInRight 0.3s ease;
            max-width: 100%;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        .toast.fade-out {
            animation: slideOutRight 0.3s ease;
        }

        .toast-success {
            background: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }

        .toast-error {
            background: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }

        .toast-info {
            background: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #17a2b8;
        }

        .toast-warning {
            background: #fff3cd;
            color: #856404;
            border-left: 4px solid #ffc107;
        }
    `;
    document.head.appendChild(style);
})();

const INVENTORY_PRODUCTS = [
    { name: 'Honda Ultra LTD Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota SP 5W-30 Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Unbranded/Generic Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota 5W-30 Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Honda Ultra Mild Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota SP 0W-20 Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Honda Ultra Leo Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Nissan SN Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Subaru Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Mercedes Benz Lubricant', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Synthetic Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota 20W-50 Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota 15W-40 Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota CF-4 10W-30 Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Idemitsu 10W-40 Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Yamalube Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Shell Helix HX3 15W-40', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Cryx Excelia Petrol', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Unbranded Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Magnatec', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Lubricant', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Mobil Special Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Synthetic 5W-30 Motor Oil', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Lexus Motor Oil Fully Synthetic', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Nissan Motor Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Motul Specific Motor Oil', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Lubricant', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Edge', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Lubricants', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Lubricants', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Shell Helix HX5 13W-40', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Total Lubricants', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Total Quartz 5W-50', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Total Quartz 5W-30', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Total Lubricants', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Total Quartz Lubricants', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Total Quartz 0W-20', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Total Quartz 10W-40', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Total Quartz 5W-40', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Magnatec', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol GTX', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Synthetic Motor Oil', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'TP Premium Full Synthetic Pro 5W-30', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Nissan Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Synthetic Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Yamalube', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol GTX', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol Magnatec Gold', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Castrol GTX', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Shell Helix HX3', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Mobil 1', volume: '5L', category: 'Engine Oil', price: 0 },
    { name: 'Total Lubricants', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Total Quartz Lubricants', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Total Quartz 10W-30', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Mobil 1', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota 0W-20 Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota SP 5W-30 Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota 10W-30 Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Engine Oil', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Mercedes Benz Lubricant', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota Motor Oil', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Liqui Moly', volume: '1L', category: 'Engine Oil', price: 0 },
    { name: 'Toyota Lubricant', volume: '4L', category: 'Engine Oil', price: 0 },
    { name: 'Honda ATF DW-1', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Mitsubishi ATF SP III', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'ATF Fluid', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Ecstar CVT Fluid Green 2', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Mercon V Automatic Transmission Fluid', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Mercon LV Automatic Transmission Fluid', volume: '5L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota AT Fluid WS', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Honda ATF-Z1', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota WS AT Fluid', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota FE CVT Fluid', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Aisin CFEx', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Nissan CVT Fluid NS-2', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Nissan CVT Fluid NS-3', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota ATF Type T-IV', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota AT Fluid T-IV', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Honda HMMF Multi Matic Fluid', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota TC CVT Fluid', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota CVT Fluid FE', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota Automatic Transmission Fluid Type T-IV', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Mitsubishi Motors ATF SP III', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota CVT Fluid TC', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Honda HCF-2 Transmission Fluid', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'Subaru CVT Oil Lineartronic', volume: '4L', category: 'Transmission Fluid', price: 0 },
    { name: 'ATF Fluid', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota ATF WS', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota AT Fluid T-IV', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota Genuine ATF', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota Automatic Transmission Fluid Type T-IV', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota CVT Fluid TC', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota CVT Fluid FE', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Toyota AT Fluid WS', volume: '1L', category: 'Transmission Fluid', price: 0 },
    { name: 'Heldo Lubricant', volume: '1L', category: 'Specialty Fluids', price: 0 },
    { name: 'Unbranded Lubricant', volume: '1.5L', category: 'Specialty Fluids', price: 0 },
    { name: 'Total Rubia 15W-40', volume: '5L', category: 'Specialty Fluids', price: 0 },
    { name: 'Unbranded Lubricants', volume: '1L', category: 'Specialty Fluids', price: 0 },
    { name: 'Ecstar', volume: '0.5L', category: 'Specialty Fluids', price: 0 },
    { name: 'Lubricant', volume: '1L', category: 'Specialty Fluids', price: 0 },
    { name: 'Lubricant', volume: '1L', category: 'Specialty Fluids', price: 0 },
    { name: 'Lubricant', volume: '1L', category: 'Specialty Fluids', price: 0 },
    { name: 'Unbranded Lubricants', volume: '5L', category: 'Specialty Fluids', price: 0 },
    { name: 'Unbranded Lubricants', volume: '0.5L', category: 'Specialty Fluids', price: 0 },
];

const INVENTORY_CATEGORY_ORDER = ['Engine Oil', 'Transmission Fluid', 'Specialty Fluids'];

function renderInventory() {
    const inventoryContainer = document.getElementById('inventory-sections');
    if (!inventoryContainer) return;
    inventoryContainer.innerHTML = '';

    INVENTORY_CATEGORY_ORDER.forEach((category) => {
        const products = INVENTORY_PRODUCTS.filter((product) => product.category === category);
        if (!products.length) return;

        const categorySection = document.createElement('div');
        categorySection.className = 'inventory-category';

        const heading = document.createElement('h3');
        heading.className = 'inventory-heading';
        heading.textContent = category;
        categorySection.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'oil-grid inventory-grid';
        grid.dataset.category = category.toLowerCase();

        products.forEach((product) => {
            const card = document.createElement('article');
            card.className = 'oil-card';
            card.dataset.category = product.category.toLowerCase();

            const body = document.createElement('div');
            body.className = 'oil-card-body';

            const header = document.createElement('div');
            header.className = 'oil-header';

            const brandLabel = document.createElement('span');
            brandLabel.className = 'oil-type';
            brandLabel.textContent = product.name.split(' ')[0];

            const priceLabel = document.createElement('span');
            priceLabel.className = 'oil-price';
            priceLabel.textContent = product.price > 0 ? `KSh ${product.price.toLocaleString()}` : 'Price on request';

            header.appendChild(brandLabel);
            header.appendChild(priceLabel);

            const title = document.createElement('h3');
            title.textContent = product.name;

            const description = document.createElement('p');
            description.textContent = product.volume ? `${product.volume} volume available. Contact us for exact pricing and bulk discounts.` : 'Contact us for volume, pricing and availability.';

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quick-order-small-btn';
            button.textContent = 'Quick Order';
            button.addEventListener('click', () => openQuickOrder(product.name, product.price));

            body.appendChild(header);
            body.appendChild(title);
            body.appendChild(description);
            body.appendChild(button);
            card.appendChild(body);
            grid.appendChild(card);
        });

        categorySection.appendChild(grid);
        inventoryContainer.appendChild(categorySection);
    });
}

// ====================================================================
// QUICK ORDER & PAYMENT FUNCTIONS
// ====================================================================

let pendingPayment = null;

function openQuickOrder(itemName, itemPrice) {
    pendingPayment = {
        product: itemName,
        price: itemPrice,
        paybill: '542542',
        account: '131141',
        whatsapp: '+254721419479'
    };
    showSimplePaymentModal({
        order_number: `DQ-${Date.now().toString().slice(-6)}`,
        product_name: itemName,
        amount_ksh: itemPrice,
        paybill: pendingPayment.paybill,
        account: pendingPayment.account,
        whatsapp: pendingPayment.whatsapp
    });
}

async function createAndShowOrder() {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_name: pendingPayment.product,
                amount_ksh: pendingPayment.price
            })
        });

        if (!response.ok) {
            showToast('Could not create order. Please try again.', 'error');
            return;
        }

        const order = await response.json();
        showSimplePaymentModal(order);
    } catch (error) {
        console.error('Order creation error:', error);
        showToast('Unable to connect. Try WhatsApp: +254 721 419 479', 'error');
    }
}

function showSimplePaymentModal(order) {
    const modal = document.getElementById('quick-order-modal');
    if (!modal) {
        const fallbackMessage = `Ordering: ${order.product_name} for Ksh ${order.amount_ksh}`;
        alert(fallbackMessage);
        showToast(`Pay Ksh ${Number(order.amount_ksh).toLocaleString()} to Paybill ${order.paybill} Account ${order.account}. Send your transaction ID on WhatsApp.`, 'info');
        return;
    }

    const nameField = document.getElementById('modal-item-name');
    const priceField = document.getElementById('modal-item-price');
    const productField = document.getElementById('display-product');
    const amountField = document.getElementById('display-amount');
    const paybillField = document.getElementById('display-paybill');
    const accountField = document.getElementById('display-account');
    const whatsappField = document.getElementById('display-whatsapp');
    const phoneInput = document.getElementById('checkout-phone');

    if (nameField) nameField.textContent = order.product_name;
    if (priceField) priceField.textContent = String(order.amount_ksh).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (productField) productField.textContent = order.product_name;
    if (amountField) amountField.textContent = `Ksh ${Number(order.amount_ksh).toLocaleString()}`;
    if (paybillField) paybillField.textContent = order.paybill;
    if (accountField) accountField.textContent = order.account;
    if (whatsappField) whatsappField.textContent = order.whatsapp || '+254 721 419 479';
    if (phoneInput) phoneInput.value = '';

    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeQuickOrder() {
    const modal = document.getElementById('quick-order-modal');
    if (!modal) {
        return;
    }

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
}

async function processPayment(event) {
    if (event) event.preventDefault();

    const priceField = document.getElementById('modal-item-price');
    const phoneInput = document.getElementById('checkout-phone');
    const rawAmount = priceField?.innerText || '0';
    const amount = parseFloat(rawAmount.replace(/,/g, ''));
    const phone = phoneInput?.value.trim() || '';

    if (!amount || Number.isNaN(amount)) {
        alert('Unable to read the order amount. Please reopen the checkout and try again.');
        return;
    }

    const normalizedPhone = normalizeMpesaPhone(phone);
    if (!normalizedPhone) {
        alert('Please enter a valid M-Pesa phone number (e.g., 0712345678)');
        return;
    }

    const paybill = document.getElementById('display-paybill')?.innerText || '542542';
    const account = document.getElementById('display-account')?.innerText || '131141';

    const payload = {
        phone: normalizedPhone,
        amount: amount,
        paybill: paybill,
        account: account,
        product_name: document.getElementById('display-product')?.innerText || ''
    };

    const submitButton = document.querySelector('.btn-mpesa-pay');
    if (submitButton) submitButton.disabled = true;

    try {
        const response = await fetch('/api/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(`M-Pesa Failed: ${data.CustomerMessage || data.error || 'Unable to complete payment'}`);
            return;
        }
        alert('Payment request sent successfully! Please check your handset for the M-Pesa PIN prompt.');
    } catch (error) {
        alert('Could not connect to the payment server. Make sure app.py is running on port 5000.');
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

function normalizeMpesaPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (/^0\d{9}$/.test(cleaned)) {
        return '254' + cleaned.slice(1);
    }
    if (/^254\d{9}$/.test(cleaned)) {
        return cleaned;
    }
    if (/^\+254\d{9}$/.test(phone)) {
        return cleaned;
    }
    return null;
}

function sendToWhatsApp() {
    if (!pendingPayment) {
        return;
    }

    const message = `Hello Dejar Auto Supplies, I want to order ${pendingPayment.product} for Ksh ${Number(pendingPayment.price).toLocaleString()}. My payment details are Paybill ${pendingPayment.paybill} and Account ${pendingPayment.account}.`;
    window.open(`https://wa.me/${pendingPayment.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function copyOrderReference() {
    if (!pendingPayment) {
        return;
    }

    const message = `Product: ${pendingPayment.product}\nAmount: Ksh ${Number(pendingPayment.price).toLocaleString()}\nPaybill: ${pendingPayment.paybill}\nAccount: ${pendingPayment.account}`;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(message).then(() => {
            showToast('Payment details copied.', 'info');
        });
        return;
    }

    showToast(message, 'info');
}

// ====================================================================
// REVIEW & CONTACT FUNCTIONS
// ====================================================================

// Handle Customer Reviews form submission
function submitReview(event) {
    if (event) event.preventDefault();
    const name = document.getElementById("review-name").value.trim();
    const text = document.getElementById("review-text").value.trim();

    if (!name || !text) {
        alert("Please add both your name and your review before submitting.");
        return;
    }

    const addReviewCard = () => {
        const reviewsGrid = document.querySelector('.reviews-grid');
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
            <p>"${text}"</p>
            <h4>- ${name}</h4>
        `;

        reviewsGrid.appendChild(reviewCard);

        const emptyNotice = document.getElementById('reviews-empty');
        if (emptyNotice) {
            emptyNotice.remove();
        }
    };

    const handleSuccess = () => {
        addReviewCard();
        alert(`Thanks for your review, ${name}!`);
        document.getElementById("review-form").reset();
    };

    const reviewRequest = fetch('/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customer_name: name,
            comment: text,
            rating: 5
        })
    });

    if (!reviewRequest || typeof reviewRequest.then !== 'function') {
        handleSuccess();
        return;
    }

    reviewRequest
        .then(async response => {
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Unable to submit review');
            }

            if (!data.requires_approval) {
                addReviewCard();
            }

            alert(`Thanks for your review, ${name}!`);
            document.getElementById("review-form").reset();
        })
        .catch(error => {
            console.error('Review submission error:', error);
            alert(error.message || 'Unable to submit review right now.');
        });
}

function submitContactForm(event) {
    if (event) event.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !phone || !message) {
        alert('Please complete the contact form before sending.');
        return;
    }

    const whatsappNumber = '254721419479';
    const whatsappMessage = `Hello Dejar Auto Supplies,\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');

    alert(`Thanks ${name}! Your message is opening in WhatsApp.`);
    document.getElementById('contact-form').reset();
}

// Global visual handlers
function addToCart(name, price) {
    alert(`Added ${name} for Ksh ${price}. For fast orders, use WhatsApp or quick checkout.`);
}

function toggleCart() {
    window.open('https://wa.me/254721419479?text=Hello%20Dejar%20Auto%20Supplies,%20I%20would%20like%20help%20ordering%20lubricants.', '_blank');
}

// ====================================================================
// NAVIGATION & CAROUSEL FUNCTIONS
// ====================================================================

function toggleMobileNav() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    nav.classList.toggle('open');
}

function initSectionCarousels() {
    const carousels = [];

    document.querySelectorAll('.section-carousel').forEach((carousel) => {
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        if (!slides.length) return;

        const stage = carousel.querySelector('.carousel-stage');
        let track = carousel.querySelector('.carousel-track');
        if (!track && stage) {
            track = document.createElement('div');
            track.className = 'carousel-track';
            const fragment = document.createDocumentFragment();
            slides.forEach((slide) => fragment.appendChild(slide));
            track.appendChild(fragment);
            stage.appendChild(track);
        }

        const trackSlides = Array.from(track?.querySelectorAll('.carousel-slide') || []);
        if (!trackSlides.length) return;

        let currentIndex = 0;
        const prevButton = carousel.querySelector('.carousel-btn.prev');
        const nextButton = carousel.querySelector('.carousel-btn.next');
        let dotsContainer = carousel.querySelector('.carousel-dots');

        if (!dotsContainer) {
            dotsContainer = document.createElement('div');
            dotsContainer.className = 'carousel-dots';
            carousel.appendChild(dotsContainer);
        }

        const dots = trackSlides.map((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => goTo(index));
            dotsContainer.appendChild(dot);
            return dot;
        });

        function renderSlides() {
            if (!trackSlides.length) return;

            currentIndex = ((currentIndex % trackSlides.length) + trackSlides.length) % trackSlides.length;

            trackSlides.forEach((slide, index) => {
                const isActive = index === currentIndex;
                slide.classList.toggle('active', isActive);
                slide.style.display = 'flex';
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });

            if (track) {
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }
        }

        function goTo(index) {
            currentIndex = index;
            renderSlides();
        }

        prevButton?.addEventListener('click', () => goTo(currentIndex - 1));
        nextButton?.addEventListener('click', () => goTo(currentIndex + 1));

        let touchStartX = 0;
        let touchEndX = 0;
        stage?.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
        });
        stage?.addEventListener('touchend', (event) => {
            touchEndX = event.changedTouches[0].clientX;
            const delta = touchStartX - touchEndX;
            if (delta > 50) {
                goTo(currentIndex + 1);
            } else if (delta < -50) {
                goTo(currentIndex - 1);
            }
        });

        const autoplayMs = 5500;
        let autoplayTimer = window.setInterval(() => {
            if (trackSlides.length > 1) {
                goTo(currentIndex + 1);
            }
        }, autoplayMs);
        carousel.addEventListener('mouseenter', () => window.clearInterval(autoplayTimer));
        carousel.addEventListener('mouseleave', () => {
            autoplayTimer = window.setInterval(() => {
                if (trackSlides.length > 1) {
                    goTo(currentIndex + 1);
                }
            }, autoplayMs);
        });

        carousels.push({
            carousel,
            renderSlides,
            isProductCarousel: carousel.classList.contains('product-carousel')
        });

        renderSlides();
    });

    return carousels;
}

// ====================================================================
// PRODUCT FILTERING & CATALOG FUNCTIONS
// ====================================================================

let currentCategory = null;

function closeMobileNav() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    nav.classList.remove('open');
}

function activateCategory(filter) {
    currentCategory = filter;
    filterProducts(filter);
}

function resetCatalogSelection() {
    currentCategory = null;
    filterProducts('none');
}

function getSearchableProductCards() {
    const catalogCards = Array.from(document.querySelectorAll('#catalog-grid .product-card'));
    if (catalogCards.length > 0) {
        return catalogCards;
    }

    const oilCards = Array.from(document.querySelectorAll('.oil-grid .oil-card'));
    if (oilCards.length > 0) {
        return oilCards;
    }

    return [];
}

function getCardSearchText(card) {
    const title = card?.querySelector('h3')?.innerText.toLowerCase() || '';
    const details = Array.from(card?.querySelectorAll('p') || []).map((paragraph) => paragraph.innerText.toLowerCase()).join(' ');
    const category = (card?.dataset?.category || card?.querySelector('.badge, .oil-type')?.innerText || '').toLowerCase();
    const compatibility = card?.querySelector('.compatibility, .oil-fit')?.innerText.toLowerCase() || '';

    return `${title} ${details} ${category} ${compatibility}`.trim();
}

function filterProducts(filter = currentCategory === null ? 'none' : currentCategory) {
    const normalizedFilter = typeof filter === 'string' ? filter.replace(/-/g, ' ').trim() : filter;
    const searchInput = document.getElementById('product-search');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const catalogCards = Array.from(document.querySelectorAll('#catalog-grid .product-card'));
    const oilCards = Array.from(document.querySelectorAll('.oil-grid .oil-card'));
    const slides = document.querySelectorAll('.product-carousel .carousel-slide');
    const categorySelect = document.getElementById('catalog-category-select');
    const countLabel = document.getElementById('search-count');
    const noResults = document.getElementById('no-results');
    const catalogGrid = document.getElementById('catalog-grid');

    if (categorySelect) {
        categorySelect.value = normalizedFilter;
    }

    let visibleCount = 0;
    let firstVisibleIndex = -1;

    if (catalogCards.length > 0 && slides.length > 0) {
        slides.forEach((slide, index) => {
            const slideCards = Array.from(slide.querySelectorAll('.product-card'));
            let visibleCardCount = 0;

            slideCards.forEach((card) => {
                const category = (card?.querySelector('.badge')?.innerText.toLowerCase() || '').replace(/-/g, ' ').trim();
                const title = card?.querySelector('h3')?.innerText.toLowerCase() || '';
                const details = card?.querySelector('.compatibility')?.innerText.toLowerCase() || '';

                const matchesFilter = normalizedFilter === 'all' ? true : normalizedFilter === 'none' ? false : category.includes(normalizedFilter);
                const matchesSearch = !query || title.includes(query) || details.includes(query) || category.includes(query);
                const visible = matchesFilter && matchesSearch;

                card.style.display = visible ? 'block' : 'none';
                if (visible) visibleCardCount += 1;
            });

            const visible = visibleCardCount > 0;
            slide.style.display = visible ? 'block' : 'none';
            slide.classList.toggle('active', false);
            if (visible) {
                visibleCount += visibleCardCount;
                if (firstVisibleIndex === -1) firstVisibleIndex = index;
            }
        });
    } else if (oilCards.length > 0) {
        oilCards.forEach((card, index) => {
            const searchText = getCardSearchText(card);

            const matchesFilter = normalizedFilter === 'all' ? true : normalizedFilter === 'none' ? false : searchText.includes(normalizedFilter);
            const matchesSearch = !query || searchText.includes(query);
            const visible = matchesFilter && matchesSearch;

            card.style.display = visible ? 'block' : 'none';
            if (visible) {
                visibleCount += 1;
                if (firstVisibleIndex === -1) firstVisibleIndex = index;
            }
        });
    }

    if (catalogGrid) {
        catalogGrid.classList.toggle('hidden', visibleCount === 0);
    }

    if (countLabel) {
        countLabel.textContent = visibleCount > 0 ? `${visibleCount} product${visibleCount === 1 ? '' : 's'} found.` : 'No matching products found.';
    }

    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        noResults.textContent = visibleCount === 0 ? 'Try another search term or category.' : '';
    }

    const brandPanels = document.querySelectorAll('.brand-panel');
    brandPanels.forEach((panel) => {
        const content = panel.querySelector('.brand-content');
        const toggle = panel.querySelector('.brand-toggle');
        if (!content) return;

        const visibleCardInPanel = Array.from(content.querySelectorAll('.oil-card')).some((card) => card.style.display !== 'none');
        panel.classList.toggle('is-open', visibleCardInPanel);
        if (toggle) {
            toggle.setAttribute('aria-expanded', String(visibleCardInPanel));
        }
        content.hidden = !visibleCardInPanel;
    });

    if (visibleCount > 0 && slides[firstVisibleIndex]) {
        slides[firstVisibleIndex].classList.add('active');
    }

    if (window.__carouselControllers) {
        window.__carouselControllers.forEach((controller) => {
            if (controller.isProductCarousel) {
                controller.renderSlides();
            }
        });
    }

    if (countLabel) {
        if (normalizedFilter === 'none') {
            countLabel.innerText = 'Choose a category to view our best auto supplies.';
        } else if (visibleCount === 0) {
            countLabel.innerText = 'No matching products found. Try another search or category.';
        } else {
            countLabel.innerText = `${visibleCount} product${visibleCount === 1 ? '' : 's'} available`;
        }
    }
    if (noResults) {
        noResults.innerText = normalizedFilter === 'none' ? 'Choose a category to view our best auto supplies.' : 'No matching products found. Try another search or category.';
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (query && visibleCount > 0) {
        const searchableCards = catalogCards.length > 0 ? catalogCards : oilCards;
        const firstVisibleCard = searchableCards.find((card) => card.style.display !== 'none');
        if (firstVisibleCard && typeof firstVisibleCard.scrollIntoView === 'function') {
            firstVisibleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// ====================================================================
// ACCORDION & UTILITY FUNCTIONS
// ====================================================================

let currentSlide = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-item');
    if (!slides.length) return;

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
    });
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
}

function initTestimonialCarousel() {
    showSlide(0);
    setInterval(() => {
        changeSlide(1);
    }, 6000);
}

function initFaqAccordion() {
    const faqSection = document.querySelector('.faq-section');
    const faqToggle = document.querySelector('.faq-toggle');
    const faqContent = document.querySelector('.faq-content');
    const vehicleSection = document.querySelector('.vehicle-section');
    const vehicleToggle = document.querySelector('.vehicle-toggle');
    const vehicleContent = document.querySelector('.vehicle-content');
    const brandPanels = document.querySelectorAll('.brand-panel');
    const brandToggles = document.querySelectorAll('.brand-toggle');
    const engineSection = document.querySelector('.engine-oils-section');
    const engineToggle = document.querySelector('.engine-oils-toggle');
    const engineContent = document.querySelector('.engine-oils-content');
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqToggle && faqSection && faqContent) {
        faqToggle.addEventListener('click', () => {
            const isOpen = faqSection.classList.toggle('is-open');
            faqToggle.setAttribute('aria-expanded', String(isOpen));
            faqContent.hidden = !isOpen;
        });
    }

    if (vehicleToggle && vehicleSection && vehicleContent) {
        vehicleToggle.addEventListener('click', () => {
            const isOpen = vehicleSection.classList.toggle('is-open');
            vehicleToggle.setAttribute('aria-expanded', String(isOpen));
            vehicleContent.hidden = !isOpen;
        });
    }

    brandToggles.forEach((brandToggle) => {
        brandToggle.addEventListener('click', () => {
            const brandPanel = brandToggle.closest('.brand-panel');
            const brandContent = brandPanel && brandPanel.querySelector('.brand-content');
            const willOpen = brandPanel ? !brandPanel.classList.contains('is-open') : false;

            brandPanels.forEach((otherPanel) => {
                const otherToggle = otherPanel.querySelector('.brand-toggle');
                const otherContent = otherPanel.querySelector('.brand-content');
                otherPanel.classList.remove('is-open');
                if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
                if (otherContent) otherContent.hidden = true;
            });

            if (brandPanel && brandContent && willOpen) {
                brandPanel.classList.add('is-open');
                brandToggle.setAttribute('aria-expanded', 'true');
                brandContent.hidden = false;
            }
        });
    });

    if (engineToggle && engineSection && engineContent) {
        engineToggle.addEventListener('click', () => {
            const isOpen = engineSection.classList.toggle('is-open');
            engineToggle.setAttribute('aria-expanded', String(isOpen));
            engineContent.hidden = !isOpen;
        });
    }

    faqItems.forEach(item => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        button.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('main section[id], section[id]');
    const navLinks = document.querySelectorAll('#site-nav a');
    const scrollPosition = window.scrollY + 120;

    let currentId = 'home';
    sections.forEach((section) => {
        if (section.id && scrollPosition >= section.offsetTop) {
            currentId = section.id;
        }
    });

    navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('active', isActive);
    });
}

// ====================================================================
// INITIALIZATION
// ====================================================================

renderInventory();
window.__carouselControllers = initSectionCarousels();
filterProducts('none');

window.addEventListener('DOMContentLoaded', () => {
    activateCategory('none');
    initTestimonialCarousel();
    initFaqAccordion();

    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterProducts();
        });
        searchInput.addEventListener('search', () => {
            filterProducts();
        });
    }

    const categorySelect = document.getElementById('catalog-category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            activateCategory(categorySelect.value || 'all');
        });
    }

    document.addEventListener('click', function (event) {
        const nav = document.getElementById('site-nav');
        const menuButton = document.querySelector('.mobile-menu-toggle');
        if (nav && nav.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) {
            closeMobileNav();
        }
    });

    updateActiveNavLink();
});

window.addEventListener('scroll', function () {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    backToTop.classList.toggle('show', window.scrollY > 400);
    updateActiveNavLink();
});
