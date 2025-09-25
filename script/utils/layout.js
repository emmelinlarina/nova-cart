import { SITE, NAV, FOOTER_LINKS, SOCIALS } from "./site.js";

function navItemHTML(item) {
    
    if (item.type === "cart") {
        return `
        <li>
            <a href="${item.href}" class="${item.cls}" aria-label="Open cart">
                <i class="${item.icon}"></i>
                <span class="js-cart-quantity" aria-live="polite">0</span>
            </a>
        </li>`;
    }
     const isAuth = (item.cls || "").includes("js-auth-link");

        return `
        <li>
            <a href="${item.href}" class="${item.cls || ""}" aria-label="${item.text}">
                <i class="${item.icon}"></i>
                <span class="${isAuth ? "auth-text" : "nav-text"}">${item.text}</span>
            </a>
        </li>`;
}

export function renderHeader() {
    const root = document.getElementById("site-header");
    if (!root) return;
    root.innerHTML = `
        <nav>
            <ul class="navbar">
                <li class="logo">
                    <a href="index.html">
                        <img src="${SITE.logo.header}" alt="${SITE.logo.alt}">
                    </a>
                    
                </li>
                

                <input type="checkbox" id="check" />
                <span class="menu">
                    ${NAV.map(navItemHTML).join("")}
                    <li class="logout-li">
                        <button class="js-logout btn-link" hidden>
                            <i class="fa-solid fa-arrow-right-from-bracket" style="color:#000"></i>
                        </button>
                    </li>
                    <label for="check" class="close-menu"><i class="fa-solid fa-xmark"></i></label>
                </span>
                <label for="check" class="open-menu"><i class="fa-solid fa-bars"></i></label>
            </ul>
        </nav>
    `;
}

function footerLinksHTML() {
    return FOOTER_LINKS.map(sec => `
        <div class="col">
            <h3><i class="fa-solid fa-question"></i> ${sec.title}</h3>
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
                <h3><i class="fa-solid fa-map-pin"></i> Visit us</h3>
                ${SITE.address.map(line => `<p>${line}</p>`).join("")}
                <p class="email-id">${SITE.email}</p>
                <h5>Phone: ${SITE.phone}</h5>
            </div>

            ${footerLinksHTML()}

            <div class="col">
                <h3><i class="fa-solid fa-envelope"></i> Newsletter</h3>
                <form>
                    <input type="email" id="newsletter-email" name="newsletterEmail"
                        placeholder="Enter your mail here" autocomplete="email" required>
                    <button type="submit">
                        <i class="fa-solid fa-arrow-right" style="color:#fff;"></i>
                    </button>
                </form>
                <div class="social-icons">
                    ${SOCIALS.map(s => `<a href="${s.href}" aria-label="social"><i class="${s.icon}"></i></a>`).join("")}
                </div>
            </div>
        </div>
    `;
}

renderHeader();
renderFooter();