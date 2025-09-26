import { money } from "./money.js";

export const imgSrc = (p) => p?.image?.url || "images/fallback.png";
export const imgAlt = (p) => p?.image?.alt || p?.title || "";

export function saleBadge(p) {
    if (typeof p.price !== 'number' || typeof p.discountedPrice !== 'number') return '';
    if (p.discountedPrice >= p.price) return '';
    const pct = Math.round((1 - (p.discountedPrice / p.price)) * 100);
    return `<span class="badge-sale" aria-label="true">-${pct}%</span>`;
}

export function priceHTML(p) {
    const hasDiscount = typeof p.discountedPrice === "number" && 
                        typeof p.price === "number" &&
                        p.discountedPrice < p.price;

    if (hasDiscount) {
        return `<div class="price">
                    <span class="now">${money.format(p.discountedPrice)}</span>
                    <del class="was">
                        <span class="visually-hidden">Previous price: </span>
                        ${money.format(p.price)}
                    </del>
                </div>`;
    }
        return ` <div class="price">
                    <span class="now">${money.format(p.price ?? 0)}</span>
                </div>`;
}

export function avgRating(p) {
    const list = Array.isArray(p.reviews) ? p.reviews : [];
    if (!list.length) return null;
    const sum = list.reduce((a, r) => a + (Number(r?.rating) || 0), 0);
    return sum / list.length;
}

export function starsHTML(rating, { showNumber = false } = {}) {
    if (rating == null) {
        return `<span class="stars" aria-hidden="true"></span>`;
    }
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.floor(r);
    const empty = 5 - full;
    return `
        <span class="stars" aria-hidden="true">
            ${'★'.repeat(full)}${'☆'.repeat(empty)}
        </span>${showNumber ? `<span class="rating-num">${r.toFixed(1)}</span>` : ""}
    `;
}

export function reviewSectionHTML(p) {
    const count = Array.isArray(p.reviews) ? p.reviews.length : 0;
    if (!count) return "";

    const avg = avgRating(p) ?? 0;

    return `
        <section class="reviews">
            <h3>Reviews</h3>
            ${starsHTML(avg, { showNumber: true })}
            <p class="review-count">${count} review${count === 1 ? "" : "s"}</p>
            <ul class="review-list">
                ${
                    p.reviews.map(r => {
                        const rVal = Number(r?.rating) || 0;
                        const body = r?.description ? `<p class="review-body">${r.description}</p>` : "";
                        const user = r?.username || "Anonymous";
                        return `
                        <li class="review">
                            <div class="review-head">
                                ${starsHTML(rVal)}
                                <span class="author">${user}</span>
                            </div>
                            ${body}
                        </li>`;
                    }).join("")
                }
            </ul>
        </section>
    `;
}


export const slideHTML = (p, i, total, { imgSrc, imgAlt, saleBadge, priceHTML, starsHTML, isLoggedIn }) => {
    const rating = avgRating(p);
    return `
        <div class="mySlide" role="group" aria-label="Slide ${i + 1} of ${total}" aria-hidden="true">
            <a class="card" href="product.html?id=${p.id}">
                <div class="media">
                    <div class="thumb">
                        <img src="${imgSrc(p)}" alt=""/>
                        ${saleBadge(p)}
                    </div>            
                <h3>${p.title}</h3>
                ${priceHTML(p)}
                ${starsHTML(rating)}
                ${isLoggedIn ? `
                <button class="btn js-add-to-cart" 
                        data-product-id="${p.id}"
                        aria-label="Add ${p.title} to cart">
                    <i class="fa-solid fa-cart-shopping"></i>
                </button>` : ``}
                </div>
            </a>
        </div>
        `; 
};

export const productCardHTML = (p, { imgSrc, imgAlt, saleBadge, priceHTML, starsHTML, isLoggedIn}) => {
    const rating = avgRating(p);
    return `
     <article class="product-card">
        <a class="card-link" href="product.html?id=${p.id}">
            <div class="media">
                <div class="thumb">
                    <img src="${imgSrc(p)}" alt=""/>
                    ${saleBadge(p)}
                </div>               
                <h3>${p.title}</h3>
                ${priceHTML(p)}
                ${starsHTML(rating)}
                ${isLoggedIn ? `
                    <button class="btn js-add-to-cart"
                        data-product-id="${p.id}"
                        aria-label="Add ${p.title} to cart">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </button>` : ``}
                </div>    
        </a>
    </article>
    `;
};

export function cartItemHTML({ p, q }) {
    const hasDiscount = p.discountedPrice && p.discountedPrice < p.price;
    return `
    <div class="box js-cart-item-container-${p.id}">
        <div class="content">
            <img src="${p.image.url}" alt="${imgAlt(p)}">
            <h3>${p.title}</h3>
            <div class="price">
                ${
                    hasDiscount
                    ? `<span class="now">${money.format(p.discountedPrice)}</span>
                        <del class="was">${money.format(p.price)}</del>`
                    : `<span class="now">${money.format(p.price)}</span>`
                }
            </div>
            <div class="qty">
                <button class="qty-dec" data-id="${p.id}"
                 aria-label="Decrease quantity">-</button>
                <span class="qty-val">${q}</span>
                <button class="qty-inc" data-id="${p.id}" 
                aria-label="Increase quantity">+</button>
            </div>
            <p class="btn-area">
                <button class="btn2 js-delete-link" data-product-id="${p.id}" aria-label="Remove ${p.title} from cart">
                    <i class="fa-solid fa-trash" aria-hidden="true"></i> Remove
                </button>
            </p>
        </div>
    </div>
    `;
}