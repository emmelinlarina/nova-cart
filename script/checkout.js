import {getCart, setQuantity, computeTotals, clearCart, updateCartQuantity} from "./cart.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"});

const shopWrap = document.querySelector(".js-shop");
const rightBar = document.querySelector(".js-right-bar");
const form = document.querySelector("#checkout-form");
const formMsg = document.querySelector("#checkout-msg");
const totalsBox = document.querySelector("#totals");

try {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
        form.querySelector('input[name="email"]').value = savedEmail;
    } 
} catch {}

function itemHTML({ p, q }) {
    const unit = p.discountedPrice || p.price || 0;
    return `
    <div class="box js-cart-item-container-${p.id}">
    <div class="content">
        <img src="${p.image.url}" alt="${p.image.alt}">
        <h3>${p.title}</h3>
        <h4>${money.format(unit)}</h4>

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

function render() {
    const cart = getCart();

    if (!cart.length) {
        shopWrap.innerHTML = `
        <h1>Your Cart</h1>
        <div class="empty-cart-message">
            <h2>Empty cart!</h2>
            <a class="btn" href="index.html">Continue shopping</a>
        </div>
        `;
        updateCartQuantity();
        return;
    }

    const rows = cart.map(itemHTML).join("");
    const totals = computeTotals();

    shopWrap.innerHTML = `
    <h1>Your Cart</h1>
    ${rows}
    `;

    rightBar.querySelector(".checkout-form") || (rightBar.innerHTML = `
        <p><span>Savings</span> <span>${money.format(totals.original)}</span></p>
        <hr>
        <p><span>Savings</span>  <span>${money.format(totals.savings)}</span></p>
        ${rightBar.innerHTML} 
        `);

        wire();
        updateCartQuantity();
}

function wire() {

    document.querySelectorAll(".js-delete-link").forEach((link) => {
        link.addEventListener("click", () => {
            const id = link.dataset.productId;
            setQuantity(id, 0);
            render();
        });
    });

    // controls 

    document.querySelectorAll(".qty-inc").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const parent = btn.closest(".content");
            const val = parent.querySelector(".qty-val");
            const next = Number(val.textContent || 1) + 1;
            setQuantity(id, next);
            render();
        });
    });

    document.querySelectorAll(".qty-dec").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const parent = btn.closest(".content");
            const val = parent.querySelector(".qty-val");
            const next = Math.max(1, Number(val.textContent || 1) - 1);
            setQuantity(id, next);
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
    const fullName = fd.get("fullName").trim();
    const email = fd.get("email").trim();
    const address = fd.get("address").trim();
    const city = fd.get("city").trim();
    const postal = fd.get("postal").trim();
    const country = fd.get("country").trim();
    const payment = fd.get("payment").trim();

    let ok = true;

    if (!fullName) { ok = false; fieldError(form.fullName, "Please enter your full name"); }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { ok = false; fieldError(form.email, "Please enter email"); }
    if (!address) { ok = false; fieldError(form.address, "Please enter your address"); }
    if (!city) { ok = false; fieldError(form.city, "Please enter your city"); }
    if (!postal) { ok = false; fieldError(form.postal, "Please enter your postal code"); }
    if (!country) { ok = false; fieldError(form.country, "Please enter your country"); }

    if (!ok) return;

    formMsg.textContent = "Processing payment"
    formMsg.className = "form-msg info"

    setTimeout(() => {
        clearCart();
        updateCartQuantity();
        location.href = "success.html";
    }, 800);
});

render();