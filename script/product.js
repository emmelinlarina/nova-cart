import { addToCart, updateCartQuantity } from "./cart.js";
import { getToken } from "./utils/storage.js";
import { getApp } from "./utils/dom.js";
import { imgSrc, imgAlt, saleBadge, priceHTML, reviewSectionHTML } from "./utils/templates.js";

const isLoggedIn = !!getToken();

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

const q = (id) => document.getElementById(id);


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
   
function renderProducts(p) {
    document.title = p.title || 'Product';
    const container = q("product-container");

    const imageUrl = imgSrc(p);
    const imageAlt = imgAlt(p);


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

        ${reviewSectionHTML(p)}
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
        q("product-container").innerHTML = `<p>Could not load product</p>`;
        showMessage('Could not load product. Please try again', 'error');
    }   finally {
    showLoader(false); 
    window.scrollTo(0,0);
    }
}


initProductPage();