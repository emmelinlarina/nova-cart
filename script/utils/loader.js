import { getApp } from "./dom.js";

export function ensurePageLoader() {
    let loader = document.getElementById("page-loader");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "page-loader";
        loader.className = "page-loader";
        loader.style.display = "none";
        loader.innerHTML = `<div class="spinner"></div>`;
        document.body.appendChild(loader);
    }

    if (loader.parentElement !== document.body) {
        document.body.appendChild(loader);
    }
    loader.style.display = "none";
    return loader;
}

export function showLoader(show) {
    const loader = ensurePageLoader();
    loader.style.display = show ? "grid" : "none";
    document.body.classList.toggle("loading", show);
}

