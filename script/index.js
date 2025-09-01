import { fetchProducts } from "./api/products.js";

const loader = document.getElementById("page-loader");
const latestGrid = document.querySelector(".latest-products")

const slidesWrap = document.querySelector("#slideshow .slides")
const prevBtn = document.querySelector("#slideshow .prev")
const nextBtn = document.querySelector("#slideshow .next")

const imgSrc = (p) => p?.image?.url ?? "images/fallback.png"
const imgAlt = (p) => p?.image?.alt ?? p.title ?? "Product image"
const price = (p) => (p.discountedPrice ?? p.price) + " $"

const slideHTML = (p) => `
    <div class="mySlide">
        <a class="card" href="product.html?id=${p.id}">
            <img src="${imgSrc(p)}" alt="${imgAlt(p)}" />
            <h3>${p.title}</h3>
            <p class="price">${price(p)}</p>
        </a>
    </div>
`;

const cardHTML = (p) => `
     <article class="product-card">
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
    slidesWrap.innerHTML = latest3.map(slideHTML).join("");
    

    let slideIndex = 1;
    const showSlide = (n) => {
        const slides = slidesWrap.querySelectorAll(".mySlide");
        if (!slides.length) return; 
        if (n > slides.length) slideIndex = 1;
        if (n < 1) slideIndex = slides.length
        slides.forEach(s => s.style.display = "none");
        slides[slideIndex - 1].style.display = "block";
            
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
   

    prevBtn.addEventListener("click", () => showSlide(--slideIndex));
    nextBtn.addEventListener("click", () => showSlide(++slideIndex));

    const lastest12 = products.slice(-12).reverse();
    latestGrid.innerHTML = lastest12.map(cardHTML).join("");


 }  catch (error) {
    console.error("Init error", error);
    latestGrid.innerHTML = `<p>Could not load products</p>`;
 } finally {
    loader.style.display = "none";
 }

}
    


init();