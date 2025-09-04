import { getToken, logoutUser } from "./utils/storage.js";
import { updateCartQuantity } from "./cart.js";

const authLink = document.querySelector('.js-auth-link');
const authText = document.querySelector('.auth-text');
const logoutBtn = document.querySelector('.js-logout');

const token = getToken();
if (token) {
    if (authLink) { authLink.href = 'account.html'; }
    if (authText) { authText.textContent = 'Account'; }
    if (logoutBtn) { logoutBtn.hidden = false; }
} else {
    if (authLink) { authLink.href = 'login.html'; }
    if (authText) { authText.textContent = 'Log in'; }
}

logoutBtn?.addEventListener('click', () => {
    logoutUser();
    location.reload();
});

updateCartQuantity?.();