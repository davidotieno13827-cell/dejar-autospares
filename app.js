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
        showToast(`Pay Ksh ${Number(order.amount_ksh).toLocaleString()} to Paybill ${order.paybill} Account ${order.account}. Send your transaction ID on WhatsApp.`, 'info');
        return;
    }

    const productField = document.getElementById('display-product');
    const amountField = document.getElementById('display-amount');
    const paybillField = document.getElementById('display-paybill');
    const accountField = document.getElementById('display-account');
    const whatsappField = document.getElementById('display-whatsapp');

    if (productField) productField.textContent = order.product_name;
    if (amountField) amountField.textContent = `Ksh ${Number(order.amount_ksh).toLocaleString()}`;
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
        showToast("Please add both your name and your review before submitting.", 'warning');
        return;
    }

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
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !phone || !message) {
        showToast('Please complete all fields in the contact form.', 'warning');
        return;
    }

    const whatsappNumber = '254721419479';
    const whatsappMessage = `Hello Dejar Auto Supplies,\n\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');

    showToast(`Thanks ${name}! Your message is opening in WhatsApp.`, 'success');
    document.getElementById('contact-form').reset();
}

// Global visual handlers
function addToCart(name, price) {
    showToast(`Added ${name} for Ksh ${price}. Use WhatsApp or quick checkout to order.`, 'info');
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