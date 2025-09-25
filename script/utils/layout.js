import { SITE, NAV, FOOTER_LINKS, SOCIALS } from "./site.js";

function navItemHTML(item) {
    if (item.type === "cart") {
        return `
        <li>
            <a href="${item.href}" class="${item.cls}" aria-label="Open cart">
                <i class="${item.icon}" aria-hidden="true"></i>
                <span class="js-cart-quantity" aria-live="polite" aria-atomic="true">
                <span class="visually-hidden">Items in cart:
                </span>0</span>
            </a>
        </li>`;
    }
     const isAuth = (item.cls || "").includes("js-auth-link");

        return `
        <li>
            <a href="${item.href}" class="${item.cls || ""}">
                <i class="${item.icon}" aria-hidden="true"></i>
                <span class="${isAuth ? "auth-text" : "nav-text"}">${item.text}</span>
            </a>
        </li>`;
}

export function renderHeader() {
    const root = document.getElementById("site-header");
    if (!root) return;

    root.innerHTML = `
        <nav aria-label="Primary">
            <ul class="navbar">
                <li class="logo">
                    <a href="index.html" aria-label="NovaCart home">
                        <img src="${SITE.logo.header}" alt="${SITE.logo.alt}">
                    </a>
                </li>
        
                <input type="checkbox" id="check" aria-hidden="true" />
                
                <ul class="menu" id="primary-nav" >
                    ${NAV.map(navItemHTML).join("")}
                    <li class="logout-li">
                        <button class="js-logout btn-link" hidden aria-label="Log out">
                            <i class="fa-solid fa-arrow-right-from-bracket" style="color:#000" aria-hidden="true"></i>
                        </button>
                    </li>
                    <li>
                    <label for="check" class="close-menu" role="button" aria-controls="primary-nav" aria-expanded="false" aria-label="Close menu">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </label>
                    </li>
                </ul>
                <label for="check" class="open-menu" role="button" aria-controls="primary-nav" aria-expanded="false" aria-label="Open menu">
                    <i class="fa-solid fa-bars" aria-hidden="true"></i></label>
            </ul>
        </nav>
    `;

    const chk = root.querySelector("#check");
    const open = root.querySelector(".open-menu");
    const close = root.querySelector(".close-menu");
    const sync = () => {
        const ex = chk?.checked ? "true" : "false";
        open?.setAttribute("aria-expanded", ex);
        close?.setAttribute("aria-expanded", ex);
    };
    chk?.addEventListener("change", sync);
    sync();
}

function footerLinksHTML() {
    return FOOTER_LINKS.map(sec => `
        <div class="col">
            <h3><i class="fa-solid fa-question" aria-hidden="true"></i> ${sec.title}</h3>
            <ul>
                ${sec.items.map(i => `<li><a href="${i.href}">${i.text}</a></li>`).join("")}
            </ul>
        </div>
        `).join("");
}

export function renderFooter() {
    const root = document.getElementById("site-footer");
    if (!root) return;
    root.innerHTML = `
        <div class="row">
            <div class="col">
                <img src="${SITE.logo.footer}" alt="${SITE.logo.alt}">
            </div>

            <div class="col">
                <h3><i class="fa-solid fa-map-pin" aria-hidden="true"></i> Visit us</h3>
                ${SITE.address.map(line => `<p>${line}</p>`).join("")}
                <p class="email-id">${SITE.email}</p>
                <h5>Phone: ${SITE.phone}</h5>
            </div>

            ${footerLinksHTML()}

            <div class="col">
                <h3><i class="fa-solid fa-envelope" aria-hidden="true"></i> Newsletter</h3>
                <form>
                    <label for="newsletter-email" class="visually-hidden">Email address</label>
                    <input type="email" id="newsletter-email" name="newsletterEmail"
                        placeholder="Enter your mail here" autocomplete="email" required>
                    <button type="submit" aria-label="Subscribe to newsletter">
                        <i class="fa-solid fa-arrow-right" aria-hidden="true" style="color:#fff;"></i>
                    </button>
                </form>
                <div class="social-icons">
                    ${SOCIALS.map(s => `
                        <a href="${s.href}"><i class="${s.icon}" aria-hidden="true"></i></a>`).join("")}
                </div>
            </div>
        </div>
    `;
}

renderHeader();
renderFooter();