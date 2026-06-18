/**
 * Shared utilities for Dejar Auto Supplies
 */

var WHATSAPP_NUMBER = '254721419479';

// --- Phone Number Utilities ------------------------------------------------

function formatKenyanPhone(phone) {
    var formatted = phone.trim();
    if (formatted.startsWith('0')) {
        formatted = '254' + formatted.slice(1);
    } else if (formatted.startsWith('+254')) {
        formatted = formatted.slice(1);
    }
    return formatted;
}

function isValidKenyanPhone(phone) {
    return /^254[0-9]{9}$/.test(phone);
}

// --- Currency Formatting ---------------------------------------------------

function formatKsh(amount, decimals) {
    var opts = typeof decimals === 'number'
        ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
        : undefined;
    return 'Ksh ' + Number(amount).toLocaleString(undefined, opts);
}

// --- Form Validation -------------------------------------------------------

function validateRequiredFields(fieldIds) {
    var values = {};
    for (var i = 0; i < fieldIds.length; i++) {
        var el = document.getElementById(fieldIds[i]);
        var val = el ? el.value.trim() : '';
        values[fieldIds[i]] = val;
        if (!val) return { valid: false, values: values };
    }
    return { valid: true, values: values };
}

// --- Modal Utilities -------------------------------------------------------

function showModal(selector) {
    var modal = document.querySelector(selector);
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function hideModal(selector) {
    var modal = document.querySelector(selector);
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

// --- Button State Management -----------------------------------------------

function setButtonLoading(btn, loadingText) {
    if (!btn) return;
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = loadingText || 'Processing...';
}

function resetButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || '';
}

// --- WhatsApp URL Builder --------------------------------------------------

function buildWhatsAppUrl(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
}

// --- Toast Notification System ---------------------------------------------

function showToast(message, type) {
    type = type || 'info';
    var toastContainer = document.getElementById('toast-container') || createToastContainer();

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<i class="fa-solid fa-' + getToastIcon(type) + '"></i> <span>' + message + '</span>';

    toastContainer.appendChild(toast);

    setTimeout(function () {
        toast.classList.add('fade-out');
        setTimeout(function () { toast.remove(); }, 300);
    }, 4000);
}

function createToastContainer() {
    var container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;max-width:400px;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto;';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    var icons = {
        'success': 'circle-check',
        'error': 'circle-exclamation',
        'info': 'circle-info',
        'warning': 'triangle-exclamation'
    };
    return icons[type] || 'circle-info';
}

// Inject toast CSS
(function () {
    var style = document.createElement('style');
    style.textContent = '.toast{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:8px;font-weight:600;font-size:14px;box-shadow:0 10px 24px rgba(0,0,0,0.12);animation:slideInRight .3s ease;max-width:100%}@keyframes slideInRight{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(400px);opacity:0}}.toast.fade-out{animation:slideOutRight .3s ease}.toast-success{background:#d4edda;color:#155724;border-left:4px solid #28a745}.toast-error{background:#f8d7da;color:#721c24;border-left:4px solid #dc3545}.toast-info{background:#d1ecf1;color:#0c5460;border-left:4px solid #17a2b8}.toast-warning{background:#fff3cd;color:#856404;border-left:4px solid #ffc107}';
    document.head.appendChild(style);
})();

// --- Carousel Factory ------------------------------------------------------

function createCarousel(carouselEl) {
    var slides = Array.from(carouselEl.querySelectorAll('.carousel-slide'));
    if (!slides.length) return null;

    var stage = carouselEl.querySelector('.carousel-stage');
    var track = carouselEl.querySelector('.carousel-track');
    if (!track && stage) {
        track = document.createElement('div');
        track.className = 'carousel-track';
        var fragment = document.createDocumentFragment();
        slides.forEach(function (slide) { fragment.appendChild(slide); });
        track.appendChild(fragment);
        stage.appendChild(track);
    }

    var trackSlides = Array.from(track ? track.querySelectorAll('.carousel-slide') : []);
    if (!trackSlides.length) return null;

    var currentIndex = 0;
    var prevButton = carouselEl.querySelector('.carousel-btn.prev');
    var nextButton = carouselEl.querySelector('.carousel-btn.next');
    var dotsContainer = carouselEl.querySelector('.carousel-dots');

    if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        carouselEl.appendChild(dotsContainer);
    }

    var dots = trackSlides.map(function (_, index) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
        dot.addEventListener('click', function () { goTo(index); });
        dotsContainer.appendChild(dot);
        return dot;
    });

    function renderSlides() {
        if (!trackSlides.length) return;
        currentIndex = ((currentIndex % trackSlides.length) + trackSlides.length) % trackSlides.length;
        trackSlides.forEach(function (slide, index) {
            slide.classList.toggle('active', index === currentIndex);
            slide.style.display = 'flex';
        });
        dots.forEach(function (dot, index) {
            dot.classList.toggle('active', index === currentIndex);
        });
        if (track) {
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        }
    }

    function goTo(index) {
        currentIndex = index;
        renderSlides();
    }

    if (prevButton) prevButton.addEventListener('click', function () { goTo(currentIndex - 1); });
    if (nextButton) nextButton.addEventListener('click', function () { goTo(currentIndex + 1); });

    var touchStartX = 0;
    if (stage) {
        stage.addEventListener('touchstart', function (event) {
            touchStartX = event.touches[0].clientX;
        });
        stage.addEventListener('touchend', function (event) {
            var delta = touchStartX - event.changedTouches[0].clientX;
            if (delta > 50) goTo(currentIndex + 1);
            else if (delta < -50) goTo(currentIndex - 1);
        });
    }

    var autoplayMs = 5500;
    var autoplayTimer = window.setInterval(function () {
        if (trackSlides.length > 1) goTo(currentIndex + 1);
    }, autoplayMs);
    carouselEl.addEventListener('mouseenter', function () { window.clearInterval(autoplayTimer); });
    carouselEl.addEventListener('mouseleave', function () {
        autoplayTimer = window.setInterval(function () {
            if (trackSlides.length > 1) goTo(currentIndex + 1);
        }, autoplayMs);
    });

    renderSlides();

    return {
        carousel: carouselEl,
        renderSlides: renderSlides,
        isProductCarousel: carouselEl.classList.contains('product-carousel')
    };
}
