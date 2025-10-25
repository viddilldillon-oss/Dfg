// p-ho-pos.js
// Handles product loading, cart management, and checkout actions for Supa Dillie-Cious POS

document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.querySelector('#productGrid');
  const cartBody = document.querySelector('#cartBody');
  const cartCount = document.querySelector('#cartCount');
  const subtotalEl = document.querySelector('#subtotal');
  const taxEl = document.querySelector('#tax');
  const totalEl = document.querySelector('#grandTotal');
  const buttons = document.querySelectorAll('.actions .btn');
  const btnClear = buttons[0];
  const btnUndoLast = buttons[1];
  const btnCash = buttons[2];
  const btnCard = buttons[3];
  
  // Mode switching elements
  const btnMode = document.querySelector('#btnMode');
  const modeText = document.querySelector('#modeText');
  const searchInput = document.querySelector('#searchInput');
  const btnFilters = document.querySelector('#btnFilters');
  const categoryFilters = document.querySelector('#categoryFilters');
  const API_ROOT = localStorage.getItem("API_URL") || "https://dfg-qq0j.onrender.com/api";

  let cart = [];
  let allProducts = [];
  let currentCategory = 'all';
  let inactivityTimer = null;

  // Debug: Check if all elements are found
  console.log('🔍 POS Debug - Element Check:');
  console.log('productGrid:', productGrid);
  console.log('cartBody:', cartBody);
  console.log('btnClear:', btnClear);
  console.log('btnUndoLast:', btnUndoLast);
  console.log('btnCash:', btnCash);
  console.log('btnCard:', btnCard);
  console.log('btnMode:', btnMode);
  console.log('btnFilters:', btnFilters);
  console.log('searchInput:', searchInput);
  
  // Test button functionality
  function testButtonFunctionality() {
    console.log('🧪 Testing button functionality...');
    
    const buttonsToTest = [
      { name: 'Clear', element: btnClear },
      { name: 'Undo Last', element: btnUndoLast },
      { name: 'Cash', element: btnCash },
      { name: 'Card', element: btnCard },
      { name: 'Mode', element: btnMode },
      { name: 'Filters', element: btnFilters }
    ];
    
    buttonsToTest.forEach(({ name, element }) => {
      if (element) {
        console.log(`✅ ${name} button found and ready`);
      } else {
        console.error(`❌ ${name} button NOT FOUND`);
      }
    });
  }

  // Mode Management - Updated for 3 Visual Themes
  function getMode() {
    return localStorage.getItem('posMode') || 'sales';
  }
  
  function setMode(mode) {
    localStorage.setItem('posMode', mode);
    
    // Add transition class for smooth mode switching
    document.body.classList.add('mode-transition');
    setTimeout(() => document.body.classList.remove('mode-transition'), 600);
    
    document.body.className = `mode-${mode}`;
    modeText.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    
    // Update mode indicator emoji and description
    const modeConfig = { 
      sales: { emoji: '🟢', desc: 'Sales' },
      checkout: { emoji: '💰', desc: 'Checkout' },
      admin: { emoji: '⚙️', desc: 'Admin' }
    };
    const config = modeConfig[mode];
    document.querySelector('#modeIndicator').innerHTML = `${config.emoji} Mode: <span id="modeText">${config.desc}</span>`;
    
    // Update header title based on mode
    const titleText = {
      sales: 'POS — Sales Mode',
      checkout: 'POS — Checkout Mode', 
      admin: 'POS — Admin & Reports'
    };
    document.querySelector('.title').textContent = titleText[mode];
  }
  
  function cycleMode() {
    const modes = ['sales', 'checkout', 'admin'];
    const current = getMode();
    const nextIndex = (modes.indexOf(current) + 1) % modes.length;
    setMode(modes[nextIndex]);
  }
  
  // Admin mode activity tracking (similar to old hybrid mode)
  function resetInactivityTimer() {
    if (getMode() !== 'admin') return;
    
    clearTimeout(inactivityTimer);
    document.body.classList.add('scanning');
    
    inactivityTimer = setTimeout(() => {
      document.body.classList.remove('scanning');
    }, 10000); // 10 seconds
  }

  // Load products from backend
  async function loadProducts() {
    try {
      console.log('📦 Loading products from backend...');
      const res = await fetch(`${API_ROOT}/products`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const products = await res.json();
      allProducts = products;
      console.log('✅ Products loaded:', products.length, 'items');
      
      // Extract unique categories
      const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
      renderCategoryFilters(categories);
      
      filterAndRenderProducts();
    } catch (err) {
      console.error('❌ Failed to load products:', err);
      
      // Show fallback products for testing when backend is down
      allProducts = [
        { _id: '1', name: 'Test Item 1', price: 10.99, category: 'Test' },
        { _id: '2', name: 'Test Item 2', price: 15.50, category: 'Test' }
      ];
      
      const categories = ['all', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
      renderCategoryFilters(categories);
      filterAndRenderProducts();
      
      console.log('🔄 Using fallback test products');
    }
  }
  
  // Render category filter buttons
  function renderCategoryFilters(categories) {
    categoryFilters.innerHTML = categories.map(cat => 
      `<button class="btn ghost ${cat === 'all' ? 'active' : ''}" data-category="${cat}">${cat === 'all' ? 'All' : cat}</button>`
    ).join('');
    
    categoryFilters.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        categoryFilters.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAndRenderProducts();
      });
    });
  }
  
  // Filter and render products based on search and category
  function filterAndRenderProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filtered = allProducts;
    
    // Filter by category
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        (p.barcode && p.barcode.includes(searchTerm)) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm))
      );
    }
    
    renderProducts(filtered);
  }

  // Render product cards into the grid
  function renderProducts(products) {
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
      productGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;opacity:.5;">No products found</div>';
      return;
    }
    
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product';
      card.innerHTML = `
        <div class="img" style="background-image: url('${p.imageUrl || 'assets/bg-placeholder.jpg'}')"></div>
        <div class="name" style="text-shadow:1px 1px 2px rgba(0,0,0,.8)">${p.name}</div>
        <div class="price" style="text-shadow:1px 1px 2px rgba(0,0,0,.8)">$${p.price.toFixed(2)}</div>
        <button class="btn ghost">Add</button>
      `;
      
      // Enhanced button event listener - specifically handle admin mode click issues
      const addButton = card.querySelector('.btn');
      addButton.addEventListener('click', (e) => {
        console.log(`Add button clicked for: ${p.name} (Mode: ${getMode()})`);
        
        // Ensure the click event is properly handled in admin mode
        e.stopPropagation();
        e.preventDefault();
        
        addToCart(p);
      });
      
      // Admin mode fix: Ensure button has higher z-index to be above ::before overlay
      if (getMode() === 'admin') {
        addButton.style.position = 'relative';
        addButton.style.zIndex = '10';
      }
      
      productGrid.appendChild(card);
    });
  }

  // Add product to cart
  function addToCart(product) {
    console.log(`🛒 Adding to cart: ${product.name} (Price: $${product.price}) - Mode: ${getMode()}`);
    
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      existing.qty += 1;
      console.log(`📦 Updated quantity for ${product.name}: ${existing.qty}`);
    } else {
      cart.push({ ...product, qty: 1 });
      console.log(`✅ Added new item to cart: ${product.name}`);
    }
    renderCart();
  }

  // Render cart items
  function renderCart() {
    cartBody.innerHTML = '';
    let subtotal = 0;
    let itemCount = 0;
    
    if (cart.length === 0) {
      cartBody.innerHTML = '<tr><td>—</td><td>0</td><td class="right">$0.00</td><td class="right">$0.00</td></tr>';
    } else {
      cart.forEach(item => {
        subtotal += item.price * item.qty;
        itemCount += item.qty;
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td class="right">$${item.price.toFixed(2)}</td>
          <td class="right">$${(item.price * item.qty).toFixed(2)}</td>
        `;
        cartBody.appendChild(row);
      });
    }
    
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + tax;
    
    cartCount.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
    
    // Update floating totals bar for Sales mode
    updateFloatingTotals(total);
  }
  
  // Update floating totals bar
  function updateFloatingTotals(total) {
    const floatingTotalEl = document.querySelector('#floatingTotal');
    if (floatingTotalEl) {
      floatingTotalEl.textContent = `$${total.toFixed(2)}`;
      
      // Add pulse animation for new additions
      floatingTotalEl.style.animation = 'none';
      setTimeout(() => {
        floatingTotalEl.style.animation = 'pulse 0.3s ease';
      }, 10);
    }
  }

  // Record sale to database
  async function recordSale(items, total, paymentType) {
    try {
      console.log('🛒 POS: Attempting to record sale...');
      console.log('📦 Payload:', { items, total, paymentType });
      
      const response = await fetch(`${API_ROOT}/pos-sales/sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total, paymentType })
      });
      
      console.log('📡 Response status:', response.status);
      
      const sale = await response.json();
      console.log('✅ Sale recorded:', sale);
      return sale;
    } catch (err) {
      console.error('❌ Failed to record sale:', err);
      return null;
    }
  }

  // Show receipt popup
  function showReceipt(items, subtotal, tax, total, paymentType) {
    const receiptHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;" id="receiptPopup">
        <div style="background:#000;color:#fff;padding:30px;border:2px solid #ffd700;border-radius:10px;max-width:400px;width:90%;font-family:monospace;">
          <h2 style="text-align:center;color:#ffd700;margin:0 0 20px 0;">RECEIPT</h2>
          <div style="border-bottom:1px solid #666;margin-bottom:15px;padding-bottom:15px;">
            ${items.map(item => `
              <div style="display:flex;justify-content:space-between;margin:5px 0;">
                <span>${item.name} x${item.qty}</span>
                <span>$${(item.price * item.qty).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div style="margin:10px 0;">
            <div style="display:flex;justify-content:space-between;">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span>Tax (7%):</span>
              <span>$${tax.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:1.2em;margin-top:10px;padding-top:10px;border-top:1px solid #666;">
              <span>TOTAL:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
          <div style="text-align:center;margin:15px 0;padding:10px 0;border-top:1px solid #666;">
            <div>Payment: ${paymentType}</div>
            <div style="margin-top:5px;opacity:0.7;">${new Date().toLocaleString()}</div>
          </div>
          <button onclick="document.getElementById('receiptPopup').remove()" style="width:100%;padding:12px;background:#ffd700;color:#000;border:none;border-radius:5px;font-weight:bold;cursor:pointer;margin-top:10px;">Close</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', receiptHTML);
  }

  // Handle buttons
  btnClear?.addEventListener('click', () => {
    console.log('Clear button clicked');
    cart = [];
    renderCart();
  });
  
  btnCash?.addEventListener('click', async () => {
    console.log('Cash button clicked');
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    // Calculate total
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.qty;
    });
    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    
    console.log('Cash payment processing:', { subtotal, tax, total });
    
    // Record sale
    const saleItems = cart.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      qty: item.qty
    }));
    
    await recordSale(saleItems, total, 'Cash');
    
    // Show receipt
    showReceipt(cart, subtotal, tax, total, 'Cash');
    
    // Clear cart
    cart = [];
    renderCart();
  });
  
  btnCard?.addEventListener('click', async () => {
    console.log('Card button clicked');
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    try {
      // Calculate total
      let subtotal = 0;
      cart.forEach(item => {
        subtotal += item.price * item.qty;
      });
      const tax = subtotal * 0.07;
      const total = subtotal + tax;
      
      console.log('Card payment processing:', { subtotal, tax, total });
      
      // Show processing message
      const originalText = btnCard.textContent;
      btnCard.textContent = 'Processing...';
      btnCard.disabled = true;
      
      // Create PaymentIntent
      const response = await fetch(`${API_ROOT}/terminal/payment_intents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: 'cad',
          description: 'POS Sale',
          metadata: { source: 'pos-system' }
        })
      });
      
      const data = await response.json();
      
      if (data.client_secret) {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Record sale
        const saleItems = cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty
        }));
        
        await recordSale(saleItems, total, 'Card');
        
        // Show receipt
        showReceipt(cart, subtotal, tax, total, 'Card');
        
        // Clear cart
        cart = [];
        renderCart();
      } else {
        alert('❌ Payment failed: ' + (data.error || 'Unknown error'));
      }
      
      btnCard.textContent = originalText;
      btnCard.disabled = false;
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Payment failed: ' + err.message);
      btnCard.textContent = 'Card';
      btnCard.disabled = false;
    }
  });
  
  btnUndoLast?.addEventListener('click', () => {
    console.log('Undo Last button clicked');
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    // Target the last added item in the cart
    const lastItem = cart[cart.length - 1];
    if (!lastItem) {
      console.warn('⚠️ No last item found for undo.');
      return;
    }

    // If item has more than 1 quantity, subtract one
    if (lastItem.qty > 1) {
      lastItem.qty -= 1;
      console.log(`🧷 Undo: reverted last action for ${lastItem.name} (–1 qty)`);
    } else {
      // If only one left, remove it completely
      console.log(`🧷 Undo: removed ${lastItem.name} completely from cart`);
      cart.pop();
    }

    renderCart();
  });
  
  // Mode button
  btnMode?.addEventListener('click', () => {
    console.log('Mode button clicked');
    cycleMode();
  });
  
  // Search input
  searchInput?.addEventListener('input', () => {
    console.log('Search input changed');
    filterAndRenderProducts();
  });
  
  // Search on barcode scan (enter key)
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed in search');
    }
  });
  
  // Filter button toggle
  btnFilters?.addEventListener('click', () => {
    console.log('Filters button clicked');
    const isVisible = categoryFilters.style.display !== 'none';
    categoryFilters.style.display = isVisible ? 'none' : 'flex';
  });
  
  // Initialize first
  console.log('🚀 Initializing POS system...');
  testButtonFunctionality();
  setMode(getMode());
  loadProducts();
  
  // Floating checkout button (Sales mode) - attach after DOM is fully ready
  setTimeout(() => {
    const floatingCheckoutBtn = document.querySelector('#floatingCheckout');
    if (floatingCheckoutBtn) {
      floatingCheckoutBtn.addEventListener('click', () => {
        console.log('Floating Checkout button clicked');
        if (cart.length === 0) {
          alert('Cart is empty!');
          return;
        }
        
        // Switch to checkout mode for payment processing
        setMode('checkout');
        
        // Focus on the payment section
        const cartSection = document.querySelector('section:last-child');
        if (cartSection) {
          cartSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      console.warn('Floating checkout button not found');
    }
  }, 100);

  // Clock functionality from p-ho-script.js
  (function(){
    function pad(n){ return String(n).padStart(2,'0'); }
    function tick(){
      const now = new Date();
      const h = pad(now.getHours()), m = pad(now.getMinutes());
      const wdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const time = `${h}:${m}`;
      const date = `${wdays[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
      const tEl=document.getElementById('time'), dEl=document.getElementById('date');
      if(tEl) tEl.textContent=time;
      if(dEl) dEl.textContent=date;
    }
    tick(); setInterval(tick, 1000);
  })();
});