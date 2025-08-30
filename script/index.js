import { fetchProducts } from "./api/products.js";

const loader = document.getElementById("page-loader");
const track = document.querySelector(".carousel-track")
const latestGrid = document.querySelector(".latest-products")
const prevBtn = document.querySelector(".carousel-btn-prev")
const nextBtn = document.querySelector(".carousel-btn-next")

const imgSrc = (p) => p?.image?.url ?? "images/fallback.png"
const imgAlt = (p) => p?.image?.alt ?? p.title ?? "Product image"
const price = (p) => (p.discountedPrice ?? p.price) + " NOK"

const slideHTML = (p) => `
    <article class="product-card carousel-item ">
        <a class="card-link" href="product.html?id=${p.id}">
            <img src="${imgSrc(p)}" alt="${imgAlt(p)}" />
            <h3>${p.title}</h3>
            <p class="price">${price(p)}</p>
        </a>
    </article>
`;

const cardHTML = (p) => `
     <article class="product-card carousel-item ">
     <article class="product-cart">
        <a class="card-link" href="product.html?id=${p.id}">
            <img src="${imgSrc(p)}" alt="${imgAlt(p)}" />
            <h3>${p.title}</h3>
            <p class="price">${price(p)}</p>
        </a>
    </article>
`;

// Loader

async function init() {
    try { 
    loader.style.display = "grid";

    const products = await fetchProducts();

    // Carousel
    const latest3 = products.slice(-3);
    track.innerHTML = latest3.map(slideHTML).join("");
    setupCarousel();

    const latest12 = products.slice(-12).reverse();
    latestGrid.innerHTML = latest12.map(cardHTML).join("");

     } catch (err) {
    console.error("Init error:", err)
    latestGrid.innerHTML = `<p>Could not load products.</p>`;
     } finally {
        loader.style.display ="none";
    }
}

// Carousel looping 
function setupCarousel() {
    const items = track.querySelectorAll(".carousel-item");
    if (items.length === 0) return; 
    

    const firstClone = items[0].cloneNode(true);
    const lastClone = items[items.length - 1].cloneNode(true);
    firstClone.dataset.clone = "first";
    lastClone.dataset.clone = "last";
    track.prepend(lastClone);
    track.appendChild(firstClone);

    let current = 1;

    function stepWidth() {
    const w = track.querySelector(".carousel-item").getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return w + gap;
}

function go(index, animate = true) {
    const step = stepWidth();
    if (!animate) track.style.transition = "none";
    track.style.transform = `translateX(${-index * step}px)`;
    if (!animate) {
        track.getBoundingClientRect();
        track.style.transition = "transform .3s ease";
    }

    current = index;
}


whenImagesLoaded(track, () => requestAnimationFrame(()=> go(current, false)));

nextBtn?.addEventListener("click", () => go(current + 1));
prevBtn?.addEventListener("click", () => go(current - 1));

track.addEventListener("transitionend", () => {
    const realCount = items.length;
    if (current === realCount + 1) go(1, false);
    if (current === 0) go(realCount, false);
});

window.addEventListener("resize", () => go(current, false));

}function whenImagesLoaded(container, cb) {
    const imgs = [...container.querySelectorAll('img')];
    if (imgs.length === 0) return cb();
    let left = imgs.length;
    const done = () => (--left === 0 && cb());
    imgs.forEach(img => img.complete ? done() : img.addEventListener('load', done, {once:true}));
}

init();