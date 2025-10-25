(function () {
  const API_ROOT = localStorage.getItem("API_URL") || "https://dfg-qq0j.onrender.com/api";

  // Authentication Check
  async function verifyAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "FT-auth.page.html";
      return;
    }

    try {
      // Use a lightweight endpoint like /stats to verify the token
      const res = await fetch(`${API_ROOT}/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { // Unauthorized or Forbidden
        localStorage.removeItem("token");
        window.location.href = "FT-auth.page.html";
      }
    } catch (err) {
      console.error("Auth verification failed, likely server is down.", err);
    }
  }

  function countTo(el, target, prefix = "") {
    if (!el) return;
    const start = 0, dur = 800, t0 = performance.now();
    function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const val = Math.round(start + (target - start) * p);
      el.textContent = prefix ? `${prefix}${val.toLocaleString()}` : val.toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setBar(barEl, pct) {
    if (!barEl) return;
    barEl.style.height = Math.max(0, Math.min(100, pct)) + "%";
  }

  let chart;
  function renderChart(labels, salesData, ordersData) {
    const ctx = document.getElementById("overviewChart");
    if (!ctx) return;
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { type: "bar", label: "Sales", data: salesData, backgroundColor: "rgba(96,165,250,.75)", order: 2 },
          { type: "line", label: "Orders", data: ordersData, borderColor: "rgba(249,115,22,1)", fill: false, tension: .35, borderWidth: 2, pointRadius: 3, order: 1 }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 800 },
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,.08)" } },
          y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,.08)" } }
        }
      }
    });
  }

  async function loadStats() {
    let products = 0, users = 0, sales = 0, orders = 0;
    try {
      const sRes = await fetch(`${API_ROOT}/stats`, { cache: 'no-store' });
      const sJson = await sRes.json();
      if (sRes.ok) {
        products = Number(sJson.products || 0);
        users = Number(sJson.users || 0);
        sales = Number(sJson.sales || 0);
      }
    } catch (e) { console.warn("Stats fetch failed", e); }

    try {
      const oRes = await fetch(`${API_ROOT}/orders`);
      const oJson = await oRes.json();
      if (oRes.ok && Array.isArray(oJson)) orders = oJson.length;
    } catch (e) { console.warn("Orders fetch failed", e); }

    countTo(document.getElementById("productsVal"), products);
    countTo(document.getElementById("ordersVal"), orders);
    countTo(document.getElementById("usersVal"), users);

    (function animateDollars() {
      const el = document.getElementById("salesVal");
      if (!el) return;
      const start = 0, end = sales, dur = 800, t0 = performance.now();
      function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        const v = start + (end - start) * p;
        el.textContent = "$" + (v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    })();

    setBar(document.getElementById("barProducts"), (products / Math.max(10, products * 1.2)) * 100);
    setBar(document.getElementById("barOrders"), (orders / Math.max(10, orders * 1.2)) * 100);
    setBar(document.getElementById("barSales"), (sales / Math.max(100, sales * 1.2)) * 100);
    setBar(document.getElementById("barUsers"), (users / Math.max(10, users * 1.2)) * 100);

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = Math.max(1, Math.round(sales / labels.length));
    const salesData = labels.map((_, i) => Math.round(base * (0.8 + Math.sin(i * .9 + .4) * .2 + Math.random() * 0.15)));
    const ordBase = Math.max(1, Math.round(orders / labels.length));
    const ordersData = labels.map((_, i) => Math.max(0, Math.round(ordBase * (0.8 + Math.cos(i * .8 + .6) * .2 + Math.random() * 0.2))));
    renderChart(labels, salesData, ordersData);
  }

  // Socket.IO real-time listener
  try {
    // 🎯 FIX: Explicitly connect to the backend server URL
    const socket = io("https://dfg-qq0j.onrender.com");
    socket.on("connect", () => console.log("🔌 Socket.IO connected to server"));
    socket.on("disconnect", () => console.log("⚠️ Socket.IO disconnected"));
    socket.on("stats_update", (data) => {
      console.log("📡 Real-time stats_update received:", data);
      loadStats(); // Refresh main counters

      // Update Live Feed
      try {
        const list = document.getElementById("salesFeedList");
        if (list) {
          if (list.querySelector('p')) list.innerHTML = ''; // Clear "No recent sales" message
          const entry = document.createElement("div");
          entry.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
          entry.style.padding = "4px 0";
          entry.innerHTML = `
            <span style="color:#ffcc00;">${new Date(data.timestamp).toLocaleTimeString()}</span> —
            <strong>$${(data.total || 0).toFixed(2)}</strong> 
            (${data.count || 0} items, ${(data.type || 'sale').replace('pos_', '').toUpperCase()})
          `;
          list.prepend(entry);
          // Keep only the last 10 entries
          while (list.children.length > 10) {
            list.removeChild(list.lastChild);
          }
        }
      } catch (err) {
        console.warn("⚠️ Live Feed update failed:", err);
      }

      // 🎯 FIX: Refresh sales history table on new sale
      if (typeof loadSalesHistory === 'function') {
        loadSalesHistory(1); // Reload the first page of sales history
      }

      // Update Smart Analytics
      try {
        // 1. Load state from sessionStorage or initialize a new one
        let state = JSON.parse(sessionStorage.getItem('dashboardState')) || { totalCount: 0, totalValue: 0, highest: 0 };

        // 2. Update the state with the new sale data
        state.totalCount += 1;
        state.totalValue += data.total;
        if (data.total > state.highest) state.highest = data.total;

        // 3. Save the updated state back to sessionStorage
        sessionStorage.setItem('dashboardState', JSON.stringify(state));

        const avg = state.totalValue / state.totalCount;
        const now = new Date(data.timestamp).toLocaleTimeString();

        // 4. Update the UI (this part remains the same)
        const dailySalesEl = document.getElementById("dailySales");
        const highestSaleEl = document.getElementById("highestSale");
        const averageSaleEl = document.getElementById("averageSale");
        const lastTransactionEl = document.getElementById("lastTransaction");

        if(dailySalesEl) dailySalesEl.textContent = `Total Sales Today: ${state.totalCount}`;
        if(highestSaleEl) highestSaleEl.textContent = `Highest Sale: $${state.highest.toFixed(2)}`;
        if(averageSaleEl) averageSaleEl.textContent = `Average Sale: $${avg.toFixed(2)}`;
        if(lastTransactionEl) lastTransactionEl.textContent = `Last Transaction: ${now}`;
        console.log("🧠 Smart Analytics Updated", state);
      } catch (err) {
        console.warn("⚠️ Smart Analytics update failed:", err);
      }
    });
  } catch (err) {
    console.error("⚠️ Socket.IO initialization failed:", err);
  }

  // Function to initialize or restore Smart Analytics on page load
  function restoreSmartAnalytics() {
    const state = JSON.parse(sessionStorage.getItem('dashboardState'));
    if (state) {
      const avg = state.totalCount > 0 ? state.totalValue / state.totalCount : 0;
      const dailySalesEl = document.getElementById("dailySales");
      const highestSaleEl = document.getElementById("highestSale");
      const averageSaleEl = document.getElementById("averageSale");

      if(dailySalesEl) dailySalesEl.textContent = `Total Sales Today: ${state.totalCount}`;
      if(highestSaleEl) highestSaleEl.textContent = `Highest Sale: $${state.highest.toFixed(2)}`;
      if(averageSaleEl) averageSaleEl.textContent = `Average Sale: $${avg.toFixed(2)}`;
      // "Last Transaction" is not restored as it's only relevant for live updates.
      console.log("🧠 Smart Analytics restored from session storage.", state);
    }
  }

  // Sales History & Filters
  (function initSalesHistory() {
    let currentPage = 1;
    let currentFilters = {};
    
    const salesTableBody = document.getElementById('salesTableBody');
    const pageInfo = document.getElementById('pageInfo');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const btnApplyFilters = document.getElementById('btnApplyFilters');
    const btnClearFilters = document.getElementById('btnClearFilters');

    async function loadSalesHistory(page = 1) {
      if (!salesTableBody) return;
      salesTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; opacity:0.7;">Loading...</td></tr>`;
      try {
        const params = new URLSearchParams({ page, limit: 10, ...currentFilters });
        const res = await fetch(`${API_ROOT}/pos-sales/history?${params}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Failed to load sales');
        
        renderSalesTable(data.items);
        updatePagination(data);
        currentPage = data.currentPage;
      } catch (err) {
        console.error('❌ Sales history error:', err);
        salesTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#ff6b6b;">Error: ${err.message}</td></tr>`;
      }
    }

    function renderSalesTable(items) {
      if (!items || items.length === 0) {
        salesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; opacity:0.7;">No sales found for the selected filters.</td></tr>';
        return;
      }
      salesTableBody.innerHTML = items.map(sale => `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
          <td style="padding:8px;">${new Date(sale.date).toLocaleString()}</td>
          <td style="padding:8px;">${sale.product?.name || 'N/A'}</td>
          <td style="padding:8px; text-align:center;">${sale.quantity}</td>
          <td style="padding:8px; text-align:right; font-weight:bold;">$${sale.totalPrice.toFixed(2)}</td>
          <td style="padding:8px; text-align:center;">
            <span style="background:${sale.paymentMethod === 'Cash' ? '#4ade80' : '#60a5fa'}; padding:2px 8px; border-radius:4px; font-size:0.8rem; color: #000;">
              ${sale.paymentMethod || 'N/A'}
            </span>
          </td>
        </tr>
      `).join('');
    }

    function updatePagination(data) {
      pageInfo.textContent = `Page ${data.currentPage} of ${data.totalPages}`;
      btnPrevPage.disabled = data.currentPage <= 1;
      btnNextPage.disabled = data.currentPage >= data.totalPages;
      btnPrevPage.style.opacity = btnPrevPage.disabled ? '0.5' : '1';
      btnNextPage.style.opacity = btnNextPage.disabled ? '0.5' : '1';
    }

    btnApplyFilters?.addEventListener('click', () => {
      currentFilters = {};
      const from = document.getElementById('filterFrom').value;
      const to = document.getElementById('filterTo').value;
      const payment = document.getElementById('filterPayment').value;
      const minTotal = document.getElementById('filterMinTotal').value;
      const maxTotal = document.getElementById('filterMaxTotal').value;
      
      if (from) currentFilters.startDate = from;
      if (to) currentFilters.endDate = to;
      if (payment) currentFilters.paymentMethod = payment;
      if (minTotal) currentFilters.minTotal = minTotal;
      if (maxTotal) currentFilters.maxTotal = maxTotal;
      
      loadSalesHistory(1);
    });

    btnClearFilters?.addEventListener('click', () => {
      document.getElementById('filterFrom').value = '';
      document.getElementById('filterTo').value = '';
      document.getElementById('filterPayment').value = '';
      document.getElementById('filterMinTotal').value = '';
      document.getElementById('filterMaxTotal').value = '';
      currentFilters = {};
      loadSalesHistory(1);
    });

    btnPrevPage?.addEventListener('click', () => loadSalesHistory(currentPage - 1));
    btnNextPage?.addEventListener('click', () => loadSalesHistory(currentPage + 1));

    // Initial load
    loadSalesHistory(1);
  })();

  document.addEventListener("DOMContentLoaded", () => {
    verifyAuth(); // Verify user is logged in before doing anything else

    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    menuBtn?.addEventListener("click", () => menu.classList.toggle("show"));
    document.addEventListener("click", (e) => {
      if (menu && !menu.contains(e.target) && !menuBtn?.contains(e.target)) menu.classList.remove("show");
    });

    loadStats();
    restoreSmartAnalytics();
  });
})();