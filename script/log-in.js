import { saveUser } from "./utils/storage.js";
import { q } from "./utils/dom.js";


function getApp() {
    let el = document.getElementById("app");
    if (!el) {
        el = document.createElement("main");
        el.id = "app";
        document.body.insertBefore(el, document.getElementById("site-footer") || null);
    }
    return el;
}

function setMsg(text, kind = "info") {
    const el = q("login-msg");
    if (!el) return;
    el.textContent = text;
    el.className = `form-msg ${kind}`;
}

function showLoader(show) {
    const loader = q("page-loader");
    if (!loader) return;
    loader.style.display = show ? 'grid' : 'none';
    document.body.classList.toggle("loading", show)
}

function renderLoginShell() {
    const app = getApp();
    app.innerHTML = `

    <div id="page-loader" class="page-loader" style="display:none">
        <div class="spinner"></div>
    </div>

    <main class="auth auth-1">
        <div class="auth-brand">
            <img src="images/logo/NovaCart_Ring.png" alt="NovaCart Logo" class="auth-logo">
            <h1 class="auth-heading">Welcome Back!</h1>
        </div>

        <section class="auth-card">
            <form id="login-form" class="auth-form" novalidate>
                <label class="field ">
                    <input type="email" name="email" placeholder="Email" autocomplete="email" required>
                </label>

                <label class="field password-field">
                    <input type="password" name="password" id="login-password" placeholder="Password" required>
                    <button type="button" class="toggle-pw" aria-label="Show Password" aria-pressed="false" title="Show Password">
                        <i class="fa-solid fa-eye"></i> </button>
                </label>

                <button class="btn btn-primary" type="submit">Log in</button>
            </form>
        </section>

        <p class="form-msg" id="login-msg" aria-live="polite"></p>
        <p class="auth-switch">
            Don't have an account?
            <a href="register.html">Register here</a>
        </p>
    </main>
    `;
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

        toggle.addEventListener('click', () => setPwState(input.type === 'password'));
        setPwState(false);
}

function wireForm() {
    const form = q("login-form");
    if (!form) return;

    initPasswordToggleScoped(".password-field");

    form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");
    

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
        const data = await login({email, password });
        saveUser(data.data);
        setMsg("Logged in! Redirecting...", "success");
        setTimeout(() => { location.href = "index.html";}, 900);
    } catch (err) {
        setMsg(err.message || "Login Failed", "error");
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
        form.querySelectorAll("input, button").forEach(el => el.removeAttribute("disabled"));
    } finally {
        showLoader(false);
    }
    });
}



(function init() {
    renderLoginShell();
    wireForm();
})();



