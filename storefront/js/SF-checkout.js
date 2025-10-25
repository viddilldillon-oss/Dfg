// SF-checkout.js — storefront/
const CART_KEY = "supa_cart";

// Multiple initialization strategies to ensure it runs
(function() {
  let initialized = false;
  
  function initCheckout() {
    if (initialized) {
      console.log("⚠️ Already initialized, skipping");
      return;
    }
    initialized = true;
    console.log("✅ Checkout page initialized");
    
    // Update total display
    updateCheckoutTotal();
    
    // Attach form submission handler
    setupFormHandler();
  }
  
  // Strategy 1: DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initCheckout);
  } else {
    // Strategy 2: DOM already ready
    initCheckout();
  }
  
  // Strategy 3: Fallback after 100ms
  setTimeout(initCheckout, 100);
})();

function updateCheckoutTotal() {
  console.log("📊 updateCheckoutTotal() called");
  
  // Get cart items
  const cartData = localStorage.getItem(CART_KEY);
  console.log("🔍 Raw cart data from localStorage:", cartData);
  
  const items = JSON.parse(cartData || "[]");
  console.log("📦 Parsed cart items:", items);
  console.log("📊 Number of items:", items.length);
  
  // Calculate total
  const total = items.reduce((sum, item) => {
    const itemTotal = item.price * item.qty;
    console.log(`  - ${item.name}: $${item.price} × ${item.qty} = $${itemTotal.toFixed(2)}`);
    return sum + itemTotal;
  }, 0);
  console.log("💰 Calculated total:", total);
  
  // Update the input field
  const totalInput = document.getElementById("total");
  console.log("🎯 Total input element:", totalInput);
  
  if (totalInput) {
    const formattedTotal = `$${total.toFixed(2)}`;
    totalInput.value = formattedTotal;
    console.log("✅ Total updated to:", formattedTotal);
  } else {
    console.error("❌ Could not find element with id='total'");
  }
}

function setupFormHandler() {
  const checkoutForm = document.getElementById("checkoutForm");
  
  if (!checkoutForm) {
    console.error("❌ Could not find checkout form");
    return;
  }
  
  // Prevent duplicate handlers
  if (checkoutForm.dataset.handlerAttached === "true") {
    console.log("⚠️ Handler already attached, skipping");
    return;
  }
  
  checkoutForm.dataset.handlerAttached = "true";
  console.log("✅ Checkout form found, attaching submit handler");
  
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // 👈 Prevents page reload
    e.stopPropagation(); // 👈 Stops event from bubbling
    e.stopImmediatePropagation(); // 👈 Stops all other handlers
    
    console.log("🚀 Form submit handler triggered");
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    console.log("📋 Form data:", { name, email, phone, address });

    const items = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!items.length) {
      alert("Your cart is empty!");
      return;
    }

    console.log("🛒 Cart items:", items);
    console.log("📤 Sending request to /api/checkout...");

    try {
      const response = await fetch("https://dfg-qq0j.onrender.com/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: address,
        }),
      });

      console.log("📥 Response status:", response.status);

      const session = await response.json();
      console.log("📦 Session data:", session);

      if (session.url) {
        // TODO: Replace with Clover integration endpoint
        console.log("TODO: Replace with Clover integration endpoint");
        window.location.href = session.url; // Redirect to success page
      } else {
        console.error("❌ No URL in session:", session);
        alert("Could not create checkout session.");
      }
    } catch (error) {
      console.error("❌ Checkout error:", error);
      alert("Error: " + error.message);
    }
  });
}