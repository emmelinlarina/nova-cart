import { getCart, setQuantity, clearCart, computeTotals, updateCartQuantity,} from "../cart.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"});

const wrap = document.querySelector("main");

document.body.classList.add("cart-page");

const itemHTML = ({ p, q }) => {
    const hasDiscount = p.discountedPrice && p.discountedPrice < p.price;
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
};

const shellHTML = () => `
    <div class="checkout-grid">
        <section class="shop js-shop"></section>

        <div class="cart-actions" style="display:none">
            <button type="button" class="btn btn-outline js-clear">Clear cart</button>
        </div>


        <aside class="right-bar js-right-bar">
        
            <h2>Summary</h2>
            <section class="order-summary">
                <p><span>Subtotal</span><span class="js-subtotal">$0.00</span></p>
                <p><span>Savings</span><span class="js-savings">$0.00</span></p>
                <p class="total"><span>Total</span><span class="js-total">$0.00</span></p>
            </section>
            <a class="btn checkout-btn" href="checkout.html">Continue to Checkout</a>
        </aside>
    </div>                           
`;

const emptyHTML = () => `
    <section class="empty-cart-message">
        <h2>Empty Cart!</h2>
        <a class="btn href="index.html">Continue Shopping</a>
    </section>
`;

function renderTotals() {
    const t = computeTotals();
    const rb = document.querySelector(".js-right-bar");
    if (!rb) return;
    const set = (sel, v) => {
        const el = rb.querySelector(sel);
        if (el) el.textContent = money.format(v);
    };

    set(".js-subtotal", t.original);
    set(".js-savings", t.savings);
    set(".js-total", t.pay);
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
            const next = Number(val.textContent || 1) + 1;
            setQuantity(id, next);
            render();
        });
    });

    document.querySelectorAll(".qty-dec").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const val = btn.closest(".content").querySelector(".qty-val");
            const next = Number(val.textContent || 1) - 1;
            setQuantity(id, next);
            render();
        });
    });

    document.querySelector(".js-clear")?.addEventListener("click", () => {
        clearCart();
        render();
    });
}

export function render() {
    if (document.querySelector(".checkout-grid")) {
        wrap.innerHTML = shellHTML();
    }

    const shop = document.querySelector(".js-shop");
    const actions = document.querySelector(".cart-actions");
    const items = getCart();

    if (!items.length) {
        shop.innerHTML = emptyHTML();
        actions.style.display = "none";
        renderTotals();
        updateCartQuantity();
        return;
    }

    actions.style.display = "flex";
    shop.innerHTML = `
        <img src="images/logo/NovaCart_brown_cropped.png" alt="NovaCart logo" class="cart-logo">
        <h1>Your Cart</h1>
        ${items.map(itemHTML).join("")}
    `;

    wire();
    renderTotals();
    updateCartQuantity();
}

render();