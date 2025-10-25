// FT-cart.js — Supa Dillie-Cious Mart (final working version)
const CART_KEY = "supa_cart";

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});

// ========== CART HELPERS ==========
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

function cartTotals() {
  const cart = readCart();
  const subtotal = cart.reduce((sum, i) => sum + (Number(i.price) * Number(i.qty)), 0);
  const tax = 0;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function money(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

function updateCartBadge() {
  const badgeEls = document.querySelectorAll("#cartCount, .cart-count");
  const count = readCart().reduce((s, i) => s + (Number(i.qty) || 0), 0);
  badgeEls.forEach(el => el.textContent = count);
}

// ========== MAIN RENDER ==========
function renderCart() {
  const cart = readCart();
  const body = document.querySelector("#cartTable tbody");
  const empty = document.getElementById("cartEmpty");
  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("tax");
  const totalEl = document.getElementById("total");

  if (!body || !subtotalEl || !taxEl || !totalEl) return;

  // ✅ Update totals immediately
  const { subtotal, tax, total } = cartTotals();
  subtotalEl.textContent = money(subtotal);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(total);

  body.innerHTML = "";

  // ✅ Empty state
  if (!cart.length) {
    empty.style.display = "block";
    document.getElementById("cartTable").style.display = "none";
    return;
  }

  empty.style.display = "none";
  document.getElementById("cartTable").style.display = "table";

  // ✅ Populate rows
  cart.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${money(item.price)}</td>
      <td>
        <input type="number" min="1" value="${item.qty}"
          data-id="${item._id}"
          class="qty"
          style="width:60px;text-align:center;border:1px solid #ccc;border-radius:6px;">
      </td>
      <td class="item-total">${money(item.price * item.qty)}</td>
      <td><button class="btn" data-remove="${item._id}">Remove</button></td>
    `;
    body.appendChild(tr);
  });

  updateCartBadge();

  // ✅ Handle quantity change
  body.querySelectorAll("input.qty").forEach(input => {
    input.addEventListener("change", e => {
      const id = e.target.getAttribute("data-id");
      const newQty = parseInt(e.target.value, 10);
      setQty(id, newQty);
      renderCart(); // Refresh totals
    });
  });

  // ✅ Handle remove
  body.querySelectorAll("button[data-remove]").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.getAttribute("data-remove");
      removeFromCart(id);
      renderCart();
    });
  });
}