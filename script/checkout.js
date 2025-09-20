import {getCart, setQuantity, computeTotals, clearCart, updateCartQuantity} from "./cart.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"});

const q = (id) => document.getElementById(id);
function getApp() {
    let el = document.getElementById("app");
    if (!el) {
        el = document.createElement("main");
        el.id = "app";
        document.body.insertBefore(el, document.getElementById("site-footer") || null);
    }
    return el;
}

function renderCheckoutShell() {
    const app = getApp();
    app.innerHTML = `
    <main class="checkout-grid">

        <div id="page-loader" class="page-loader" style="display:none">
            <div class="spinner"></div>
        </div>

        <section class="shop js-shop">

        </section>

        <div class="cart-actions">
            <button type="button" class="btn btn-outline js-clear">Clear cart</button>
        </div>


        <aside class="right-bar js-right-bar">
            <h2>Summary</h2>
            <section class="order-summary">

                <p><span>Subtotal</span><span class="js-subtotal">$0.00</span></p>
                <p><span>Savings</span><span class="js-savings">$0.00</span></p>

                <p class="total"><span>Total</span><span class="js-total">$0.00</span></p>


            </section>

            <div id="totals"></div>


            <form id="checkout-form" class="checkout-form" novalidate>
                <h2>Delivery</h2>

                <label class="field">
                    <input type="text" id="fullName" name="fullName" placeholder="Full name" autocomplete="name"
                        required />
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <label class="field">
                    <input type="text" id="email" name="email" placeholder="Email" autocomplete="email" required />
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <label class="field">
                    <input type="text" id="address" name="address" placeholder="Address" autocomplete="street-address"
                        required />
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <div class="grid-2">
                    <label class="field">
                        <input type="text" id="city" name="city" placeholder="City" autocomplete="address-level2"
                            required />
                        <span class="error-msg" aria-live="polite"></span>
                    </label>

                    <label class="field">
                        <input type="text" id="postal" name="postal" placeholder="Postal code"
                            autocomplete="postal-code" required />
                        <span class="error-msg" aria-live="polite"></span>
                    </label>
                </div>

                <label class="field">
                    <input type="text" id="country" name="country" placeholder="Country" autocomplete="country-name"
                        required />
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <h2>Payment</h2>
                <fieldset class="pay-methods">
                    <label> <input type="radio" id="card" name="payment" value="card" checked>Card</label>
                    <label> <input type="radio" id="vipps" name="payment" value="vipps" checked>Vipps </label>
                    <label> <input type="radio" id="paypal" name="payment" value="paypal" checked>Paypal </label>
                </fieldset>


            </form>
            <p id="checkout-msg" class="form-msg" aria-live="polite"></p>
            <button id="pay-btn" class="btn btn-primary" type="submit" form="checkout-form">Pay</button>


        </aside>
    </main>
    `;
}

renderCheckoutShell();
const app = getApp();
const shopWrap = app.querySelector(".js-shop");
const rightBar = app.querySelector(".js-right-bar");
const form = app.querySelector("#checkout-form");
const formMsg = app.querySelector("#checkout-msg");

try {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
        form.querySelector('input[name="email"]').value = savedEmail;
    } 
} catch {}


function itemHTML({ p, q }) {
    const hasDiscount = p.discountedPrice && p.discountedPrice < p.price;
    const unit = p.discountedPrice || p.price || 0;
    const line = unit * q;


    return `
    <div class="box js-cart-item-container-${p.id}">
        <div class="content">
                <img src="${p.image.url}" alt="${p.image.alt}">
                <h3>${p.title}</h3>
                
                <div class="price">
                    ${
                        hasDiscount
                        ? `<span class="now">${money.format(p.discountedPrice)}</span>
                            <span class="was">${money.format(p.price)}</span>`
                        : `<span class="now">${money.format(p.price)}</span>`
                    }
                </div>

            <div class="qty">
                <button class="qty-dec" data-id="${p.id}" aria-label="Decrease">-</button>
                <span class="qty-val">${q}</span>
                <button class="qty-inc" data-id="${p.id}" aria-label="Increase">+</button>
            </div>

            <p class="btn-area">
                <span class="btn2 js-delete-link" data-product-id="${p.id}">
                    <i class="fa-solid fa-trash"></i> Remove
                </span>
            </p>
        </div>
    </div>
    `;
}

function renderTotals() {
    const t = computeTotals();
    const set = (sel, val) => {
        const el = rightBar.querySelector(sel);
        if (el) el.textContent = money.format(val);
    };
    set(".js-subtotal", t.original);
    set(".js-savings", t.savings);
    set(".js-total", t.pay);
}

function render() {
    const cart = getCart();

    if (!cart.length) {
        shopWrap.innerHTML = `
        <section class="empty-cart-message">
            <h2>Empty cart!</h2>
            <a class="btn" href="index.html">Continue shopping</a>
        </section>
        `;

        document.querySelector(".cart-actions")?.remove();

        renderTotals();
        updateCartQuantity();
        return;
    }

const rows = cart.map(itemHTML).join("");
    shopWrap.innerHTML = `
    <img src="images/logo/NovaCart_brown_cropped.png" alt="Novacart logo" class="cart-logo">
    <h1>Checkout</h1>${rows}` 
    ;

    wire();
    renderTotals();
    updateCartQuantity();

}

function wire() {

    document.querySelectorAll(".js-delete-link").forEach((btn) => {
        btn.addEventListener("click", () => {
            setQuantity(btn.dataset.productId, 0);
            render();
        });
    });

    // controls 

    document.querySelectorAll(".qty-inc").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const val = btn.closest(".content").querySelector(".qty-val");
            setQuantity(id, Number(val.textContent || 1) + 1);
            render();
        });
    });

    document.querySelectorAll(".qty-dec").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const val = btn.closest(".content").querySelector(".qty-val");
            setQuantity(id, Math.max(1, Number(val.textContent || 1) - 1));
            render();
        });
    });

    document.querySelectorAll(".js-clear").forEach(btn => {
        btn.addEventListener("click", () => {
            clearCart();
            render();
        });
    });
}

function clearFieldErrors() {
   if (!form) return;
   form.querySelectorAll(".error-msg").forEach((el) => {
        el.textContent = "";
        el.style.display = "none";
   });
   form.querySelectorAll("input").forEach((i) => i.classList.remove("is-invalid"));
   if (formMsg) {
        formMsg.textContent = "";
        formMsg.className = "form-msg";
   }
}

function fieldError(input, text) {
    input.classList.add("is-invalid");
    const err = input.nextElementSibling;
    if (err && err.classList.contains("error-msg")) {
        err.textContent = text;
        err.style.display = "block";
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFieldErrors();

    const fd = new FormData(form);
    const val = (name) => (fd.get(name) ?? "").toString().trim();

    const fullName = val("fullName").trim();
    const email = val("email").trim();
    const address = val("address").trim();
    const city = val("city").trim();
    const postal = val("postal").trim();
    const country = val("country").trim();
    const payment = val("payment").trim();

    let ok = true;

    if (!fullName) { ok = false; fieldError(form.fullName, "Please enter your full name"); }
    if (!email) { ok = false; fieldError(form.email, "Please enter email"); }
    if (!address) { ok = false; fieldError(form.address, "Please enter your address"); }
    if (!city) { ok = false; fieldError(form.city, "Please enter your city"); }
    if (!postal) { ok = false; fieldError(form.postal, "Please enter your postal code"); }
    if (!country) { ok = false; fieldError(form.country, "Please enter your country"); }

    if (!ok) return;

    const payBtn = document.querySelector("#pay-btn");
    payBtn?.setAttribute("disabled", "true");
    payBtn?.classList.add("is-loading");

    formMsg.textContent = "Processing payment..."
    formMsg.className = "form-msg info"

    form.querySelectorAll("input, button, fieldset").forEach(el => {
        if (el.id !== "pay-btn") el.setAttribute("disabled", "true");
    });

    setTimeout(() => {
    const t = computeTotals();

        formMsg.textContent = "Success! Redirecting...";
        formMsg.className = "form-msg success";
        
        sessionStorage.setItem("nc_last_order",
            JSON.stringify({
            total: t.pay || 0, 
            count: t.count || 0, 
            email: email || localStorage.getItem("email") || ""
        }));

        clearCart();
        updateCartQuantity();

        setTimeout(() => {
             location.href = "success.html";
        }, 400); }, 900);
});

render();