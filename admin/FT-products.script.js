(function () {
  // ✅ Use the same token key across all pages
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect back to login through Live Server
    window.location.href = "http://127.0.0.1:5500/supa-mart/admin/FT-auth.page.html";
    return;
  }

  // ✅ Define backend API root (always the Express server)
  const API_ROOT = "http://localhost:5000/api";

  // ✅ Fetch and display all products
  async function fetchProducts() {
    try {
      const res = await fetch(`${API_ROOT}/products`);
      const data = await res.json();

      const list = document.getElementById("productsContainer");
      list.innerHTML = "";

      if (!Array.isArray(data) || !data.length) {
        list.innerHTML = `<p style="color:#ffcc00;">No products found.</p>`;
        return;
      }

      data.forEach((p) => {
        const li = document.createElement("li");

        // ✅ Handle both Cloudinary URLs and local uploads
        let imgSrc = "";
        if (p.imageUrl) {
          imgSrc = p.imageUrl.startsWith("http")
            ? p.imageUrl
            : `${API_ROOT.replace("/api", "")}${p.imageUrl}`;
        }

        li.innerHTML = `
          <h3>${p.name}</h3>
          <p><strong>Price:</strong> $${p.price}</p>
          <p>${p.description || ""}</p>
          ${imgSrc
            ? `<img src="${imgSrc}" alt="${p.name}" width="150" style="border:1px solid #ffcc00; border-radius:8px; margin-top:8px;" />`
            : ""}
          <br>
          <button data-id="${p._id}" class="delete-btn" 
            style="background:#ffcc00; color:#000; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; margin-top:10px;">
            Delete
          </button>
        `;

        list.appendChild(li);
      });

      // ✅ Delete button handlers
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Are you sure you want to delete this product?")) {
            try {
              const res = await fetch(`${API_ROOT}/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (!res.ok)
                throw new Error(data.message || "Failed to delete product");
              await fetchProducts(); // refresh after deletion
            } catch (err) {
              alert(err.message);
            }
          }
        });
      });
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  }

  // ✅ Add Product Form Handler
  document
    .getElementById("addProductForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("pName").value.trim();
      const price = parseFloat(document.getElementById("pPrice").value);
      const description = document.getElementById("pDesc").value.trim();
      const image = document.getElementById("pImage").files[0];

      const form = new FormData();
      form.append("name", name);
      form.append("price", price);
      form.append("description", description);
      if (image) form.append("image", image);

      try {
        const res = await fetch(`${API_ROOT}/products`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create product");

        alert("✅ Product added successfully!");
        await fetchProducts();
        e.target.reset();
      } catch (err) {
        alert(err.message);
      }
    });

  // ✅ Initial load
  document.addEventListener("DOMContentLoaded", fetchProducts);
})();