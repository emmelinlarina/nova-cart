import { saveUser } from "./utils/storage.js";
import { getApp, q } from "./utils/dom.js";
import { showLoader } from "./utils/loader.js";
import { setMsg, clearFieldErrors, fieldError } from "./utils/forms.js";

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
                    <span class="error-msg" aria-live="polite"></span>
                </label>

                <label class="field password-field">
                    <input type="password" name="password" id="login-password" placeholder="Password" required>
                    <button type="button" class="toggle-pw" aria-label="Show Password" aria-pressed="false" title="Show Password">
                        <i class="fa-solid fa-eye"></i> 
                    </button>
                    <span class="error-msg" aria-live="polite"></span>
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

    form.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            const em = input.closest(".field")?.querySelector(".error-msg");
            if (em) { em.textContent = ""; em.style.display = "none"; }
            setMsg("login-msg", "");
        });
    });

    form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFieldErrors(form);
    setMsg("login-msg", "");

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    let hasError = false;
    if (!email) { fieldError(form, "email", "Please enter your email"); hasError = true; }
    if (!password) { fieldError(form, "password", "Please enter your password"); hasError = true; }

    if (hasError) {
        (form.querySelector("input.is-invalid" || form.querySelector("[name=email]"))?.focus());
        return;
    }

    
    form.querySelectorAll("input, button").forEach(el => el.setAttribute("disabled", "true"));

    try {
        const data = await login({email, password });
        saveUser(data.data);
        setMsg("login-msg", "Logged in! Redirecting...", "success");
        setTimeout(() => { location.href = "index.html";}, 900);
    } catch (err) {
        const m = String(err.message || "").toLowerCase();
        if (m.includes("email")) {
            fieldError(form, "email", err.message);
            form.querySelector("[name=email]")?.focus();
        } else if (m.includes("password")) {
            fieldError(form, "password", err.message);
            form.querySelector("[name=password]")?.focus();
        } else {
            fieldError(form, "email", "Check your email or password");
            fieldError(form, "password", "Check your email or password");
            form.querySelector("[name=email]")?.focus();
            setMsg("login-msg", err.message || "Login Failed", "error");
        } 
    
        }finally {
            form.querySelectorAll("input, button").forEach(el => el.removeAttribute("disabled"));
            showLoader(false);
        }
    });
}

(function init() {
    renderLoginShell();
    wireForm();
})();



