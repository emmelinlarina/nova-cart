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
                    <span class="error-msg" id="err-name" aria-live="polite"></span>
                </label>

                <label class="field">
                    <input type="email" name="email" placeholder="Email" required>
                    <span class="error-msg" id="err-email" aria-live="polite"></span>
                </label>

                <label class="field password-field">
                    
                    <input type="password" name="password" id="register-password" placeholder="Password" minlength="3"
                        required>
                    <button type="button" class="toggle-pw" aria-label="Show Password" aria-pressed="false"
                        title="Show Password"> <i class="fa-solid fa-eye"></i> </button>
                </label>

                <span class="error-msg" id="err-password" aria-live="polite"></span>
                <button class="btn btn-primary" type="submit">Sign up</button>
                <p class="form-msg" id="register-msg" aria-live="polite"></p>
            </form>
        </section>

        <p class="auth-switch">
            Already have an account?
            <a href="login.html">Log in</a>
        </p>
    </main>
    `;
}

function clearAllFieldErrors(form) {
    form.querySelectorAll(".error-msg").forEach(el => { 
        el.textContent = "";
        el.style.display = "none"; 
    });
    form.querySelectorAll("input").forEach(i => i.classList.remove("is-invalid"));
}

function setFieldError(form, name, text) {
    const input = form.querySelector(`input[name="${name}"]`);

    let errEl = input?.closest(".field")?.querySelector(".error-msg");
    if (!errEl && input) {
        errEl = document.createElement("span");
        errEl.className = "error-msg";
        errEl.setAttribute("aria-live", "polite");
        input.insertAdjacentElement("afterend", errEl);
    }
    if (input) input.classList.add("is-invalid");
    if (errEl) {
        errEl.textContent = text;
        errEl.style.display = "block";
    }
}

function wireForm() {
    const form = q("register-form");
    if (!form) return;

    form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
        input.classList.remove("is-invalid");
        const errEl = input.closest(".field")?.querySelector(".error-msg") || input.nextElementSibling;
        if (errEl && errEl.classList.contains("error-msg")) {
            errEl.textContent = "";
            errEl.style.display = "none";
        }
    });
});

initPasswordToggleScoped('.password-field');

const submitBtn = q("register-submit");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllFieldErrors(form);
    setMsg("");
    showLoader(true);
    if (submitBtn) submitBtn.disabled = true;
    form.querySelectorAll("input, button").forEach((el) => el.setAttribute("disabled", "true"));

    const formData = new FormData(form);
    const name = (formData.get("name") || "").trim();
    const email = (formData.get("email")|| "").trim();
    const password = formData.get("password") || "";

    let clientHasErrors = false;
    if (name.length < 3) {
        setFieldError(form, "name", "Name must be at least 3 characters");
        clientHasErrors = true;
    }
    if (!email.includes("@")) {
        setFieldError(form, "email", "Please enter valid email");
        clientHasErrors = true;
    }
    if (name.length < 3) {
        setFieldError(form, "name", "Name must be at least 3 characters");
        clientHasErrors = true;
    }
    if (password.length < 3) {
        setFieldError(form, "password", "Password must be at least 3 characters");
        clientHasErrors = true;
    }
    if (clientHasErrors) {
        setMsg("Please fix the hightlighted fields", "error");
        if (submitBtn) submitBtn.disabled = false;
        form.querySelectorAll("input, button").forEach((el) => el.removeAttribute("disabled"));
        showLoader(false);
        return;
    }

    try {
        const data = await register({ name, email, password });
        saveUser(data.data);
        setMsg("Account created! Redirecting...", "success");
        setTimeout(() => {
            location.href = "index.html";
        }, 1500);
    } catch (err) {
        const m = String(err?.message || "").toLowerCase();
        if (m. includes("name")) setFieldError(form, "name", err.message);
        else if (m. includes("email")) setFieldError(form, "email", err.message);
        else if (m. includes("password")) setFieldError(form, "password", err.message);
        else setMsg(err.message || "Registration Failed", "error");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        form.querySelectorAll("input, button").forEach((el) => el.removeAttribute("disabled"));
        showLoader(false);
        }
    });

}


(function init() {
    renderRegisterShell();
    wireForm();
})();