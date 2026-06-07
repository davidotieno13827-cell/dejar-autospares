// Open the Quick Order Modal smoothly
function openQuickOrder(itemName, itemPrice) {
    const modal = document.getElementById("quick-order-modal");
    const phoneInput = document.getElementById("checkout-phone");
    if (!modal) {
        alert(`Ordering: ${itemName} for Ksh ${itemPrice}`);
        return;
    }

    document.getElementById("modal-item-name").innerText = itemName;
    document.getElementById("modal-item-price").innerText = itemPrice.toLocaleString();
    if (phoneInput) {
        phoneInput.value = "";
    }

    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add("active");
        if (phoneInput) {
            phoneInput.focus();
        }
    }, 10);
}

function closeQuickOrder() {
    const modal = document.getElementById("quick-order-modal");
    if (modal) {
        modal.classList.remove("active");
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }
}

// Process live user checkout inputs cleanly
async function processPayment(event) {
    if (event) event.preventDefault();

    const phoneInput = document.getElementById("checkout-phone");
    const phoneValue = phoneInput?.value.trim() || "";
    const amountInput = parseInt(document.getElementById("modal-item-price").innerText.replace(/[^0-9]/g, ''), 10);

    if (!amountInput || amountInput <= 0) {
        alert("Unable to read the order amount. Please reopen the checkout and try again.");
        return;
    }

    let formattedPhone = phoneValue;
    if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("+254")) {
        formattedPhone = formattedPhone.slice(1);
    }

    if (!/^254[0-9]{9}$/.test(formattedPhone)) {
        alert("Please enter a valid M-Pesa phone number (e.g., 0712345678)");
        return;
    }

    const submitBtn = document.querySelector(".btn-mpesa-pay");
    if (!submitBtn) {
        alert("Payment button not available. Please refresh the page.");
        return;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending STK Prompt...`;
    submitBtn.disabled = true;

    const apiUrl = window.location.protocol === 'file:'
        ? 'http://127.0.0.1:5000/api/stkpush'
        : '/api/stkpush';

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: formattedPhone,
                amount: amountInput
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Payment request sent successfully! Please check your handset for the M-Pesa PIN prompt.");
            closeQuickOrder();
        } else {
            alert(`M-Pesa Failed: ${data.CustomerMessage || "Verify credentials setup."}`);
        }
    } catch (error) {
        console.error("Connection Error:", error);
        alert("Could not connect to the payment server. Make sure app.py is running on port 5000.");
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Handle Customer Reviews form submission
function submitReview(event) {
    if (event) event.preventDefault();
    const name = document.getElementById("review-name").value.trim();
    const text = document.getElementById("review-text").value.trim();

    if (!name || !text) {
        alert("Please add both your name and your review before submitting.");
        return;
    }

    const reviewsGrid = document.querySelector('.reviews-grid');
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    reviewCard.innerHTML = `
        <div class="stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
        <p>"${text}"</p>
        <h4>- ${name}</h4>
    `;
    reviewsGrid.appendChild(reviewCard);

    alert(`Thank you for your review, ${name}! It will appear on the site after approval.`);
    document.getElementById("review-form").reset();
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

    alert(`Thanks ${name}! Your message has been received. We will contact you at ${phone} or ${email} shortly.`);
    document.getElementById('contact-form').reset();
}

// Global visual handlers placeholders
function addToCart(name, price) {
    alert(`Added ${name} for Ksh ${price}. For fast orders, use WhatsApp or quick checkout.`);
}

function toggleCart() {
    window.open('https://wa.me/254721419479?text=Hello%20Dejar%20Auto%20Supplies,%20I%20would%20like%20help%20with%20an%20order.', '_blank');
}

function toggleMobileNav() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    nav.classList.toggle('open');
}

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
    const cards = document.querySelectorAll('.product-card');
    const buttons = document.querySelectorAll('.filter-btn');
    const countLabel = document.getElementById('search-count');
    const noResults = document.getElementById('no-results');
    const catalogGrid = document.getElementById('catalog-grid');

    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    let visibleCount = 0;
    cards.forEach(card => {
        const category = card.querySelector('.badge')?.innerText.toLowerCase() || '';
        const title = card.querySelector('h3')?.innerText.toLowerCase() || '';
        const details = card.querySelector('.compatibility')?.innerText.toLowerCase() || '';

        const matchesFilter = filter === 'all' ? true : filter === 'none' ? false : category.includes(filter);
        const matchesSearch = !query || title.includes(query) || details.includes(query) || category.includes(query);
        const visible = matchesFilter && matchesSearch;

        card.style.display = visible ? 'block' : 'none';
        if (visible) visibleCount += 1;
    });

    if (catalogGrid) {
        catalogGrid.classList.toggle('hidden', visibleCount === 0);
    }

    if (countLabel) {
        if (filter === 'none') {
            countLabel.innerText = 'Choose a category to view the best spare parts.';
        } else if (visibleCount === 0) {
            countLabel.innerText = 'No matching parts found. Try another search or category.';
        } else {
            countLabel.innerText = `${visibleCount} part${visibleCount === 1 ? '' : 's'} available`;
        }
    }
    if (noResults) {
        noResults.innerText = filter === 'none' ? 'Choose a category to view our best spare parts.' : 'No matching parts found. Try another search or category.';
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

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
    const faqItems = document.querySelectorAll('.faq-item');
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

document.addEventListener('DOMContentLoaded', function () {
    resetCatalogSelection();
    initTestimonialCarousel();
    initFaqAccordion();

    const mobileNavLinks = document.querySelectorAll('#site-nav a');
    mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileNav));

    document.addEventListener('click', function (event) {
        const nav = document.getElementById('site-nav');
        const menuButton = document.querySelector('.mobile-menu-toggle');
        if (nav && nav.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) {
            closeMobileNav();
        }
    });
});

window.addEventListener('click', function (event) {
    const modal = document.getElementById('quick-order-modal');
    if (!modal) return;
    const content = document.querySelector('.modal-content');
    if (modal.classList.contains('active') && content && !content.contains(event.target) && event.target === modal) {
        closeQuickOrder();
    }
});

window.addEventListener('scroll', function () {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    backToTop.classList.toggle('show', window.scrollY > 400);
});