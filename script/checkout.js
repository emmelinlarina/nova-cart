import {getCart, setQuantity, computeTotals, clearCart, updateCartQuantity} from "./cart.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"});

const shopWrap = document.querySelector(".js-shop");
const rightBar = document.querySelector(".js-right-bar");
const form = document.querySelector("#checkout-form");
const formMsg = document.querySelector("#checkout-msg");

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
        <h1>Your Cart</h1>
        <section class="empty-cart-message">
            <h2>Empty cart!</h2>
            <a class="btn" href="index.html">Continue shopping</a>
        </section>
        `;
        renderTotals();
        updateCartQuantity();
        return;
    }

    const rows = cart.map(itemHTML).join("");
    shopWrap.innerHTML = `<h1>Your cart</h1>${rows}`;

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

    rightBar.querySelector(".js-clear")?.addEventListener("click", () => {
        clearCart();
        render();
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
    if (!email) { ok = false; fieldError(form.email, "Please enter email"); }
    if (!address) { ok = false; fieldError(form.address, "Please enter your address"); }
    if (!city) { ok = false; fieldError(form.city, "Please enter your city"); }
    if (!postal) { ok = false; fieldError(form.postal, "Please enter your postal code"); }
    if (!country) { ok = false; fieldError(form.country, "Please enter your country"); }

    if (!ok) return;

    formMsg.textContent = "Processing payment"
    formMsg.className = "form-msg info"

    setTimeout(() => {

        const t = computeTotals();
        
        sessionStorage.setItem("nc_last_order",
            JSON.stringify({
            total: t.pay || 0, 
            count: t.count || 0, 
            email: email || localStorage.getItem("email") || ""
        })
    );

        clearCart();
        updateCartQuantity();
        location.href = "success.html";
    }, 800);
});

render();