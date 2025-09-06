import { saveUser } from "./utils/storage.js";

const form = document.getElementById("register-form");
const msg = document.getElementById("register-msg");

function setMsg(text, kind = "info") {
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

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("Creating account...");
    const formData = new FormData(form);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const password = formData.get("password");

    try {
        const data = await register({ name, email, password });

        saveUser(data.data);
        setMsg("Account created! Redirecting...", "success");
        location.href = "index.html";
    } catch (err) {
        setMsg(err.message || "Registration failed", "error");
    }
});