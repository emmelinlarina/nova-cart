import { saveUser } from "./utils/storage.js";

// demo login

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.elements.email.value.trim();

    //user
    const fakeUser = {
        accessToken: 'demo-token-123', 
        name: email.split('@')[0] || 'User',
        email
    };

    saveUser(fakeUser);
    const from = new URLSearchParams(location.search).get('from');
    location.href = from || 'index.html';
});