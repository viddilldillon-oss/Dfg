// FT-products.js
// Frontend Storefront Product Loader + Cart Handler (Fixed + Synced)

const API_URL = localStorage.getItem("API_URL") || "http://localhost:5000/api"; 

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productGrid");
  const searchBox = document.getElementById("searchBox");
  const clearBtn = document.getElementById("clearSearch");
  const resultsCount = document.getElementById("resultsCount");

  let allProducts = [];

  init();

  // ========== INITIALIZE ==========
  async function init() {
    updateCartBadge?.();
    allProducts = await loadProducts();
    render(allProducts);

    // ✅ Live Search
    searchBox?.addEventListener("input", () => {
      const q = searchBox.value.trim().toLowerCase();
      const filtered = q
        ? allProducts.filter(
            (p) =>
              (p.name || "").toLowerCase().includes(q) ||
              (p.description || "").toLowerCase().includes(q)
          )
        : allProducts;
      render(filtered);
    });

    // ✅ Clear Search
    clearBtn?.addEventListener("click", () => {
      searchBox.value = "";
      render(allProducts);
      searchBox.focus();
    });
  }

  // ========== LOAD PRODUCTS FROM BACKEND ==========
  async function loadProducts() {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const data = await res.json();
      console.log("✅ Products loaded:", data);

      // ✅ Handle possible null/undefined backend responses
      if (!data || typeof data !== "object") return [];
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.products)) return data.products;

      return [];
    } catch (e) {
      console.error("❌ Failed to load products:", e);
      grid.innerHTML = `<div class="card">⚠️ Unable to connect to backend.</div>`;
      return [];
    }
  }

  // ========== IMAGE FALLBACK ==========
  function imgSrcFor(p) {
    if (!p.imageUrl) return "";
    return p.imageUrl.startsWith("http")
      ? p.imageUrl
      : `http://localhost:5000${p.imageUrl}`;
  }

  // ========== RENDER PRODUCTS ==========
  function render(list) {
    grid.innerHTML = "";
    resultsCount.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;

    if (!list.length) {
      grid.innerHTML = `<div class="card">No products found.</div>`;
      return;
    }

    list.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      const img = imgSrcFor(p);
      const price = Number(p.price || 0);
      const productId = p._id || p.id;

      // Default unit type and quantity
      let currentUnit = p.unitType || "quantity";
      let currentQty = 1;

      card.innerHTML = `
        ${
          img
            ? `<img class="product-img" src="${img}" alt="${p.name}">`
            : `<div class="product-img" style="display:flex;align-items:center;justify-content:center;color:#999">No image</div>`
        }
        <div class="title">${p.name || "Unnamed Product"}</div>
        <div class="muted">${p.description || ""}</div>
        <div class="price" data-price="${price}">$${price.toFixed(2)}</div>
        
        <!-- Unit Toggle -->
        <div class="unit-switch">
          <button class="unit-btn ${currentUnit === 'quantity' ? 'active' : ''}" data-unit="quantity">Qty</button>
          <button class="unit-btn ${currentUnit === 'pounds' ? 'active' : ''}" data-unit="pounds">Per lb</button>
        </div>
        
        <!-- Quantity Controls -->
        <div class="qty-row">
          <div class="stepper">
            <button class="minus-btn">−</button>
            <input type="number" class="qty-input" value="1" min="0.1" step="0.1" />
            <button class="plus-btn">+</button>
          </div>
          <span class="unit-label">${currentUnit === 'quantity' ? 'items' : 'lbs'}</span>
        </div>
        
        <button class="btn primary add-to-cart-btn">Add to Cart</button>
      `;

      // Get elements
      const unitBtns = card.querySelectorAll(".unit-btn");
      const qtyInput = card.querySelector(".qty-input");
      const minusBtn = card.querySelector(".minus-btn");
      const plusBtn = card.querySelector(".plus-btn");
      const unitLabel = card.querySelector(".unit-label");
      const priceDisplay = card.querySelector(".price");
      const addBtn = card.querySelector(".add-to-cart-btn");

      // Unit toggle functionality
      unitBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          unitBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentUnit = btn.dataset.unit;
          unitLabel.textContent = currentUnit === "quantity" ? "items" : "lbs";
          
          // Update step for pounds
          if (currentUnit === "pounds") {
            qtyInput.step = "0.1";
            qtyInput.value = "1.0";
          } else {
            qtyInput.step = "1";
            qtyInput.value = "1";
          }
          currentQty = parseFloat(qtyInput.value);
          updatePrice();
        });
      });

      // Quantity controls
      minusBtn.addEventListener("click", () => {
        const step = currentUnit === "pounds" ? 0.1 : 1;
        const min = currentUnit === "pounds" ? 0.1 : 1;
        currentQty = Math.max(min, parseFloat(qtyInput.value) - step);
        qtyInput.value = currentUnit === "pounds" ? currentQty.toFixed(1) : Math.floor(currentQty);
        updatePrice();
      });

      plusBtn.addEventListener("click", () => {
        const step = currentUnit === "pounds" ? 0.1 : 1;
        currentQty = parseFloat(qtyInput.value) + step;
        qtyInput.value = currentUnit === "pounds" ? currentQty.toFixed(1) : Math.floor(currentQty);
        updatePrice();
      });

      qtyInput.addEventListener("input", () => {
        currentQty = parseFloat(qtyInput.value) || (currentUnit === "pounds" ? 0.1 : 1);
        updatePrice();
      });

      function updatePrice() {
        const totalPrice = price * currentQty;
        priceDisplay.textContent = `$${totalPrice.toFixed(2)}`;
      }

      // Add to cart functionality
      addBtn.addEventListener("click", () => {
        addToCart?.({
          _id: productId,
          name: p.name || "Unnamed Product",
          price: price,
          qty: currentQty,
          unitType: currentUnit,
          imageUrl: p.imageUrl
        });
        updateCartBadge?.();

        const old = addBtn.textContent;
        addBtn.textContent = "Added ✓";
        setTimeout(() => (addBtn.textContent = old), 900);
      });

      grid.appendChild(card);
    });
  }
});