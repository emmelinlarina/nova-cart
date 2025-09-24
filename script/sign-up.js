import { saveUser } from "./utils/storage.js";
import { initPasswordToggleScoped } from "./log-in.js";
import { getApp, q } from "./utils/dom.js";
import { showLoader } from "./utils/loader.js";
import { setMsg } from "./utils/forms.js";


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

function renderRegisterShell() {
    const app = getApp();
    app.innerHTML = `

    <div id="page-loader" class="page-loader" style="display:none">
        <div class="spinner"></div>
    </div>

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
                    <input type="password" name="password" id="register-password" placeholder="Password" minlength="3" required>
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
            <a href="login.html">Log in</a>
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
        
    });
});

const submitBtn = q("register-submit");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFieldStyles(form);
    setMsg("register-msg");
    showLoader(true);
    submitBtn?.setAttribute("disabled", "true");
    form.querySelectorAll("input, button").forEach((el) => el.setAttribute("disabled", "true"));

    const formData = new FormData(form);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email")|| "").toString().trim();
    const password = (formData.get("password") || "").toString();

    let hasErrors = false;
    if (name.length < 3) { markInvalid(form.querySelector('[name="name"]')); hasErrors = true;
    }
    if (!email || !email.includes("@")) { markInvalid(form.querySelector('[name="email"]')); hasErrors = true;
    }
    if (password.length < 3) { markInvalid(form.querySelector('[name="password"]')); hasErrors = true;
    }

    if (hasErrors) {
        setMsg("register-msg", "Please fix the hightlighted fields", "error");
        form.querySelector("input.is-invalid")?.focus();
        submitBtn?.removeAttribute("disabled");
        form.querySelectorAll("input, button").forEach((el) => el.removeAttribute("disabled"));
        showLoader(false);
        return;
    }

    try {
        const data = await register({ name, email, password });
        saveUser(data.data);
        setMsg("register-msg", "Account created! Redirecting...", "success");
        setTimeout(() => {
            location.href = "index.html";
        }, 1500);
    } catch (err) {
        const m = String(err?.message || "");

        if (/name/i.test(m)) markInvalid(form.querySelector('[name="name"]'));
        if (/email/i.test(m))  markInvalid(form.querySelector('[name="email"]'));
        if (/password/i.test(m))  markInvalid(form.querySelector('[name="password"]'));
        if (/name|email|password/i.test(m)) {
            markInvalid(form.querySelector('[name="name"]'));
            markInvalid(form.querySelector('[name="email"]'));
            markInvalid(form.querySelector('[name="password"]'));
        }
        setMsg("register-msg", err.message || "Registration Failed", "error");
        form.querySelector("input.is-invalid")?.focus();
    } finally {
        submitBtn?.removeAttribute("disabled");
            form.querySelectorAll("input, button").forEach(el => el.removeAttribute("disabled"));
            showLoader(false);
        }
    });

}

(function init() {
    renderRegisterShell();
    wireForm();
})();