/**
 * Unit tests for app.js frontend logic.
 *
 * Tests cover: modal handling, phone formatting, form validation,
 * carousel logic, product filtering, navigation, and slide management.
 */

// We need to set up the DOM before loading app.js
function setupMinimalDOM() {
  document.body.innerHTML = `
    <div id="quick-order-modal" style="display:none">
      <div class="modal-content">
        <span id="modal-item-name"></span>
        <span id="modal-item-price"></span>
        <input id="checkout-phone" />
        <button class="btn-mpesa-pay">Pay</button>
      </div>
    </div>
    <form id="review-form">
      <input id="review-name" value="" />
      <textarea id="review-text"></textarea>
    </form>
    <div class="reviews-grid"></div>
    <form id="contact-form">
      <input id="contact-name" value="" />
      <input id="contact-email" value="" />
      <input id="contact-phone" value="" />
      <textarea id="contact-message"></textarea>
    </form>
    <nav id="site-nav"></nav>
    <button class="mobile-menu-toggle"></button>
    <input id="product-search" value="" />
    <span id="search-count"></span>
    <div id="no-results" style="display:none"></div>
    <div id="catalog-grid">
      <div class="product-carousel section-carousel">
        <div class="carousel-stage">
          <div class="carousel-track">
            <div class="carousel-slide active">
              <div class="product-card">
                <span class="badge">engine-oil</span>
                <h3>Total Quartz 5W-30</h3>
                <span class="compatibility">For Toyota and Honda</span>
              </div>
            </div>
            <div class="carousel-slide">
              <div class="product-card">
                <span class="badge">gear-oil</span>
                <h3>Castrol Gear Plus 80W-90</h3>
                <span class="compatibility">For trucks</span>
              </div>
            </div>
            <div class="carousel-slide">
              <div class="product-card">
                <span class="badge">brake-fluid</span>
                <h3>DOT 4 Brake Fluid</h3>
                <span class="compatibility">Universal</span>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel-btn prev"></button>
        <button class="carousel-btn next"></button>
      </div>
    </div>
    <div class="carousel-item active">Slide 1</div>
    <div class="carousel-item">Slide 2</div>
    <div class="carousel-item">Slide 3</div>
    <div class="filter-btn" data-filter="all"></div>
    <div class="filter-btn" data-filter="engine-oil"></div>
    <section class="brand-panel">
      <button class="brand-toggle" aria-expanded="false" aria-controls="brand-shell-content"></button>
      <div class="brand-content" id="brand-shell-content" hidden></div>
    </section>
    <section class="brand-panel">
      <button class="brand-toggle" aria-expanded="false" aria-controls="brand-castrol-content"></button>
      <div class="brand-content" id="brand-castrol-content" hidden></div>
    </section>
    <section class="vehicle-section">
      <button class="vehicle-toggle" aria-expanded="false" aria-controls="vehicle-content"></button>
      <div class="vehicle-content" id="vehicle-content" hidden></div>
    </section>
    <section class="engine-oils-section">
      <button class="engine-oils-toggle" aria-expanded="false" aria-controls="engine-oils-content"></button>
      <div class="engine-oils-content" id="engine-oils-content" hidden></div>
    </section>
    <div class="faq-item">
      <button class="faq-question">Q1</button>
      <div class="faq-answer">A1</div>
    </div>
    <div class="faq-item">
      <button class="faq-question">Q2</button>
      <div class="faq-answer">A2</div>
    </div>
    <button id="back-to-top"></button>
    <main>
      <section id="home"></section>
      <section id="products"></section>
      <section id="contact"></section>
    </main>
    <a href="#home"></a>
    <a href="#products"></a>
  `;
}

// Mock fetch, alert, and window.open before loading app.js
global.fetch = jest.fn();
global.alert = jest.fn();
global.window.open = jest.fn();

// jsdom does not implement innerText; polyfill it via textContent
Object.defineProperty(HTMLElement.prototype, "innerText", {
  get() {
    return this.textContent;
  },
  set(value) {
    this.textContent = value;
  },
  configurable: true,
});

beforeEach(() => {
  jest.clearAllMocks();
  setupMinimalDOM();
});

// Load app.js functions by evaluating the script
// We need to extract functions since app.js attaches to global scope
const fs = require("fs");
const path = require("path");
const appCode = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

// Execute app.js in current context to get the functions
eval(appCode);

describe("openQuickOrder", () => {
  test("opens modal and sets item name and price", () => {
    openQuickOrder("Engine Oil 5W-30", 2500);
    const modal = document.getElementById("quick-order-modal");
    expect(modal.style.display).toBe("flex");
    expect(document.getElementById("modal-item-name").innerText).toBe(
      "Engine Oil 5W-30"
    );
    expect(document.getElementById("modal-item-price").innerText).toBe(
      "2,500"
    );
  });

  test("clears phone input when opening", () => {
    const phoneInput = document.getElementById("checkout-phone");
    phoneInput.value = "0712345678";
    openQuickOrder("Brake Fluid", 800);
    expect(phoneInput.value).toBe("");
  });

  test("shows alert if modal element does not exist", () => {
    document.getElementById("quick-order-modal").remove();
    openQuickOrder("Item", 100);
    expect(alert).toHaveBeenCalledWith("Ordering: Item for Ksh 100");
  });
});

describe("closeQuickOrder", () => {
  test("removes active class from modal", () => {
    const modal = document.getElementById("quick-order-modal");
    modal.classList.add("active");
    closeQuickOrder();
    expect(modal.classList.contains("active")).toBe(false);
  });

  test("does nothing if modal does not exist", () => {
    document.getElementById("quick-order-modal").remove();
    expect(() => closeQuickOrder()).not.toThrow();
  });
});

describe("processPayment", () => {
  beforeEach(() => {
    document.getElementById("modal-item-price").innerText = "1500";
  });

  test("alerts if amount is zero or invalid", async () => {
    document.getElementById("modal-item-price").innerText = "abc";
    await processPayment({ preventDefault: jest.fn() });
    expect(alert).toHaveBeenCalledWith(
      "Unable to read the order amount. Please reopen the checkout and try again."
    );
  });

  test("validates phone number format", async () => {
    document.getElementById("checkout-phone").value = "12345";
    await processPayment({ preventDefault: jest.fn() });
    expect(alert).toHaveBeenCalledWith(
      "Please enter a valid M-Pesa phone number (e.g., 0712345678)"
    );
  });

  test("formats phone starting with 0 to 254 prefix", async () => {
    document.getElementById("checkout-phone").value = "0712345678";
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ CustomerMessage: "Success" }),
    });

    await processPayment({ preventDefault: jest.fn() });

    const callBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(callBody.phone).toBe("254712345678");
  });

  test("formats phone starting with +254", async () => {
    document.getElementById("checkout-phone").value = "+254712345678";
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ CustomerMessage: "Success" }),
    });

    await processPayment({ preventDefault: jest.fn() });

    const callBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(callBody.phone).toBe("254712345678");
  });

  test("shows success alert on OK response", async () => {
    document.getElementById("checkout-phone").value = "0712345678";
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ CustomerMessage: "Success" }),
    });

    await processPayment({ preventDefault: jest.fn() });

    expect(alert).toHaveBeenCalledWith(
      "Payment request sent successfully! Please check your handset for the M-Pesa PIN prompt."
    );
  });

  test("shows error alert on failed response", async () => {
    document.getElementById("checkout-phone").value = "0712345678";
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ CustomerMessage: "Insufficient balance" }),
    });

    await processPayment({ preventDefault: jest.fn() });

    expect(alert).toHaveBeenCalledWith(
      "M-Pesa Failed: Insufficient balance"
    );
  });

  test("handles network error gracefully", async () => {
    document.getElementById("checkout-phone").value = "0712345678";
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await processPayment({ preventDefault: jest.fn() });

    expect(alert).toHaveBeenCalledWith(
      "Could not connect to the payment server. Make sure app.py is running on port 5000."
    );
  });

  test("re-enables submit button after error", async () => {
    document.getElementById("checkout-phone").value = "0712345678";
    fetch.mockRejectedValueOnce(new Error("Fail"));

    await processPayment({ preventDefault: jest.fn() });

    const btn = document.querySelector(".btn-mpesa-pay");
    expect(btn.disabled).toBe(false);
  });
});

describe("submitReview", () => {
  test("alerts when name is empty", () => {
    document.getElementById("review-name").value = "";
    document.getElementById("review-text").value = "Great product!";
    submitReview({ preventDefault: jest.fn() });
    expect(alert).toHaveBeenCalledWith(
      "Please add both your name and your review before submitting."
    );
  });

  test("alerts when review text is empty", () => {
    document.getElementById("review-name").value = "John";
    document.getElementById("review-text").value = "";
    submitReview({ preventDefault: jest.fn() });
    expect(alert).toHaveBeenCalledWith(
      "Please add both your name and your review before submitting."
    );
  });

  test("adds review card to grid on valid submission", () => {
    document.getElementById("review-name").value = "Jane";
    document.getElementById("review-text").value = "Excellent lubricants!";
    submitReview({ preventDefault: jest.fn() });

    const cards = document.querySelectorAll(".review-card");
    expect(cards.length).toBe(1);
    expect(cards[0].innerHTML).toContain("Excellent lubricants!");
    expect(cards[0].innerHTML).toContain("Jane");
  });

  test("removes empty notice if present", () => {
    const notice = document.createElement("div");
    notice.id = "reviews-empty";
    document.querySelector(".reviews-grid").appendChild(notice);

    document.getElementById("review-name").value = "Tom";
    document.getElementById("review-text").value = "Good!";
    submitReview({ preventDefault: jest.fn() });

    expect(document.getElementById("reviews-empty")).toBeNull();
  });
});

describe("submitContactForm", () => {
  test("alerts when any field is empty", () => {
    document.getElementById("contact-name").value = "David";
    document.getElementById("contact-email").value = "";
    document.getElementById("contact-phone").value = "0712345678";
    document.getElementById("contact-message").value = "Hello";
    submitContactForm({ preventDefault: jest.fn() });
    expect(alert).toHaveBeenCalledWith(
      "Please complete the contact form before sending."
    );
  });

  test("shows success message with name and contact info", () => {
    document.getElementById("contact-name").value = "David";
    document.getElementById("contact-email").value = "d@test.com";
    document.getElementById("contact-phone").value = "0712345678";
    document.getElementById("contact-message").value = "Inquiry about prices";
    submitContactForm({ preventDefault: jest.fn() });
    expect(alert).toHaveBeenCalledWith(
      expect.stringContaining("Thanks David")
    );
  });
});

describe("addToCart", () => {
  test("shows alert with item name and price", () => {
    addToCart("Brake Pads", 3000);
    expect(alert).toHaveBeenCalledWith(
      "Added Brake Pads for Ksh 3000. For fast orders, use WhatsApp or quick checkout."
    );
  });
});

describe("toggleCart", () => {
  test("opens WhatsApp link", () => {
    toggleCart();
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("wa.me/254721419479"),
      "_blank"
    );
  });
});

describe("toggleMobileNav", () => {
  test("toggles open class on nav", () => {
    const nav = document.getElementById("site-nav");
    expect(nav.classList.contains("open")).toBe(false);
    toggleMobileNav();
    expect(nav.classList.contains("open")).toBe(true);
    toggleMobileNav();
    expect(nav.classList.contains("open")).toBe(false);
  });

  test("does nothing if nav does not exist", () => {
    document.getElementById("site-nav").remove();
    expect(() => toggleMobileNav()).not.toThrow();
  });
});

describe("closeMobileNav", () => {
  test("removes open class from nav", () => {
    const nav = document.getElementById("site-nav");
    nav.classList.add("open");
    closeMobileNav();
    expect(nav.classList.contains("open")).toBe(false);
  });
});

describe("showSlide / changeSlide", () => {
  test("showSlide sets active class on correct slide", () => {
    showSlide(1);
    const slides = document.querySelectorAll(".carousel-item");
    expect(slides[0].classList.contains("active")).toBe(false);
    expect(slides[1].classList.contains("active")).toBe(true);
    expect(slides[2].classList.contains("active")).toBe(false);
  });

  test("showSlide wraps around for negative index", () => {
    showSlide(-1);
    const slides = document.querySelectorAll(".carousel-item");
    // -1 wraps to last slide (index 2)
    expect(slides[2].classList.contains("active")).toBe(true);
  });

  test("showSlide wraps around for index beyond length", () => {
    showSlide(3);
    const slides = document.querySelectorAll(".carousel-item");
    // 3 wraps to first slide (index 0)
    expect(slides[0].classList.contains("active")).toBe(true);
  });

  test("changeSlide advances by direction", () => {
    showSlide(0);
    changeSlide(1);
    const slides = document.querySelectorAll(".carousel-item");
    expect(slides[1].classList.contains("active")).toBe(true);
  });
});

describe("filterProducts", () => {
  test("filters by category showing only matching products", () => {
    filterProducts("engine-oil");
    const countLabel = document.getElementById("search-count");
    expect(countLabel.innerText).toContain("1 product");
  });

  test("shows all products with 'all' filter", () => {
    filterProducts("all");
    const countLabel = document.getElementById("search-count");
    expect(countLabel.innerText).toContain("3 products");
  });

  test("shows zero-results message for non-existent category", () => {
    filterProducts("nonexistent");
    const countLabel = document.getElementById("search-count");
    expect(countLabel.innerText).toContain("No matching products");
    document.getElementById("product-search").value = "toyota";
    filterProducts("all");
    const countLabelAfterSearch = document.getElementById("search-count");
    expect(countLabelAfterSearch.innerText).toContain("1 product");
  });

  test("'none' filter shows category selection message", () => {
    filterProducts("none");
    const countLabel = document.getElementById("search-count");
    expect(countLabel.innerText).toContain("Choose a category");
  });
});

describe("initFaqAccordion", () => {
  test("opening one lubricant brand closes the previous one", () => {
    initFaqAccordion();

    const brandPanels = document.querySelectorAll(".brand-panel");
    const shellToggle = document.querySelectorAll(".brand-toggle")[0];
    const castrolToggle = document.querySelectorAll(".brand-toggle")[1];
    const shellContent = document.getElementById("brand-shell-content");
    const castrolContent = document.getElementById("brand-castrol-content");

    shellToggle.click();
    expect(brandPanels[0].classList.contains("is-open")).toBe(true);
    expect(shellToggle.getAttribute("aria-expanded")).toBe("true");
    expect(shellContent.hidden).toBe(false);

    castrolToggle.click();
    expect(brandPanels[0].classList.contains("is-open")).toBe(false);
    expect(brandPanels[1].classList.contains("is-open")).toBe(true);
    expect(shellToggle.getAttribute("aria-expanded")).toBe("false");
    expect(castrolToggle.getAttribute("aria-expanded")).toBe("true");
    expect(shellContent.hidden).toBe(true);
    expect(castrolContent.hidden).toBe(false);
  });

  test("clicking a question toggles active class", () => {
    initFaqAccordion();
    const firstQuestion = document.querySelectorAll(".faq-question")[0];
    const firstItem = document.querySelectorAll(".faq-item")[0];

    firstQuestion.click();
    expect(firstItem.classList.contains("active")).toBe(true);

    // Click again to collapse
    firstQuestion.click();
    expect(firstItem.classList.contains("active")).toBe(false);
  });

  test("opening one FAQ closes others", () => {
    initFaqAccordion();
    const questions = document.querySelectorAll(".faq-question");
    const items = document.querySelectorAll(".faq-item");

    questions[0].click();
    expect(items[0].classList.contains("active")).toBe(true);

    questions[1].click();
    expect(items[0].classList.contains("active")).toBe(false);
    expect(items[1].classList.contains("active")).toBe(true);
  });

});
