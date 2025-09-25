const STORAGE_KEY = "cart";

export let cart = (() => {
const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

return raw.map((it) => 
    it && it.p
        ? it
        : {
            p: {
                id: it?.product?.id, 
                title: it?.product?.title,
                price: Number(it?.product?.price ?? 0),
                discountedPrice: Number(
                    it?.product?.discountedPrice ?? it?.product?.price ?? 0
                ),
                image: {
                    url: it?.product?.image?.url || "images/fallback.png",
                    alt: it?.product?.image?.alt || it?.product?.title || "Product image",
                },
            },
            q: Number(it?.quantity ?? 1),
        }
    );
})();


const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

const byId = (id) => cart.findIndex((it) => it.p.id === id);
const slim = (p) => ({
    id: p.id,
    title: p.title, 
    price: Number(p.price ?? 0),
    discountedPrice: Number(p.discountedPrice ?? p.price ?? 0),
    image: {
        url: p?.image?.url || "images/fallback.png",
        alt: p?.image?.alt || p?.title || "Product image",
    },
});

export function addToCart(product) {
    if (!product) return;
    const i = byId(product.id);
    if (i > -1) cart[i].q += 1;
    else cart.push({ p: slim(product), q: 1 });
    save();
}

export function setQuantity(productId, qty) {
    const i = byId(productId);
    if (i === -1) return;
    if (qty <= 0) cart.splice(i, 1);
    else cart[i].q = qty;
    save();
}

export function removeOne(productId) {
    const i = byId(productId);
    if (i === -1) return;
    cart[i].q > 1 ? (cart[i].q -= 1) : cart.splice(i, 1);
    save();
}

export function clearCart() {
    cart = [];
    save();
}

export const getCart = () => cart;

export function updateCartQuantity() {
    const total = cart.reduce((n, it) => n + (Number(it.q) || 0), 0);
    const el = document.querySelector(".js-cart-quantity");
    if (el) el.textContent = total;
}
    
export function computeTotals() {
    const original = cart.reduce((sum, it) => sum + it.p.price * it.q, 0);
    const pay = cart.reduce(
        (sum, it) => sum + (it.p.discountedPrice || it.p.price) * it.q, 0
    );

    return {
        original, 
        pay, 
        savings: Math.max(0, original - pay),
        count: cart.reduce((n, it) => n + it.q, 0),
    };
}