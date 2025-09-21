import { money } from "./money.js";

export function cartItemHTML({ p, q }) {
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
}