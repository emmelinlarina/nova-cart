import { getToken, logoutUser, getUser } from "./utils/storage.js";
import { updateCartQuantity } from "./cart.js";

function syncHeader() { 
const authLink = document.querySelector('.js-auth-link .auth-text');
const authText = document.querySelector('.auth-text');
const logoutBtn = document.querySelector('.js-logout');


const token = getToken();

if (token) {
    if (authLink)  authLink.href = ""; 
    if (authText)  authText.textContent = getUser() || 'Account'; 
    if (logoutBtn) logoutBtn.hidden = false; 
} else {
    if (authLink)  authLink.href = 'login.html'; 
    if (authText)  authText.textContent = 'Log in'; 
    if (logoutBtn)  logoutBtn.hidden = true;
}

logoutBtn?.replaceWith(logoutBtn?.cloneNode(true));
    const freshLogoutBtn = document.querySelector(".js-logout");
    freshLogoutBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();

        location.href = "index.html";
    });
}

function initHeader() {
    syncHeader();

    try { updateCartQuantity(); } catch {}

    window.addEventListener("storage", (e) => {
        if (e.key === "token" || e.key === "cart") {
            syncHeader();
            try { updateCartQuantity(); } catch {}
        }
    });
}

document.addEventListener("DOMContentLoaded", initHeader);