import { saveUser } from "./utils/storage.js";

const form = document.getElementById("register-form");
const msg = document.getElementById("register-msg");

function clearAllFieldErrors() {
    form.querySelectorAll(".error-msg").forEach(el => { el.textContent = ""; el.style.display = "none"; });
    form.querySelectorAll("input").forEach(i => i.classList.remove("is-invalid"));
}

function setFieldError(name, text) {
    const input = form.querySelector(`input[name="${name}"]`);
    const errEl = input?.nextElementSibling;
    if (input) input.classList.add("is-invalid");
    if (errEl && errEl.classList.contains("error-msg")) {
        errEl.textContent = text;
        errEl.style.display = "block";
    }
}

function setMsg(text, kind = "info") {
    if (!msg) return;
    msg.textContent = text;
    msg.className = `form-msg ${kind}`;
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

form.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
        input.classList.remove("is-invalid");
        const errEl = input.nextElementSibling;
        if (errEl && errEl.classList.contains("error-msg")) {
            errEl.textContent = "";
            errEl.style.display = "none";
        }
    });
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("Creating account...");

    const formData = new FormData(form);
    const name = (formData.get("name") || "").trim();
    const email = (formData.get("email")|| "").trim();
    const password = formData.get("password") || "";

    try {
        const reponse = await register({ name, email, password });

        const payload = reponse?.data ?? Response;
        saveUser(payload);

        setMsg("Account created! Redirecting...", "success");
        location.href = "index.html";
    } catch (err) {
        const msg = (err.message || "").toLowerCase();

        if (msg.includes("name")) {
          setFieldError("name", err.message);
        } else if (msg.includes("email")) {
            setFieldError("email", err.message); 
        } else if (msg.includes("password")) {
            setFieldError("password", err.message);
        } else {

            setFieldError("password", err.message || "Registration failed");
        }
    }
});