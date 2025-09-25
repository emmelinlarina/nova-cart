import { getToken, saveUser } from "./utils/storage.js";
import { getApp, q } from "./utils/dom.js";
import { showLoader } from "./utils/loader.js";
import { setMsg } from "./utils/forms.js";

function getRedirectParam() {
    const params = new URLSearchParams(location.search);
    return params.get("redirect")
}

function isSafeRedirect(url) {
    return typeof url === "string" && url.startsWith("/");
}

function normalizeRedirect(r) {
    if (!r) return null;
    return r.startsWith("/") ? r : `/${r}`;
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

function renderLoginShell() {
    const app = getApp();
    const r = normalizeRedirect(getRedirectParam());
    const registerHref = `register.html${r ? `?redirect=${encodeURIComponent(r)}` : ""}`;
    app.innerHTML = `

    <section class="auth auth-1">
        <div class="auth-brand">
            <img src="images/logo/NovaCart_Ring.png" alt="NovaCart Logo" class="auth-logo">
            <h1 class="auth-heading" id="login-heading">Welcome Back!</h1>
        </div>

        <section class="auth-card">
            <form id="login-form" class="auth-form" novalidate>
                <label class="field ">
                <span class="visually-hidden">Email</span>
                    <input type="email" name="email" placeholder="Email" autocomplete="email" required>
                </label>

                <label class="field password-field">
                <span class="visually-hidden">Password</span>
                    <input type="password" name="password" id="login-password" placeholder="Password" required>
                    <button type="button" class="toggle-pw" aria-label="Show Password" aria-pressed="false" title="Show Password">
                        <i class="fa-solid fa-eye"></i> 
                    </button>
                </label>

                <button id="login-submit" class="btn btn-primary" type="submit">Log in</button>
            </form>
        </section>

        <p class="form-msg" id="login-msg" aria-live="polite"></p>
        <p class="auth-switch">
            Don't have an account?
            <a href="${registerHref}">Register here</a>
        </p>
    </section>
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

function clearFieldStyles(form) {
    form.querySelectorAll("input").forEach((i) => { 
        i.classList.remove("is-invalid");
        i.removeAttribute("aria-invalid");
    });
}

function markInvalid(input) {
    if (!input) return;
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
}

function wireForm() {
    const form = q("login-form");
    if (!form) return;

    initPasswordToggleScoped(".password-field");

    form.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            input.removeAttribute("aria-invalid");
            setMsg("login-msg", "");
        });
    });

    const submitBtn = q("login-submit");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        clearFieldStyles(form);
        setMsg("login-msg", "");

        const emailEl = form.querySelector('[name="email"]');
        const passEl = form.querySelector('[name="password"]');
        const email = (emailEl?.value || "").trim();
        const password = (passEl?.value || "");

        const messages = [];
            if (!email || !email.includes("@")) { 
                markInvalid(emailEl);
                messages.push("Please enter valid email");
            }
            if (password.length < 8) { 
                markInvalid(passEl);
                messages.push("Please enter your password");
            }

            if (messages.length) {
                setMsg("login-msg", messages[0], "error");
                form.querySelector("input.is-invalid")?.focus();
                submitBtn?.removeAttribute("disabled");
                form.querySelectorAll("input, button").forEach((el) => el.removeAttribute("disabled"));
                showLoader(false);
                return;
            }

            submitBtn?.setAttribute("disabled", "true");
            form.querySelectorAll("input, button").forEach(el => el.setAttribute("disabled", "true"));

            let success = false;

        try {
            const data = await login({email, password });
            saveUser(data.data);

            success = true;
            setMsg("login-msg", "Logged in! Redirecting...", "success");
            showLoader(true);
            const r = normalizeRedirect(getRedirectParam());
            const target = isSafeRedirect(r) ? r : "/index.html";
            setTimeout(() => { location.replace(target); }, 900);

        } catch (err) {
            const raw = String(err?.message || "Login Failed");
            const lower = raw.toLowerCase();

            const emailBad = /email/.test(lower);
            const passBad = /password/.test(lower);

            if (emailBad) markInvalid(emailEl);
            if (passBad) markInvalid(passEl);
            if (!emailBad && !passBad) {
                markInvalid(emailEl);
                markInvalid(passEl);
            }

            let display = raw;
            if (/exist|taken|registered|already|conflict/.test(lower)) {
                display = "Email is already registered"
            } else if (/password/.test(lower) && /short|least|length/.test(lower)) {
                display = "Password must have at least 3 characters"
            } else if (/password/.test(lower)) {
                display = "Password is incorrect";
            }

            setMsg("login-msg", "error");
            (form.querySelector("input.is-invalid") || form.querySelector('[name="name"]'))?.focus();

        } finally {
            submitBtn?.removeAttribute("disabled");
                form.querySelectorAll("input, button").forEach(el => el.removeAttribute("disabled"));
                showLoader(false);
            }
    });
}

(function init() {
    renderLoginShell();
    if (getToken()) {
        const r = normalizeRedirect(getRedirectParam());
        const target = isSafeRedirect(r) ? r : "/index.html";
        location.replace(target);
        return;
    }
    wireForm();
})();



