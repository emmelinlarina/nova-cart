export function setMsg(elOrId, text, kind = "info") {
    const el = typeof elOrId === "string" ? document.getElementById(elOrId) : elOrId;
    if (!el) return;
    el.textContent = text;
    el.className = `form-msg ${kind}`;
}

export function clearFieldErrors(form) {
    if (!form) return;
    form.querySelectorAll(".error-msg").forEach((el) => { el.textContent = ""; el.style.display = "none"; });
    form.querySelectorAll("input").forEach((i) => i.classList.remove("is-invalid"));
}

export function fieldError(form, name, text) {
    const input = form.querySelector(`input[name="${name}"]`) || form[name];
    if (!input) return;
    input.classList.add("is-invalid");
    const err = input.nextElementSibling;
    if (err && err.classList.contains("error-msg")) {
        err.textContent = text;
        err.style.display = "block";
    }
}

export function prefillEmail(form) {
    try {
        const savedEmail = localStorage.getItem("email");
        if (savedEmail) form.querySelector('input[name="email"]').value = savedEmail;
    } catch {}
}