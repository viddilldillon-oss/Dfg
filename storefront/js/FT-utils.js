// FT-utils.js
// =============================
// Shared cart + money helpers for Supa Dillie-Cious Mart
// Works across storefront pages (cart, checkout, products)
// =============================

const CART_KEY = "supa_cart";

// ----- CART CORE -----
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

function addToCart(item) {
  const cart = readCart();
  const idx = cart.findIndex(i => i._id === item._id);
  if (idx >= 0) {
    cart[idx].qty += item.qty || 1;
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  writeCart(cart);
}

function removeFromCart(id) {
  writeCart(readCart().filter(i => i._id !== id));
}

function setQty(id, qty) {
  const cart = readCart();
  const it = cart.find(i => i._id === id);
  if (it) {
    it.qty = Math.max(1, qty);
    writeCart(cart);
  }
}

// ----- CALCULATIONS -----
function cartTotals() {
  const cart = readCart();
  const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const tax = subtotal * 0.0; // adjust if you want tax later
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function money(n) {
  return `$${(n || 0).toFixed(2)}`;
}

// ----- CART BADGE -----
function updateCartBadge() {
  const badgeEls = document.querySelectorAll("#cartCount, .cart-count");
  const count = readCart().reduce((s, i) => s + i.qty, 0);
  badgeEls.forEach(el => el.textContent = count);
}

// ----- AUTO INIT -----
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});

// ----- EXPORTS (for debugging or modular use) -----
window.CartUtils = {
  readCart,
  writeCart,
  addToCart,
  removeFromCart,
  setQty,
  cartTotals,
  money,
  updateCartBadge
};