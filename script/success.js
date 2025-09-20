import { computeTotals, updateCartQuantity } from "./cart.js";

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

function makeOrderId() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.floor(Math.random() * 46655).toString(36).toUpperCase();
    return `NC-${t}-${r}`;
}

function getUserDisplayName() {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return "";
        const parsed = JSON.parse(raw);
        return parsed?.name || parsed?.email || "";
    } catch {
        return localStorage.getItem("user") || "";
    }
}

function renderSuccessShell() {
    const app = getApp();
    app.innerHTML = `
    <main class="success">
        <section class="success-card">
            <img src="images/logo/NovaCart_brown_cropped.png" alt="NovaCart logo" class="cart-logo">
            <div class="icon"><i class="fa-solid fa-circle-check"></i></div>
            <h1>Thank You</h1>
            <h2>Your payment was successful</h2>
            <p class="greeting js-greeting"></p>

            <div class="order">
                <p>Order:<span class="js-order-id"></span></p>
                <p>Total paid:<span class="js-total"></span></p>
                <p>Items:<span class="js-count"></span></p>
                <p>Receipt sent to:</p> <span class="js-email"></span>
            </div>

            <div class="actions">
                <a class="btn btn-outline" href="index.html">Home page</a>
            </div>
        </section>
    </main>
    `;
}


function hydrate() {

    let snap = {};
    try {
        snap = JSON.parse(sessionStorage.getItem("nc_last_order") || "{}");
    } catch {}

    if (!snap || typeof snap.total !== "number") {
        const t = computeTotals() || { pay: 0, count: 0 };
        snap = { total: t.pay || 0, count: t.count || 0, email: localStorage.getItem("email") || "" };
    }

    const elId = document.querySelector(".js-order-id");
    const elTotal = document.querySelector(".js-total");
    const elEmail = document.querySelector(".js-email");
    const elCount = document.querySelector(".js-count");

    if (elId) elId.textContent = makeOrderId();
    if (elTotal) elTotal.textContent = money.format(snap.total || 0);
    if (elEmail) elEmail.textContent = snap.email || "your email";
    if (elCount) elCount.textContent = String(snap.count || 0);


    const user = localStorage.getItem("user");
    const title = document.querySelector(".success-card h1");
    
    if (title) {
        title.textContent = user ? `Thank you, ${user}!` : "Thank you!"
    }

    const g = document.querySelector(".js-greeting");
    if (g) g.textContent = "";

    updateCartQuantity?.();
}

(function init() {
    renderSuccessShell();
    hydrate();
})();