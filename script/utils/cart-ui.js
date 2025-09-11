import { getCart, setQuantity, removeOne, clearCart, computeTotals, updateCartQuantity,} from "../cart.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"});

const wrap = document.querySelector("main");

function rowHTML({ p, q }) {
    const unit = p.discountedPrice || p.price;
    const line = unit * q;

    return `
    <article class="cart-row" data-id="${p.id}">
    <img class="cart-thumb" src="${p.image.url}" alt="${p.image.alt}">
        <div class="cart-info">
            <h3>${p.title}</h3>
            <div class="cart-price">
                ${p.discountedPrice && p.discountedPrice < p.price
                    ? `<span class="now">${money.format(p.discountedPrice)}</span>
                        <span class="was">${money.format(p.price)}</span>`
                       : `<span class="now">${money.format(p.price)}</span>`
                }
            </div>
            <div class="cart-qty">
                <button class="qty-dec" aria-label="Decrease quantity">-</button>
                <input class="qty-input" type="number" min="1" value="${q}">
                <button class="qty-inc" aria-label="Increase quantity">+</button>
                <button class="row-remove btn-link" >Remove</button>
            </div>
        </div>
        <div class="cart-line">${money.format(line)}</div>
    </article>
    `;
}

function totalsHTML(t) {
    return `
        <section class="cart-totals">
            <div><span>Subtotal</span><span>${money.format(t.original)}</span></div>
            <div><span>Savings</span><span>${money.format(t.savings)}</span></div>
            <div class="cart-actions">
                <button class="btn btn-outline js-clear">Clear cart</button>
                <a class="btn" href="checkout.html">Checkout</a>
            </div>
        </section>
    `;
}

function emptyHTML() {
    return `
    <section class="cart-empty">
        <p>Your cart is empty</p>
        <a class="btn" href="index.html">Continue Shopping</a>
    </section>
    `;
}

function render() {
    const items = getCart();
    if (!items.length) {
        wrap.innerHTML = emptyHTML();
        updateCartQuantity();
        return;
    }

    const rows = items.map(rowHTML).join("");
    const totals = computeTotals();

    wrap.innerHTML = `
    <section class="cart">
        <h1>Your cart</h1>
        <div class="cart-list">${rows}</div>
        ${totalsHTML(totals)}
    </section>
    `;

    wire();
    updateCartQuantity();
}

function wire() {
    wrap.querySelectorAll(".cart-row").forEach((row) => {
        const id = row.dataset.id;
        const input = row.querySelector(".qty-input");

    row.querySelector(".qty-inc").addEventListener("click", () => {
        setQuantity(id, Number(input.value || 1) +1);
        render();
    });

    row.querySelector(".qty-dec").addEventListener("click", () => {
        setQuantity(id, Number(input.value || 1) -1);
        render();
    });

    input.addEventListener("change", () => {
        setQuantity(id, Math.max(1, Number(input.value || 1)));
        render();
    });

    row.querySelector(".row-remove").addEventListener("click", () => {
        setQuantity(id, 0);
        render();
    });
});

wrap.querySelector(".js-clear")?.addEventListener("click", () => {
    clearCart();
    render();
    });
}

render();