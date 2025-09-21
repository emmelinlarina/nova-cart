import { computeTotals } from "../cart.js";

export function makeOrderId() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.floor(Math.random() * 46655).toString(36).toUpperCase();
    return `NC-${t}-${r}`;
}

const KEY = "nc_last_order";

export function writeLastOrder({total, count, email}) {
    const clean = {
        total: Number(total) || 0,
        count: Number(count) || 0, 
        email: String(email || ""),
        ts: Date.now(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(clean));
}

export function readLastOrder() {
    try {
        const snap = JSON.parse(sessionStorage.getItem(KEY) || "{}");
        if (typeof snap.total === "number") return snap;
    } catch {}
    const t = computeTotals() || { pay: 0, count: 0};
    return {
        total: t.pay || 0,
        count: t.count || 0, 
        email: localStorage.getItem("email") || "",
        ts: Date.now(),
    };
}