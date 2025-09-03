import { fetchProducts } from "./api/products.js";

const loader = document.getElementById("page-loader");
const latestGrid = document.querySelector(".latest-products")

const slideShow = document.getElementById("slideshow");
const slidesWrap = document.querySelector("#slideshow .slides")
const prevBtn = document.querySelector("#slideshow .prev")
const nextBtn = document.querySelector("#slideshow .next")

const imgSrc = (p) => p?.image?.url ?? "images/fallback.png"
const imgAlt = (p) => p?.image?.alt ?? p.title ?? "Product image"
const price = (p) => (p.discountedPrice ?? p.price) + " $"

const slideHTML = (p, i, total) => `
    <div class="mySlide" role="group" aria-label="Slide" ${i+1} of ${total}" aria-hidden="true">
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
    slidesWrap.innerHTML = latest3.map((p, i) => slideHTML(p, i, latest3.length)).join("");
    
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


 }  catch (error) {
    console.error("Init error", error);
    latestGrid.innerHTML = `<p>Could not load products</p>`;
 } finally {
    loader.style.display = "none";
 }

}
    


init();