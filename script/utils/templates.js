import { money } from "./money.js";

export const imgSrc = (p) => p?.image?.url || "images/fallback.png";
export const imgAlt = (p) => p?.image?.alt || p?.title || "Product image";

export function saleBadge(p) {
    if (typeof p.price !== 'number' || typeof p.discountedPrice !== 'number') return '';
    if (p.discountedPrice >= p.price) return '';
    const pct = Math.round((1 - (p.discountedPrice / p.price)) * 100);
    return `<span class="badge-sale" aria-label="Save ${pct}%">-${pct}%</span>`;
}

export function priceHTML(p) {
    const hasDiscount = typeof p.discountedPrice === "number" && 
                        typeof p.price === "number" &&
                        p.discountedPrice < p.price;

    if (hasDiscount) {
        const now = money.format(p.discountedPrice);
        const was = money.format(p.price);
        return `<div class="price">
                    <span class="now">${money.format(p.discountedPrice)}</span>
                    <span class="was" aria-label="was price">${money.format(p.price)}</span>
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
        <span class="stars" aria-label="Rated ${rating.toFixed(1)} out of 5">
            ${'★'.repeat(full)}${'☆'.repeat(empty)}
        </span>
    `;
}