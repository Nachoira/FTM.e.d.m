/* ============================================================
   FTM.e.d.m — CARRITO DE PEDIDOS
   ============================================================
   Permite acumular productos y enviar el pedido por WhatsApp.
   No requiere ninguna configuración adicional.
   ============================================================ */

const WA_NUMBER = '5493865740042';

// ── Estado del carrito ──────────────────────────────────────
let cart = [];

// ── Referencias al DOM ──────────────────────────────────────
const cartBtn     = document.getElementById('cartBtn');
const cartCount   = document.getElementById('cartCount');
const cartDrawer  = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose   = document.getElementById('cartClose');
const cartItems   = document.getElementById('cartItems');
const cartSend    = document.getElementById('cartSend');
const cartClear   = document.getElementById('cartClear');

// ── Abrir / cerrar carrito ───────────────────────────────────
function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ── Agregar producto al carrito ──────────────────────────────
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.name;
    const price = btn.dataset.price;

    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    // Feedback visual en el botón
    btn.textContent = '✓ Agregado';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+ Agregar al pedido';
      btn.classList.remove('added');
    }, 1500);

    renderCart();
    openCart();
  });
});

// ── Renderizar items del carrito ─────────────────────────────
function renderCart() {
  // Actualizar contador
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = total;

  // Vaciar contenedor
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Todavía no agregaste productos.</p>';
    cartSend.style.opacity = '0.4';
    cartSend.style.pointerEvents = 'none';
    return;
  }

  cartSend.style.opacity = '1';
  cartSend.style.pointerEvents = 'all';

  cart.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price} c/u</div>
      </div>
      <div class="cart-item-controls">
        <button data-index="${index}" class="qty-minus">−</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button data-index="${index}" class="qty-plus">+</button>
      </div>
    `;
    cartItems.appendChild(el);
  });

  // Botones de cantidad
  cartItems.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      cart[i].qty -= 1;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      renderCart();
    });
  });

  cartItems.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      cart[i].qty += 1;
      renderCart();
    });
  });

  // Armar link de WhatsApp
  buildWhatsAppLink();
}

// ── Armar mensaje de WhatsApp ────────────────────────────────
function buildWhatsAppLink() {
  if (cart.length === 0) return;

  let mensaje = '¡Hola! Me gustaría consultar por los siguientes productos:\n\n';
  cart.forEach(item => {
    mensaje += `• ${item.name} x${item.qty}\n`;
  });
  mensaje += '\n¿Tienen disponibilidad?';

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  cartSend.href = url;
}

// ── Vaciar carrito ───────────────────────────────────────────
cartClear.addEventListener('click', () => {
  cart = [];
  renderCart();
});

// ── Init ─────────────────────────────────────────────────────
renderCart();