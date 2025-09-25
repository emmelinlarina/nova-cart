export const SITE = {
    name: "NovaCart",
    logo: {
        header: "images/logo/NovaCart_brown_cropped.png",
        footer: "images/logo/NovaCart_logo_cropped.png", 
        alt: "NovaCart logo",
    },
    address: [
        "789 Shopping Avenue, Suite 101",
        "Selling City, SC 56789",
    ],
    email: "contact@novacart.com",
    phone: "(987) 654-3210",
};

export const NAV = [
    { type: "link", href: "index.html", icon: "fa-solid fa-house", text: "Home", cls: "home-link" },
    { type: "link", href: "login.html", icon: "fa-regular fa-circle-user", text: "Log in", cls: "js-auth-link" },
    { type: "cart", href: "cart.html", icon: "fa-solid fa-cart-shopping", cls: "cart-link" }
];

export const FOOTER_LINKS = [
    { title: "Help and FAQ", items: [
        { text: "Shipping & Returns", href: "#" },
        { text: "Contact us", href: "#" },
        { text: "Products", href: "index.html" },
        { text: "FAQ", href: "#" },
    ]},
];

export const SOCIALS = [
    { icon: "fa-brands fa-discord", href: "#"},
    { icon: "fa-brands fa-instagram", href: "#"},
    { icon: "fa-brands fa-facebook", href: "#"},
    { icon: "fa-brands fa-x-twitter", href: "#"},
]