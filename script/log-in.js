import { saveUser } from "./utils/storage.js";

const form = document.getElementById("login-form");
const msg = document.getElementById("login-msg");


function setMsg(text, kind = "info") {
    if (!msg) return;
    msg.textContent = text;
    msg.className = `form-msg ${kind}`;
}

async function login({ email, password }) {
    const res = await fetch("https://v2.api.noroff.dev/auth/login", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
        const err = data?.errors?.[0]?.message || data?.message || `HTTP ${res.status}`;
        throw new Error(err);
    }
    return data;
}

if (form) { 
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const formData = new FormData(form);
    const email = formData.get("email").trim();
    const password = formData.get("password");

    try {
        const data = await login({ email, password });

        saveUser(data.data);
        setMsg("Logged in! Redirecting...", "success");

        setTimeout(() => {
        location.href = "index.html"; 
        }, 1500);
       
    } catch (err) {
        setMsg(err.message || "Login failed", "error");
    }
});

initPasswordToggleScoped('.password-field');

}
export function initPasswordToggleScoped(fieldSelector) {
    const field = typeof fieldSelector === "string" ? document.querySelector(fieldSelector) : fieldSelector;

    if (!field) return;
    const input = field.querySelector('input[type="password"]');
    const toggle = field.querySelector('.toggle-pw');
    if (!input || !toggle) return;

        const setPwState = (show) => {
            input.type = show ? 'text' : 'password';
            toggle.setAttribute('aria-pressed', String(show));
            toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
            toggle.innerHTML = show 
                ? '<i class="fa-solid fa-eye" aria-hidden="true"></i>'
                : '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>';
        };

        toggle.addEventListener('click', () => {
            setPwState(input.type === 'password');
        });

        setPwState(false);
}


// DEMO login 

document.getElementById("demo-login")

