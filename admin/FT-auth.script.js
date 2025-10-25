// FT-auth.script.js
const API_ROOT = localStorage.getItem("API_URL") || "http://localhost:5000/api";

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const errorDiv = document.getElementById("error");
  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    // 1. Provide immediate user feedback
    errorDiv.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    const res = await fetch(`${API_ROOT}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || data.error || "Login failed");

    // ✅ Store token for secure access
    localStorage.setItem("token", data.token);

    // ✅ Redirect to the Live Server layout page (use your real Live Server path)
    // 2. Use a relative path for redirection to make it portable
    window.location.href = "FT-dashboard.page.html";
  } catch (err) {
    // 3. Display error message on the page instead of an alert
    errorDiv.textContent = err.message;
    // Restore button on failure
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});