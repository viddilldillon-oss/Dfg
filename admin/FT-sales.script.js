(function () {
  // ✅ Consistent token key across all admin pages
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "http://127.0.0.1:5500/supa-mart/admin/FT-auth.page.html";
    return;
  }

  // ✅ Define backend API root
  const API_ROOT = localStorage.getItem("API_URL") || "https://dfg-qq0j.onrender.com/api";

  // ✅ Fetch and display all sales
  async function fetchSales() {
    try {
      const res = await fetch(`${API_ROOT}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load sales");

      const sales = Array.isArray(data) ? data : data.sales || [];
      const ordersCount = document.getElementById("ordersCount");
      const totalSales = document.getElementById("totalSales");
      const todaySales = document.getElementById("todaySales");
      const salesList = document.getElementById("salesList");

      // ✅ Clear list before appending
      salesList.innerHTML = "";

      // ✅ Display stats
      ordersCount.textContent = sales.length;

      // ✅ Total sales
      const total = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
      totalSales.textContent = `$${total.toFixed(2)}`;

      // ✅ Today’s sales
      const today = new Date().toDateString();
      const todayTotal = sales
        .filter((s) => new Date(s.createdAt).toDateString() === today)
        .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
      todaySales.textContent = `$${todayTotal.toFixed(2)}`;

      // ✅ Display individual sales
      sales.forEach((s) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${s.customerName || "Walk-in Customer"}</strong>
          — <span style="color:#ffcc00;">$${s.totalPrice?.toFixed(2) || "0.00"}</span>
          (${s.quantity || 0} pcs)
        `;
        li.style.padding = "6px 0";
        li.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        salesList.appendChild(li);
      });
    } catch (err) {
      console.error("❌ Error loading sales:", err);
      alert("Failed to load sales data. Check console for details.");
    }
  }

  // ✅ Handle new sale form submission
  document.getElementById("createSaleForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const product = document.getElementById("saleProductId").value.trim();
    const quantity = parseInt(document.getElementById("saleQty").value, 10);
    const totalPrice = parseFloat(document.getElementById("saleTotal").value);
    const customerName = document.getElementById("saleCustomer").value.trim();

    try {
      const res = await fetch(`${API_ROOT}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product, quantity, totalPrice, customerName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create sale");

      alert("✅ Sale recorded successfully!");
      e.target.reset();
      fetchSales();
    } catch (err) {
      alert(err.message);
    }
  });

  // ✅ Initial load when page is ready
  document.addEventListener("DOMContentLoaded", fetchSales);
})();