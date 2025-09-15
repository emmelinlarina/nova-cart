import { addToCart, updateCartQuantity } from "./cart.js"
import { getToken } from "./utils/storage.js";
import { fetchProducts } from "./api/products.js";

const isLoggedIn = !!getToken();
const loader = document.getElementById("page-loader");
const latestGrid = document.querySelector(".latest-products")
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'});

const slideShow = document.getElementById("slideshow");
const slidesWrap = document.querySelector("#slideshow .slides")
const prevBtn = document.querySelector("#slideshow .prev")
const nextBtn = document.querySelector("#slideshow .next")

const imgSrc = (p) => p?.image?.url ?? "images/fallback.png"
const imgAlt = (p) => p?.image?.alt ?? p.title ?? "Product image"
const price = (p) => (p.discountedPrice ?? p.price) + " $"


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
    const  list = Array.isArray(p.reviews) ? p.reviews : [];
    if (!list.length) return null;
    const sum = list.reduce((a, r) => a + (Number(r?.rating) || 0),0);
    return sum / list.length;
}

function starsHTML(rating) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.floor(r);
    const empty = 5 - full;
    return `
        <span class="stars" aria-label="Rated ${rating.toFixed(1)} out of 5">
            ${'★'.repeat(full)}${'☆'.repeat(empty)}
        </span>
    `;
}

function placeholderStarsHTML() {
    return `<span class="stars" aria-hidden="true"></span>`;
}

const slideHTML = (p, i, total) => {
    const rating = avgRating(p);

    return `
    <div class="mySlide" role="group" aria-label="Slide ${i + 1} of ${total}" aria-hidden="true">
        <a class="card" href="product.html?id=${p.id}">
            <div class="media">
                <img src="${imgSrc(p)}" alt="${imgAlt(p)}"/>
                ${saleBadge(p)}
            </div>
            <h3>${p.title}</h3>
            ${priceHTML(p)}
            ${rating != null ? starsHTML(rating) : placeholderStarsHTML()}
        </a>

        ${isLoggedIn ? `
            <button class="btn js-add-to-cart" 
                    data-product-id="${p.id}"
                    aria-label="Add ${p.title} to cart">
                <i class="fa-solid fa-cart-shopping"></i>
            </button>` : ``}
    </div>
    `; 
};

const cardHTML = (p) => {
    const rating = avgRating(p);
    return `
     <article class="product-card">
        <a class="card-link" href="product.html?id=${p.id}">
            <div class="media">
                    <img src="${imgSrc(p)}" alt="${imgAlt(p)}"/>
                    ${saleBadge(p)}
            
                <h3>${p.title}</h3>
                ${priceHTML(p)}
                ${rating != null ? starsHTML(rating) : placeholderStarsHTML()}

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

function wireAddToCartButtons(products) {
    const byId = new Map(products.map(p => [p.id, p]));
    document.querySelectorAll('.js-add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.productId;
            const product = byId.get(id);
            if (!product) return;
            addToCart(product);
            updateCartQuantity();
        });
    });
}

// Loader

async function init() {
    try { 
    loader.style.display = "grid";

    const products = await fetchProducts();

    // Carousel
    const wantedIds = [
        "9be4812e-16b2-44e6-bc55-b3aef9db2b82", // pink perfume
        "ce5b64e3-440d-46e5-952f-bfdbad8a48d2", // black digital watch
        "f99cafd2-bd40-4694-8b33-a6052f36b435" // USB charger
    ];

    const featured = products.filter(p => wantedIds.includes(p.id));
    slidesWrap.innerHTML = featured.map((p, i) => slideHTML(p, i, featured.length)).join("");
    
    slideShow.setAttribute("role", "region");
    slideShow.setAttribute("aria-roledescription", "carousel");
    slideShow.setAttribute("aria-label", "Latest products");
    slideShow.setAttribute("aria-live", "polite");

    let slideIndex = 1;
    const slides = [...slidesWrap.querySelectorAll(".mySlide")];

    const showSlide = (n) => {
        if (!slides.length) return; 
        if (n > slides.length) slideIndex = 1;
        if (n < 1) slideIndex = slides.length

        slides.forEach((s, i) => {
            const active = i === slideIndex - 1;
            s.style.display = active ? "block" : "none";
            s.setAttribute("aria-hidden", active ? "false" : "true");
            s.setAttribute("aria-current", active ? "true" : "false");
        });
        };

        const imgs = [...slidesWrap.querySelectorAll("img")];
        if (imgs.length) {
            let left = imgs.length;
            const done = () => { left--; if (left === 0) showSlide(slideIndex); };
            imgs.forEach(img => {
                if (img.complete) done();
                else img.addEventListener("load", done, {once: true});
        });
        } else { 
            showSlide(slideIndex);
        }
   
    // keyboard buttons

    prevBtn.addEventListener("click", () => showSlide(--slideIndex));
    nextBtn.addEventListener("click", () => showSlide(++slideIndex));

    slideShow.addEventListener("keydown", (e) => {

      const tag =(document.activeElement?.tagName || "").toLocaleLowerCase();
      if (tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable) return;
      
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextBtn?.click();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevBtn?.click();
      } else if (e.key === " " || e.key === "Enter") {

        if (document.activeElement && document.activeElement.click) {
            e.preventDefault();
            document.activeElement.click();
        }
      }
        
    });

    // slideshow timer

    let timer = null;
    const play = () => {
        stop();
        timer = setInterval(() => showSlide(++slideIndex), 4000);
        slideShow.setAttribute("aria-live", "off");
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; slideShow.setAttribute("aria-live", "polite"); } };

    play();

    slideShow.addEventListener("mouseenter", stop);
    slideShow.addEventListener("mouseleave", play);
    prevBtn.addEventListener("focus", stop);
    nextBtn.addEventListener("focus", stop);
    prevBtn.addEventListener("blur", play);
    nextBtn.addEventListener("blur", play);

    const lastest12 = products.slice(-12).reverse();
    latestGrid.innerHTML = lastest12.map(cardHTML).join("");

    if (isLoggedIn) {
        wireAddToCartButtons(products);
        updateCartQuantity();
    }


 }  catch (error) {
    console.error("Init error", error);
    latestGrid.innerHTML = `<p>Could not load products</p>`;
 } finally {
    loader.style.display = "none";
 }

}
    


init();