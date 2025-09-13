import { computeTotals, updateCartQuantity } from "./cart.js";

function makeOrderId() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.floor(Math.random() * 46655).toString(36).toUpperCase();
    return `NC-${t}-${r}`;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"});

(function inti() {
    const t = computeTotals?.() || {pay: 0};

    const email = localStorage.getItem("email") || "your email";

    document.querySelector(".js-order-id").textContent = makeOrderId();
    document.querySelector(".js-total").textContent = money.format(t.pay || 0);
    document.querySelector(".js-email").textContent = email;

    const user = localStorage.getItem("user");
    if (user) {
        const g = document.querySelector(".js-greeting");
        if (g) g.textContent = `Thank you for your order, ${user}!`;
    }

    updateCartQuantity?.();
})();