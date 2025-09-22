import { addToCart, updateCartQuantity } from "./cart.js"
import { getToken } from "./utils/storage.js";
import { fetchProducts } from "./api/products.js";
import { imgSrc, imgAlt, saleBadge, priceHTML, starsHTML, slideHTML, productCardHTML } from "./utils/templates.js";

const isLoggedIn = !!getToken();
const app = document.getElementById("app");

function wireAddToCartButtons(products) {
    const byId = new Map(products.map(p => [p.id, p]));
    document.querySelectorAll('.js-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.dataset.productId;
            const product = byId.get(id);
            if (!product) return;
            addToCart(product);
            updateCartQuantity();
        });
    });
}

function renderHomeShell() {
    app.innerHTML = `
        <div id="page-loader" class="page-loader" style="display:none">
            <div class="spinner"></div>
        </div>

        <section class="slideshow" id="slideshow" role="region" aria-label="Featured products">
            <div class="slides" aria-live="polite"></div>
            <div class="controls">
                <button class="prev" aria-label="Previous"><i class="fa-solid fa-arrow-left"></i></button>
                <button class="next" aria-label="Next"><i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </section>

        <section class="home-info">
            <div class="info">
                <h2>Latest Products</h2>
                <p>Browse our newest items <br> and top deals</p>
                <h3>CATEGORY 1</h3>
            </div>
        </section>

        <section class="latest-products">
            <div class="grid"></div>
        </section>
    `;
}

// Loader

async function init() {
    renderHomeShell();

    const loader = document.getElementById("page-loader");
    const slideShow = document.getElementById("slideshow");
    const slidesWrap = slideShow.querySelector(".slides");
    const prevBtn = slideShow.querySelector(".prev");
    const nextBtn = slideShow.querySelector(".next");
    const latestGrid = document.querySelector(".latest-products .grid");

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
    slidesWrap.innerHTML = featured.map((p, i) => slideHTML(p, i, featured.length, { imgSrc, imgAlt, saleBadge, priceHTML, starsHTML, isLoggedIn})).join("");
    
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

    const latest12 = products.slice(-12).reverse();
    latestGrid.innerHTML = latest12.map((p) => productCardHTML(p, { 
        imgSrc, imgAlt, saleBadge, priceHTML, starsHTML, isLoggedIn
    })
    )
        .join("");

    if (isLoggedIn) {
        wireAddToCartButtons(products);
        updateCartQuantity();
    }


 }  catch (err) {
    console.error("Init error", err);
    const latestGrid = document.querySelector(".latest-products .grid");

    if (latestGrid) latestGrid.innerHTML = `<p>Could not load products</p>`;
 } finally {
    loader.style.display = "none";
 }

}
    


init();