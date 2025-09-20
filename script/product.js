import { addToCart, updateCartQuantity } from "./cart.js";
import { getToken } from "./utils/storage.js";

const isLoggedIn = !!getToken();
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'});

function getApp() {
    let el = document.getElementById("app");
    if (!el) {
        el = document.createElement("main");
        el.id = "app";

        document.body.insertBefore(el, document.getElementById("site-footer") || null);
    }
    return el;
}

function renderProductShell() {
    const app = getApp();
    app.innerHTML = `
        <div id="page-loader" class="page-loader" style="display:none">
            <div class="spinner"></div>
        </div>

        <div id="page-message" class="page-message" aria-live="polite"></div>

        <section class="product">
            <h2 class="sr-only">Product</h2>
            <div id="product-container"></div>
        </section>
    `;
}

function q(id) {
    return document.getElementById(id);
}

function showLoader(show) {
    const loader = q("page-loader");
    if (!loader) return;
    loader.style.display = show ? 'grid' : 'none';
    document.body.classList.toggle("loading", show)
}

function showMessage(text, kind = "info") {
    const box = q("page-message")
    if (!box) return;
    box.textContent = text;
    box.className = `page-message ${kind}`;
    setTimeout(() => { 
        box.textContent = ""; 
        box.className = "page-message";
    }, 1500);
   } 

function getProductIdFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get("id");
}

async function fetchingSingleProduct(id) {
    const url = `https://v2.api.noroff.dev/online-shop/${encodeURIComponent(id)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return json.data;
}


function saleBadge(p) {
    if (typeof p.price !== 'number' || typeof p.discountedPrice !== 'number') return '';
    if (p.discountedPrice >= p.price) return '';
    const pct = Math.round((1 - (p.discountedPrice / p.price)) * 100);
    return `<span class="badge-sale" aria-label="Save ${pct}%">-${pct}%</span>`;
}

function priceHTML(p) {
    const hasDiscount =
        typeof p.discountedPrice === "number" && 
        typeof p.price === "number" &&
        p.discountedPrice < p.price;

        if (hasDiscount) {
            return `
            <div class="price">
                <span class="now">${money.format(p.discountedPrice)}</span>
                <span class="was" aria-label="was price">${money.format(p.price)}</span>
            </div>`;
        }

        return `
        <div class="price">
            <span class="now">${money.format(p.price ?? 0)}</span>
            </div>`;
}

function avgRating(p) {
    const arr = Array.isArray(p.reviews)
        ? p.reviews.map(r => Number(r?.rating)).filter(n => !Number.isNaN(n) && n >= 0 && n <= 5) : [];
    if (!arr.length) return null;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function starsHTML(avg, { showNumber = false} = {}) {
    if (!avg) {
        return `<div class="rating" role="img" aria-label="No ratings yet">
            <span class="no-rating">No ratings</span>
            </div>`;
    }

    const label = `${avg.toFixed(1)} out of 5 stars`;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const cls = avg >= i ? 'full' : (avg >= i - 0.5 ? 'half' : 'empty');
        stars += `<span class="star ${cls}" aria-hidden="true"> </span>`;
    }
    return `<div class="rating" role="img" aria-label="${label}">
    ${stars}${showNumber ? `<span class="rating-num">(${avg.toFixed(1)})</span>` : ''}
    </div>`;
    }
   
   

function renderProducts(p) {
    document.title = p.title || 'Product';

    const imageUrl = p?.image?.url || 'images/fallback.png';
    const imageAlt = p?.image?.alt || p?.title || 'Product image';
    const container = q("product-container");

    // rating

    const avg = avgRating(p);
    const reviewCount = Array.isArray(p.reviews) ? p.reviews.length : 0;


    container.innerHTML = `

        <div class="column">
            <div class="media">
                <img src="${imageUrl}" alt="${imageAlt}">
                ${saleBadge(p)}
            </div>

            <h1>${(p.title || '').toUpperCase()}</h1>            

            <div class="column-1">
                    <p>${p.description ?? ""}</p>
                    ${priceHTML(p)}
                    ${
                    Array.isArray(p.tags) && p.tags.length 
                    ? `<ul class="tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>`
                    : ''
                }

                <button class="btn btn-outline js-share" aria-label="Copy product link">Share</button>
            </div>
            
            ${isLoggedIn 
                ? `<button class="btn js-add-to-cart" data-product-id="${p.id}" aria-label="Add ${p.title} to cart">Buy</button>`
                : `<a class="btn btn-outline" href="login.html">Log in to buy</a>`}

                <div class ="js-inline-message" aria-live="polite"></div>
        </div>  

        ${reviewCount 
            ? `<section class="reviews">
                <h3>Reviews</h3>
                ${starsHTML(avg, { showNumber: true })} 
                ${reviewCount 
                ? `<p class="review-count">${reviewCount} review${reviewCount === 1 ? '' : 's'}</p>`
                : '<p class="review-count">No reviews yet</p>'}
                <ul class="review-list">
                    ${p.reviews.map(
                        r => `<li class="review">
                                <div class="review-head">
                                    ${starsHTML(Number(r?.rating) || 0)}
                                    <span class="author">${r?.username || 'Anonymous'}</span>
                                </div>
                                ${r?.description ? `<p class="review-body">${r.description}</p>` : ''}
                                </li>
                    `).join('')}
                </ul>
            </section>
            ` : ""}
    `;


    const buyBtn = container.querySelector(".js-add-to-cart");
    const inlineMsg = container.querySelector(".js-inline-message");
    
    if (buyBtn && isLoggedIn) {
        
        buyBtn.addEventListener("click", () => {
            addToCart(p);
            updateCartQuantity();
            if (inlineMsg) {
                inlineMsg.textContent = "Added to cart";
                inlineMsg.className = "js-inline-message success"
                setTimeout(() => {
                    inlineMsg.textContent = "";
                    inlineMsg.className = "js-inline-message";
                }, 1500);
            }
        });
    }

    const shareBtn = container.querySelector('.js-share');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const url = location.href;
            try {
                await navigator.clipboard.writeText(url);
                const old = shareBtn.textContent;
                shareBtn.textContent = 'Link copied!';
                shareBtn.setAttribute('aria-live', 'polite');
                setTimeout(() => { shareBtn.textContent = old; }, 1500);
            } catch {
                window.prompt('Copy this link', url);
            }
        });
    }

}

async function initProductPage() {
    renderProductShell();
    try {
        showLoader(true);


    const id = getProductIdFromUrl();
    if (!id) {
      q("product-container").innerHTML = "<p>Product not found</p>";
      showMessage("Product not found", "error");
      return;
    }


    const product = await fetchingSingleProduct(id);
    if (!product) {
        q("product-container").innerHTML = "<p>Product not found</p>";
        showMessage("Product not found", "error");
        return;
    }

    renderProducts(product);
    } catch (e) {
        console.error(e);
        q("productContainer").innerHTML = `<p>Could not load product</p>`;
        showMessage('Could not load product. Please try again', 'error');
    }   finally {
    showLoader(false); 
    window.scrollTo(0,0);
    }
}


initProductPage();