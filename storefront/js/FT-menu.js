// FT-menu.js — robust menu + correct links
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector("#menuToggle, .menu-btn");
  if (!menuBtn) return;

  let sideMenu = document.querySelector(".side-menu");
  if (!sideMenu) {
    sideMenu = document.createElement("div");
    sideMenu.className = "side-menu";
    sideMenu.innerHTML = `
      <nav>
        <a href="index.html">Home</a>
        <a href="FT-cart.html">Cart</a>
        <a href="FT-checkout.html">Checkout</a>
        <a href="FT-about.html">About</a>
      </nav>
    `;
    document.body.appendChild(sideMenu);
  }

  menuBtn.addEventListener("click", () => {
    sideMenu.classList.toggle("open");
  });
});