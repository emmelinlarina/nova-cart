import { addToCart, updateCartQuantity } from "./cart.js";
import { getToken } from "./utils/storage.js";

const isLoggedIn = !!getToken();
const loader = document.getElementById("page-loader");
const productContainer = document.querySelector("#product-container");
const titleElement = document.querySelector("title");
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'});



function showLoader(show) {
    if (!loader) return;
  loader.style.display = show ? 'grid' : 'none';
  document.body.classList.toggle("loading", show)
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
        typeof p.discountedPrice === 'number' && 
        typeof p.price === 'number' &&
        p.discountedPrice < p.price;

        if (hasDiscount) {
            const save = p.price - p.discountedPrice;
            return `
            <div class="price">
                <span class="now">${money.format(p.discountedPrice)}</span>
                <span class="was" aria-label="was price">${money.format(p.price)}</span>
                <span class="save">Save ${money.format(save)}</span>
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
    titleElement.textContent = p.title || 'Product';

    const imageUrl = p?.image?.url || 'images/fallback.png';
    const imageAlt = p?.image?.alt || p?.title || 'Product image';

    // rating

    const avg = avgRating(p);
    const reviewCount = Array.isArray(p.reviews) ? p.reviews.length : 0;


    productContainer.innerHTML = `

        <div class="column">
            <h1>${(p.title || '').toUpperCase()}</h1>

            <div class="media">
                <img src="${imageUrl}" alt="${imageAlt}">
                ${saleBadge(p)}
            </div>

        ${starsHTML(avg, { showNumber: true })} 
        ${reviewCount 
            ? `<p class="review-count">${reviewCount} review${reviewCount === 1 ? '' : 's'}</p>`
            : '<p class="review-count">No reviews yet</p>'}

            ${priceHTML(p)}

            
        <div class="column-1">
                <p>"${p.description ?? ''}"</p>
                ${Array.isArray(p.tags) && p.tags.length 
                ? `<ul class="tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>
                `: ''}
        </div>
            ${isLoggedIn ? `
                <button class="btn js-add-to-cart"
                    data-product-id="${p.id}"
                    aria-label="Add ${p.title} to cart">
                    <i class="fa-solid fa-cart-shopping"></i>
                 </button>` 
                 : `<a class="btn btn-outline" href="login.html">Log in to buy</a>`}
        </div>  

        ${reviewCount ? `
        <section class="reviews">
            <h3>Reviews</h3>
                <ul class="review-list">
                    ${p.reviews.map(r => `
                        <li class="review">
                            <div class="review-head">
                                ${starsHTML(Number(r?.rating) || 0)}
                                <span class="author">${r?.username || 'Anonymous'}</span>
                            </div>
                            ${r?.description ? `<p class="review-body">${r.description}</p>` : ''}
                        </li>
                    `).join('')}
                </ul>
        </section>
        ` : ''}
    `;

    const btn = productContainer.querySelector(".js-add-to-cart");
    if (btn) {
        if (isLoggedIn) {
            btn.addEventListener("click", () => {
                addToCart(p);
                updateCartQuantity();
            });
        } else {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                alert("Please log in to add items to cart");
            });
        }
    }

}



async function initProductPage() {
    try {
        showLoader(true);


    const id = getProductIdFromUrl();
    if (!id) {
      productContainer.innerHTML = '<p>Product not found</p>';
      return;
    }


    const product = await fetchingSingleProduct(id);
    if (!product) {
        productContainer.innerHTML = "<p>Product not found</p>";
        return;
    }

    renderProducts(product);
    } catch (e) {
        console.error(e);
        productContainer.innerHTML = `<p>Could not load product</p>`;
    }   finally {
    showLoader(false); 
    window.scrollTo(0,0);
    }
}


initProductPage();