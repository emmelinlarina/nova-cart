import { fetchProducts } from "./api/products.js";

const loader = document.getElementById(`page-loader`);
const list = document.querySelector(`.latest-products`)

function cardHTML(p) {
    return `
    <article class="product-card">
        <a href="product.html?id=${p.id}" class="card-link">
            <img src="${p.image?.url}" alt="{p.image?.alt || p.title}">
            <h3>${p.title}</h3>
            <p class="price">${p.discountedPrice ?? p-price} NOK</p>
        </a>
        </article>
    `;
}

async function init() {
    loader.style.display = 'grid';
    const products = await fetchProducts();
    const latest3 = products.slice(-3).reverse();

    list.innerHTML = latest3.map(cardHTML).join('');
    loader.style.display = 'none';
}

init();