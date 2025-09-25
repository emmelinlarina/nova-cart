import { getCart, setQuantity, computeTotals, clearCart, updateCartQuantity } from "./cart.js";
import { getApp } from "./utils/dom.js";
import { money } from "./utils/money.js";
import { prefillEmail, clearFieldErrors, fieldError, setMsg } from "./utils/forms.js";
import { writeLastOrder } from "./utils/order.js";
import { cartItemHTML } from "./utils/templates.js";
import { showLoader } from "./utils/loader.js";

const fromCart = sessionStorage.getItem("navFromCart") === "1";
if (fromCart) showLoader(true);

function renderCheckoutShell() {
    const app = getApp();
    app.innerHTML = `
    <main class="checkout-grid">

        <section class="shop js-shop"></section>

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
                <span class="visually-hidden">Name</span>
                    <input type="text" id="fullName" name="fullName" placeholder="Full name" autocomplete="name"
                        required />
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <label class="field">
                <span class="visually-hidden">Email</span>
                    <input type="text" id="email" name="email" placeholder="Email" autocomplete="email" required />
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <label class="field">
                <span class="visually-hidden">Address</span>
                    <input type="text" id="address" name="address" placeholder="Address" autocomplete="street-address"
                        required />
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <div class="grid-2">
                    <label class="field">
                    <span class="visually-hidden">City</span>
                        <input type="text" id="city" name="city" placeholder="City" autocomplete="address-level2"
                            required />
                        <span class="error-msg" aria-live="polite"></span>
                    </label>

                    <label class="field">
                    <span class="visually-hidden">Postal code</span>
                        <input type="text" id="postal" name="postal" placeholder="Postal code"
                            autocomplete="postal-code" required />
                        <span class="error-msg" aria-live="polite"></span>
                    </label>

                </div>
                <label class="field">
                <span class="visually-hidden">Country</span>
                    <input type="text" id="country" name="country" placeholder="Country" autocomplete="country-name"
                        required />
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <h2>Payment</h2>

                <fieldset class="pay-methods">
                <legend class="visually-hidden">Payment method</legend>
                    <label> <input type="radio" id="card" name="payment" value="card" checked>Card</label>
                    <label> <input type="radio" id="vipps" name="payment" value="vipps">Vipps </label>
                    <label> <input type="radio" id="paypal" name="payment" value="paypal">Paypal </label>
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
const shopWrap = document.querySelector(".js-shop");
const rightBar = document.querySelector(".js-right-bar");
const form = app.querySelector("#checkout-form");
const formMsg = app.querySelector("#checkout-msg");

prefillEmail(form);

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

    const rows = cart.map(cartItemHTML).join("");
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

form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFieldErrors(form);

    const fd = new FormData(form);
    const val = (name) => (fd.get(name) ?? "").toString().trim();

    const fullName = val("fullName");
    const email = val("email");
    const address = val("address");
    const city = val("city");
    const postal = val("postal");
    const country = val("country");
    const payment = val("payment");

    let ok = true;
    if (!fullName) { ok = false; fieldError(form,"fullName", "Please enter your full name"); }
    if (!email) { ok = false; fieldError(form, "email", "Please enter email"); }
    if (!address) { ok = false; fieldError(form, "address", "Please enter your address"); }
    if (!city) { ok = false; fieldError(form, "city", "Please enter your city"); }
    if (!postal) { ok = false; fieldError(form, "postal", "Please enter your postal code"); }
    if (!country) { ok = false; fieldError(form, "country", "Please enter your country"); }

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
        
        writeLastOrder({
            total: t.pay || 0,
            count: t.count || 0,
            email: email || localStorage.getItem("email") || "",
        });
        try { if (email) localStorage.setItem("email", email); } catch {}
        

        clearCart();
        updateCartQuantity();

        setTimeout(() => {
             location.href = "success.html"; }, 400); }, 900);
});

render();
if (fromCart) {
    showLoader(false);
    sessionStorage.removeItem("navFromCart");
}