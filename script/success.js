import { computeTotals, updateCartQuantity } from "./cart.js";

function makeOrderId() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.floor(Math.random() * 46655).toString(36).toUpperCase();
    return `NC-${t}-${r}`;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"});

(function init() {

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
    const g = document.querySelector(".js-greeting");
    if (g && user) g.textContent = `Thank you for your order, ${user}!`;
    

    updateCartQuantity?.();

})();