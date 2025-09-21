export const q = (id) => document.getElementById(id);

export function getApp() {
    let el = document.getElementById("app");
    if (!el) {
        el = document.createElement("main");
        el.id = "app";
        document.body.insertBefore(el, document.getElementById("site-footer") || null);
    }
    return el;
}

export const getQueryParam = (name, search = location.search) => 
    new URLSearchParams(search).get(name);