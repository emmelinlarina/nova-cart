export let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(product) {
    const found = cart.find((item) => item.product?.id === product.id);
    if (found) {
        found.quantity += 1;
    } else {
        cart.push({ product, quantity: 1});
    }
    saveToStorage();
}

export function removeFromCart(productId) {
    const i = cart.findIndex((item) => item.product.id === productId);
    if (i !== -1) {
        if (cart[i].quantity > 1) cart[i].quantity -= 1;
        else cart.splice(i, 1);
        saveToStorage();
    }
}

export function updateCartQuantity() {
    const total = cart.reduce((n, item) => n + item.quantity, 0);
    const el = document.querySelector('.js-cart-quantity');
    if (el) el.textContent = total;
}