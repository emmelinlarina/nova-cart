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

function renderProducts(p) {
    titleElement.textContent = p.title || 'Product';

    const imageUrl = p?.image?.url || 'images/fallback.png';
    const imageAlt = p?.image?.alt || p?.title || 'Product image';

    productContainer.innerHTML = `

        <div class="column">
            <h1>${(p.title || '').toUpperCase()}</h1>

            <div class="media">
                <img src="${imageUrl}" alt="${imageAlt}">
                ${saleBadge(p)}
            </div>

            ${priceHTML(p)}

            <button class="btn js-add-to-cart" data-product-id="${p.id}">
                        <i class="fa-solid fa-cart-shopping"></i>
            </button>
        </div>  

        <div class="column-1">
                <p>"${p.description ?? ''}"</p>
                ${Array.isArray(p.tags) && p.tags.length ? `
                <ul class="tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>
                `: ""}
        </div>
    `;

    productContainer.querySelector(".js-add-to-cart").addEventListener("click", () => {
        alert("Add to cart coming soon");
    });
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