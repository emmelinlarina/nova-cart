# Nova Cart

#### Project Exam 1 - Frontend Development

### Nova Cart is a fictional e-commerce platform built as my project exam for the Frontend Development 1 course at Noroff.

This project simulates a real online shopping experience where users can browse products, view details, register, login, and purchase items. It is designed to demonstrate my ability to plan, design, and develop a complete fontend web application connected to a live API.

**The goal of the project is to create a responsive web application where users can:**

- Browse products in a clean and modern interface.
- View detailed information about each product, including reviews and discounts.
- Register and log in to their own account.
- Add products to a cart (when logged in), adjust quantities, and proceed to checkout.
- See a confirmation page after a successful purchase.

**Brand Story**

Nova Cart is a modern, stylish online store that brings together everyday essentials and unique finds. With a playful yet professional brand identity, Nova Cart aims to make online shopping simple, fast, and enjoyable. The clean design and intuitive interface focus on usability, while maintaining a friendly personality that sets it apart from generic e-commerce sites.

## Links:

- GitHub repo: (link here)
- Live site (GitHub Pages): (link here)
- Figma style guide & prototypes: (link here)
- GitHub Projects board: (link here)

## Admin / Test user:

    You can use your own Noroff email and password for using the login feature

    Example:

    Email: studentname123@noroff.stud.no
    Password: 123456

## Features:

**Product Feed (index.html):**

- Interactive carousel with 3 featured products (looping, prev/next controls).
- Grid with the 12 latest products.
- Clickable product thumbnails -> product details.

**Product Page (product.html):**

- Displays title, description, price, discounted price, rating, reviews, and tags.
- "Buy button" only visible if logged in.
- "Share button" copies the product URL to the clipboard.

**Authentication (login.html), (register.html):**

- Validated login form, saves token and user info.
- Creates new account with validation + feedback (success/error).

**Cart (cart.html):**

- Displays all products added to the cart with quantity and total price.
- Increase/decrease product quantity, remove items, clear the cart.
- Proceed to checkout.

**Checkout (checkout.html):**

- Shows the items you are buying and total price.
- Submits to success page.

**Success (success.html)**

- Confirmation message after completing the checkout.
- Takes you back to the home page.

## User stories

- As a visitor, I want to see a product feed so I can browse available items.
- As a visitor, I want to view detailed information about a product so I can decide if I’m interested.
- As a visitor, I want to register for an account so I can log in and make purchases.
- As a user, I want to log in securely so I can access my account and buy products.
- As a user, I want to add products to a cart so I can review them before checkout.
- As a user, I want to update or remove items in the cart so I can control what I buy.
- As a user, I want to see the total price of my cart so I know how much I’ll pay.
- As a user, I want to complete a checkout form so I can “finalize” my order.
- As a user, I want to see a success confirmation page so I know the purchase went through

## Technologies

- HTML
- CSS
- JavaScript
- Noroff API (https://v2.api.noroff.dev)
- GitHub Pages for deployment

## Design and Planning

- Figma Style Guide: logo, color palette, typography, button states, cards, forms.
- Prototypes: Desktop and Mobile high-fidelity wireframes.
- Project Management (kanban): GitHub Projects board with tasks, roadmap, and deadlines.

## Learning Outcomes Covered

- Planned and documented the project using GitHub Projects + Figma.
- Designed and implemented a responsive UI in HTML and CSS.
- Fetched and displayed data from Noroff API.
- Implemented login, register, and cart functionality in JS.
- Validated forms with error/success feedback.
- Deployed the site using GitHub Pages.
- Tested HTML, CSS, SEO, and a11y with online tools.
