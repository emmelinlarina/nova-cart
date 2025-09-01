import { fetchProducts } from "./api/products.js";

function renderProducts(product) {
    titleElement.innerText = product.title;
    const imageUrl = product.image?.url || 'images/placeholder.jpg';
    const imageAlt = product.image?.alt || product.title;

    productContainer.innerHTML = `

        <div class="all">
            <h1>${product.title.toUpperCase()}</h1>
            <img src="${imageUrl}" alt="${imageAlt}">
            <h2>$${formatCurrency(product.price * 100)}</h2>
            <button class="btn js-add-to-cart" data-product-id="${product.id}">
                    <i class="fa-solid fa-cart-shopping"></i>
            </button>
        </div>  

        <div class="column-1">
                <h3>OVERVIEW</h3>
                <p>"${product.description}"</p>
        </div>
    `;

    document.querySelector('.js-add-to-cart').addEventListener('click', () => {
        addToCart(product);
        updateCartQuantity();
    })
}

async function initProductPage() {
    const id = getProductIdFromUrl();
    if (!id) {
      productContainer.innerHTML = '<p>Product not found</p>';
      return;
    }
    const product = await fetchingSingleProduct(id);
    renderProducts(product);
    updateCartQuantity();
    hideLoader(); 
}


initProductPage();