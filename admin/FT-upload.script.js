(function () {
  // ✅ Unified token handling
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "http://127.0.0.1:5500/supa-mart/admin/FT-auth.page.html";
    return;
  }

  // ✅ Backend API root
  const API_ROOT = localStorage.getItem("API_URL") || "http://localhost:5000/api";

  // Elements
  const fileInput = document.getElementById("uImage");
  const fileInfo = document.getElementById("fileInfo");
  const previewImage = document.getElementById("previewImage");
  const uploadForm = document.getElementById("uploadProductForm");

  // ✅ Live preview handler
  fileInput?.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) {
      fileInfo.textContent = "No file chosen";
      previewImage.style.display = "none";
      return;
    }

    fileInfo.textContent = `Selected: ${file.name}`;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.style.display = "none";
      alert("⚠️ Please select a valid image file (JPG, PNG, or WEBP).");
    }
  });

  // ✅ Upload form submission
  uploadForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("uName").value.trim();
    const price = parseFloat(document.getElementById("uPrice").value);
    const description = document.getElementById("uDesc").value.trim();
    const image = fileInput.files[0];

    if (!name || isNaN(price)) {
      alert("⚠️ Please enter valid product details before uploading.");
      return;
    }

    const form = new FormData();
    form.append("name", name);
    form.append("price", price);
    form.append("description", description);
    if (image) form.append("image", image);

    try {
      const res = await fetch(`${API_ROOT}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      // ✅ Parse safely
      const text = await res.text();
      const data = JSON.parse(text || "{}");

      if (!res.ok) throw new Error(data.message || "Upload failed");

      alert("✅ Product uploaded successfully!");
      console.log("✅ Cloudinary Image URL:", data.product?.imageUrl || "(none)");

      e.target.reset();
      previewImage.style.display = "none";
      fileInfo.textContent = "No file chosen";
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert(err.message || "Something went wrong during upload.");
    }
  });
})();