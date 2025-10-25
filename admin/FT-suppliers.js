// FT-suppliers.js
(function(){
  const API = localStorage.getItem("API_URL") || "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "FT-auth.page.html";
    return;
  }

  // Elements
  const form = document.getElementById("supplierForm");
  const idEl = document.getElementById("supplierId");
  const nameEl = document.getElementById("sName");
  const productEl = document.getElementById("sProduct");
  const priceEl = document.getElementById("sPrice");
  const contactEl = document.getElementById("sContact");
  const tbody = document.getElementById("suppliersTbody");
  const chartCanvas = document.getElementById("supplierChart");
  let chart;

  // Helpers
  const authHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  function renderTable(list){
    tbody.innerHTML = "";
    list.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.product}</td>
        <td>${Number(s.price || 0).toFixed(2)}</td>
        <td>${s.contact || ""}</td>
        <td>
          <button class="btn-small edit" data-id="${s._id}" data-action="edit">Edit</button>
          <button class="btn-small delete" data-id="${s._id}" data-action="delete">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderChart(list){
    const labels = list.map(s => s.name);
    const data = list.map(s => Number(s.price || 0));
    if (chart) chart.destroy();
    chart = new Chart(chartCanvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Price ($)",
          data,
          backgroundColor: "rgba(255,204,0,.7)",
          borderColor: "rgba(255,204,0,1)",
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,.08)" } },
          y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,.08)" } }
        }
      }
    });
  }

  // API
  async function fetchSuppliers(){
    const res = await fetch(`${API}/suppliers`, { headers: { Authorization: `Bearer ${token}` }});
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load suppliers");
    return data;
  }

  async function createSupplier(payload){
    const res = await fetch(`${API}/suppliers`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create supplier");
    return data;
  }

  async function updateSupplier(id, payload){
    const res = await fetch(`${API}/suppliers/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update supplier");
    return data;
  }

  async function deleteSupplier(id){
    const res = await fetch(`${API}/suppliers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete supplier");
    return data;
  }

  // UI Actions
  async function refresh(){
    try{
      const list = await fetchSuppliers();
      renderTable(list);
      renderChart(list);
    }catch(e){
      console.error(e);
      tbody.innerHTML = `<tr><td colspan="5">Failed to load suppliers.</td></tr>`;
    }
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const payload = {
      name: nameEl.value.trim(),
      product: productEl.value.trim(),
      price: parseFloat(priceEl.value),
      contact: contactEl.value.trim()
    };
    try{
      if (idEl.value){
        await updateSupplier(idEl.value, payload);
      } else {
        await createSupplier(payload);
      }
      form.reset();
      idEl.value = "";
      await refresh();
    }catch(err){
      alert(err.message);
    }
  });

  tbody.addEventListener("click", async (e)=>{
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    if (action === "delete"){
      if (!confirm("Delete this supplier?")) return;
      try{ await deleteSupplier(id); await refresh(); }catch(err){ alert(err.message); }
    } else if (action === "edit"){
      // Fetch current list (already on page), find row values to prefill
      const row = btn.closest("tr").children;
      idEl.value = id;
      nameEl.value = row[0].textContent;
      productEl.value = row[1].textContent;
      priceEl.value = row[2].textContent;
      contactEl.value = row[3].textContent;
      nameEl.focus();
    }
  });

  // Initial load
  refresh();
})();