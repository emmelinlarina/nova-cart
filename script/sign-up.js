import { getToken, saveUser } from "./utils/storage.js";
import { initPasswordToggleScoped } from "./log-in.js";
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

async function register({ name, email, password }) {
    const res = await fetch("https://v2.api.noroff.dev/auth/register", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
        const err = data?.errors?.[0]?.message || data?.message || `HTTP ${res.status}`;
        throw new Error(err);
    }
    return data;
}

async function loginAfterRegister({email, password}) {
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

function renderRegisterShell() {
    const app = getApp();
    const r = normalizeRedirect(getRedirectParam());
    const loginHref = `login.html${r ? `?redirect=${encodeURIComponent(r)}` : ""}`;
    app.innerHTML = `

    <main class="auth auth-1">
        <div class="auth-brand">
            <img src="images/logo/NovaCart_Ring.png" alt="NovaCart Logo" class="auth-logo">
            <h1 class="auth-heading">Register Account</h1>
        </div>

        <section class="auth-card">
            <form id="register-form" class="auth-form" novalidate>
                <label class="field">
                    <input type="text" name="name" placeholder="Name" minlength="3" required>
                </label>

                <label class="field">
                    <input type="email" name="email" placeholder="Email" required>
                </label>

                <label class="field password-field">
                    <input type="password" name="password" id="register-password" placeholder="Password" minlength="8" required>
                    <button type="button" class="toggle-pw" aria-label="Show Password" aria-pressed="false" title="Show Password"> 
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </label>

                <button id="register-submit" class="btn btn-primary" type="submit">Sign up</button>
            </form>
        </section>

        <p class="form-msg" id="register-msg" aria-live="polite"></p>
        <p class="auth-switch">
            Already have an account?
            <a href="${loginHref}">Log in</a>
        </p>
    </main>
    `;
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
    const form = q("register-form");
    if (!form) return;

    initPasswordToggleScoped('.password-field');

    form.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            input.removeAttribute("aria-invalid");
            setMsg("register-msg", "");
        
    });
});

const submitBtn = q("register-submit");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFieldStyles(form);
    setMsg("register-msg", "");
    showLoader(true);
    submitBtn?.setAttribute("disabled", "true");
    form.querySelectorAll("input, button").forEach((el) => el.setAttribute("disabled", "true"));

    const nameEl = form.querySelector('[name="name"]');
    const emailEl = form.querySelector('[name="email"]');
    const passEl = form.querySelector('[name="password"]');

    const name = (nameEl?.value || "").trim();
    const email = (emailEl?.value || "").trim();
    const password = passEl?.value || "";

    const messages = [];
    if (name.length < 3) { 
        markInvalid(form.querySelector('[name="name"]'));
        messages.push("Name must be at least 3 characters");
    }
    if (!email || !email.includes("@")) { 
        markInvalid(form.querySelector('[name="email"]'));
        messages.push("Please enter valid email");
    }
    if (password.length < 8) { 
        markInvalid(form.querySelector('[name="password"]'));
        messages.push("Password must have at least 8 characters");
    }

    if (messages.length) {
        setMsg("register-msg", messages[0], "Please fix the highlighted fields", "error");
        form.querySelector("input.is-invalid")?.focus();
        submitBtn?.removeAttribute("disabled");
        form.querySelectorAll("input, button").forEach((el) => el.removeAttribute("disabled"));
        showLoader(false);
        return;
    }

    try {
        const data = await register({ name, email, password });

        const auth = await loginAfterRegister({email, password});
        saveUser(auth.data)
        setMsg("register-msg", "Account created! Redirecting...", "success");
        const r = normalizeRedirect(getRedirectParam());
            const target = isSafeRedirect(r) ? r : "/index.html";
            setTimeout(() => { location.replace(target); }, 900);

    } catch (err) {
        const raw = String(err?.message || "Registration Failed");
        const lower = raw.toLowerCase();
        let display = raw;
        if (/exist|taken|registered|already|conflict/.test(lower)) {
            display = "Email is already registered"
        } else if (/password/.test(lower) && /short|least|length/.test(lower)) {
            display = "Password must have at least 8 characters"
        } else if (/password/.test(lower)) {
            display = "Password is incorrect";
        }

        setMsg("register-msg", display || "Registration Failed", "error");
        (form.querySelector("input.is-invalid") || form.querySelector('[name="name"]'))?.focus();

    } finally {
        submitBtn?.removeAttribute("disabled");
            form.querySelectorAll("input, button").forEach(el => el.removeAttribute("disabled"));
            showLoader(false);
        }
    });

}

(function init() {
    renderRegisterShell();
    if (getToken()) {
        const r = normalizeRedirect(getRedirectParam());
        const target = isSafeRedirect(r) ? r : "/index.html";
        location.replace(target);
        return;
    }
    wireForm();
})();