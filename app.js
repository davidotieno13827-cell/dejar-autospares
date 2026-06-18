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
        whatsapp: '+' + WHATSAPP_NUMBER
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
        showToast(`Pay ${formatKsh(order.amount_ksh)} to Paybill ${order.paybill} Account ${order.account}. Send your transaction ID on WhatsApp.`, 'info');
        return;
    }

    const productField = document.getElementById('display-product');
    const amountField = document.getElementById('display-amount');
    const paybillField = document.getElementById('display-paybill');
    const accountField = document.getElementById('display-account');
    const whatsappField = document.getElementById('display-whatsapp');

    if (productField) productField.textContent = order.product_name;
    if (amountField) amountField.textContent = formatKsh(order.amount_ksh);
    if (paybillField) paybillField.textContent = order.paybill;
    if (accountField) accountField.textContent = order.account;
    if (whatsappField) whatsappField.textContent = order.whatsapp || '+254 721 419 479';

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closePaymentModal() {
    const modal = document.getElementById('quick-order-modal');
    if (!modal) {
        return;
    }

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function sendToWhatsApp() {
    if (!pendingPayment) {
        return;
    }

    const message = `Hello Dejar Auto Supplies, I want to order ${pendingPayment.product} for ${formatKsh(pendingPayment.price)}. My payment details are Paybill ${pendingPayment.paybill} and Account ${pendingPayment.account}.`;
    window.open(`https://wa.me/${pendingPayment.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function copyOrderReference() {
    if (!pendingPayment) {
        return;
    }

    const message = `Product: ${pendingPayment.product}\nAmount: ${formatKsh(pendingPayment.price)}\nPaybill: ${pendingPayment.paybill}\nAccount: ${pendingPayment.account}`;

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
    const result = validateRequiredFields(['review-name', 'review-text']);
    if (!result.valid) {
        showToast("Please add both your name and your review before submitting.", 'warning');
        return;
    }

    const name = result.values['review-name'];
    const text = result.values['review-text'];

    fetch('/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customer_name: name,
            comment: text,
            rating: 5
        })
    })
        .then(async response => {
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Unable to submit review');
            }

            if (!data.requires_approval) {
                const reviewsGrid = document.querySelector('.reviews-grid');
                const reviewCard = document.createElement('div');
                reviewCard.className = 'review-card';
                reviewCard.innerHTML = `
                    <div class="stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
                    <p>"${text}"</p>
                    <h4>- ${name}</h4>
                `;

                reviewsGrid.appendChild(reviewCard);
            }

            showToast(`Thanks for your review, ${name}!`, 'success');
            document.getElementById("review-form").reset();
        })
        .catch(error => {
            console.error('Review submission error:', error);
            showToast(error.message || 'Unable to submit review right now.', 'error');
        });
}

function submitContactForm(event) {
    if (event) event.preventDefault();
    const result = validateRequiredFields(['contact-name', 'contact-phone', 'contact-message']);
    if (!result.valid) {
        showToast('Please complete all fields in the contact form.', 'warning');
        return;
    }

    const name = result.values['contact-name'];
    const phone = result.values['contact-phone'];
    const message = result.values['contact-message'];

    const whatsappMessage = `Hello Dejar Auto Supplies,\n\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;

    window.open(buildWhatsAppUrl(whatsappMessage), '_blank', 'noopener,noreferrer');

    showToast(`Thanks ${name}! Your message is opening in WhatsApp.`, 'success');
    document.getElementById('contact-form').reset();
}

// Global visual handlers
function addToCart(name, price) {
    showToast(`Added ${name} for ${formatKsh(price)}. Use WhatsApp or quick checkout to order.`, 'info');
}

function toggleCart() {
    window.open(buildWhatsAppUrl('Hello Dejar Auto Supplies, I would like help ordering lubricants.'), '_blank');
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
        const controller = createCarousel(carousel);
        if (controller) carousels.push(controller);
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

function filterProducts(filter = currentCategory === null ? 'none' : currentCategory) {
    const searchInput = document.getElementById('product-search');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const slides = document.querySelectorAll('.product-carousel .carousel-slide');
    const cards = document.querySelectorAll('#catalog-grid .product-card');
    const buttons = document.querySelectorAll('.filter-btn');
    const countLabel = document.getElementById('search-count');
    const noResults = document.getElementById('no-results');
    const catalogGrid = document.getElementById('catalog-grid');

    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    let visibleCount = 0;
    let firstVisibleIndex = -1;

    if (slides.length > 0) {
        slides.forEach((slide, index) => {
            const slideCards = Array.from(slide.querySelectorAll('.product-card'));
            let visibleCardCount = 0;

            slideCards.forEach((card) => {
                const category = card?.querySelector('.badge')?.innerText.toLowerCase() || '';
                const title = card?.querySelector('h3')?.innerText.toLowerCase() || '';
                const details = card?.querySelector('.compatibility')?.innerText.toLowerCase() || '';

                const matchesFilter = filter === 'all' ? true : filter === 'none' ? false : category.includes(filter);
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
    } else {
        cards.forEach((card, index) => {
            const category = card?.querySelector('.badge')?.innerText.toLowerCase() || '';
            const title = card?.querySelector('h3')?.innerText.toLowerCase() || '';
            const details = card?.querySelector('.compatibility')?.innerText.toLowerCase() || '';

            const matchesFilter = filter === 'all' ? true : filter === 'none' ? false : category.includes(filter);
            const matchesSearch = !query || title.includes(query) || details.includes(query) || category.includes(query);
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
        if (filter === 'none') {
            countLabel.innerText = 'Choose a category to view the best lubricant grades.';
        } else if (visibleCount === 0) {
            countLabel.innerText = 'No matching oils found. Try another search or category.';
        } else {
            countLabel.innerText = `${visibleCount} product${visibleCount === 1 ? '' : 's'} available`;
        }
    }
    if (noResults) {
        noResults.innerText = filter === 'none' ? 'Choose a category to view our best lubricant grades.' : 'No matching oils found. Try another search or category.';
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
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

window.__carouselControllers = initSectionCarousels();
filterProducts('all');

window.addEventListener('DOMContentLoaded', () => {
    activateCategory('all');
    initTestimonialCarousel();
    initFaqAccordion();

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