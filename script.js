/* ============================================================
   CMYH — shared site script
   - Mobile nav
   - Reveal-on-scroll
   - Lightbox for galleries
   - Stat counters
   - Cart drawer
   - Brand loader
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Smooth page transitions (fade-out on leave) ----------
     Lets the browser handle navigation natively (works in Instagram/Facebook
     in-app browsers), just adds the fade class on the way out. View Transitions
     API handles the fade in Chrome 126+ via CSS; this is the fallback. */
  function initPageTransitions() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const url = link.getAttribute('href');
      if (!url) return;
      if (link.target === '_blank') return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      if (
        url.startsWith('#') ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('javascript:')
      ) return;
      // Same-origin internal navigation — just trigger the fade, let browser navigate
      document.body.classList.add('is-leaving');
    });
  }

  /* ---------- Mobile nav ---------- */
  function initNav() {
    const nav = document.querySelector('.nav');
    const btn = document.querySelector('.nav-mobile-btn');
    if (btn && nav) {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.querySelectorAll('.nav-links a').forEach((a) =>
        a.addEventListener('click', () => {
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        })
      );
    }
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.05 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Stat counters ---------- */
  function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const dur = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) {
      nums.forEach(animate);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    });
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    const tiles = document.querySelectorAll('[data-lightbox]');
    if (!tiles.length) return;
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <div class="lightbox-nav prev"><button aria-label="Previous">&lsaquo;</button></div>
      <div class="lightbox-nav next"><button aria-label="Next">&rsaquo;</button></div>
      <img alt="">
    `;
    document.body.appendChild(lb);
    const img = lb.querySelector('img');
    const close = lb.querySelector('.lightbox-close');
    const prev = lb.querySelector('.lightbox-nav.prev button');
    const next = lb.querySelector('.lightbox-nav.next button');
    const srcs = Array.from(tiles).map((t) => t.dataset.lightbox);
    let i = 0;
    const show = (idx) => {
      i = (idx + srcs.length) % srcs.length;
      img.src = srcs[i];
    };
    tiles.forEach((t, idx) =>
      t.addEventListener('click', () => {
        lb.classList.add('open');
        show(idx);
      })
    );
    close.addEventListener('click', () => lb.classList.remove('open'));
    prev.addEventListener('click', () => show(i - 1));
    next.addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', (e) => {
      if (e.target === lb) lb.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  /* ---------- Brand loader (CMYH splash) ---------- */
  function initLoader() {
    // Only show on first load of a session — skip on internal navigation
    if (sessionStorage.getItem('cmyh.loaded')) return;
    sessionStorage.setItem('cmyh.loaded', '1');

    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <div class="loader-logo">
        <span class="ll-cm">CM</span><span class="ll-yh">YH</span><sup class="ll-tm">&#8482;</sup>
      </div>
      <div class="loader-bar"><span></span></div>
    `;
    document.documentElement.appendChild(loader);

    const hide = () => {
      loader.classList.add('loader-out');
      setTimeout(() => loader.remove(), 600);
    };
    // Hide after window load OR 1.6s ceiling, whichever first
    const minVisible = 1100;
    const t0 = performance.now();
    const ready = () => {
      const elapsed = performance.now() - t0;
      const wait = Math.max(0, minVisible - elapsed);
      setTimeout(hide, wait);
    };
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    setTimeout(hide, 2400); // hard ceiling — never hang
  }

  /* ---------- Inject a11y scaffolding (skip-link, <main>, aria on decorative SVGs) ---------- */
  function initA11y() {
    // Skip link
    if (!document.querySelector('.skip-link')) {
      const skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = '#main';
      skip.textContent = 'Skip to content';
      skip.setAttribute('data-en', 'Skip to content');
      skip.setAttribute('data-ar', 'تخطَّ إلى المحتوى');
      document.body.insertBefore(skip, document.body.firstChild);
    }
    // Wrap content between nav and footer in <main>
    if (!document.getElementById('main')) {
      const nav = document.querySelector('.nav');
      const footer = document.querySelector('.footer');
      if (nav && footer) {
        const main = document.createElement('main');
        main.id = 'main';
        main.tabIndex = -1;
        let cur = nav.nextSibling;
        const between = [];
        while (cur && cur !== footer) {
          between.push(cur);
          cur = cur.nextSibling;
        }
        nav.parentNode.insertBefore(main, footer);
        between.forEach((n) => main.appendChild(n));
      }
    }
    // Mark decorative SVGs as aria-hidden (SVGs inside elements that already have accessible text)
    document.querySelectorAll('svg').forEach((svg) => {
      if (!svg.hasAttribute('aria-hidden') && !svg.hasAttribute('aria-label') && !svg.hasAttribute('role')) {
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
      }
    });
    // aria-live on stat counters
    document.querySelectorAll('[data-count]').forEach((el) => {
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('role', 'status');
    });
  }

  /* ============================================================
     CART (localStorage-backed e-commerce)
     ============================================================ */
  const CART_KEY = 'cmyh.cart';

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCart();
    renderCount();
    window.dispatchEvent(new Event('cmyh:cart:update'));
  }
  function cartCount() { return readCart().reduce((s, i) => s + i.qty, 0); }
  function cartTotal() { return readCart().reduce((s, i) => s + i.price * i.qty, 0); }

  function addToCart(item) {
    const items = readCart();
    const existing = items.find((i) => i.id === item.id);
    if (existing) existing.qty += item.qty || 1;
    else items.push({ ...item, qty: item.qty || 1 });
    writeCart(items);
    openCart();
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [item.id],
        content_name: item.name,
        content_type: 'product',
        value: (item.price || 0) * (item.qty || 1),
        currency: 'EGP'
      });
    }
  }
  function removeFromCart(id) {
    writeCart(readCart().filter((i) => i.id !== id));
  }
  function updateQty(id, qty) {
    const items = readCart();
    const it = items.find((i) => i.id === id);
    if (!it) return;
    it.qty = Math.max(1, qty);
    writeCart(items);
  }
  function clearCart() { writeCart([]); }

  // expose for inline product cards
  window.CMYH = { addToCart, removeFromCart, updateQty, readCart, writeCart, cartCount, cartTotal, clearCart, openCart, closeCart };

  function renderCount() {
    const count = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
  }

  function renderCart() {
    const wrap = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const emptyEl = document.getElementById('cart-empty');
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (!wrap) return;
    const items = readCart();
    wrap.innerHTML = '';
    if (!items.length) {
      if (emptyEl) emptyEl.style.display = '';
      if (checkoutBtn) checkoutBtn.style.display = 'none';
      if (totalEl) totalEl.textContent = '0';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = '';
    items.forEach((it) => {
      const li = document.createElement('div');
      li.className = 'cart-line';
      li.innerHTML = `
        <div class="cart-line-info">
          <div class="cart-line-name">${it.name}</div>
          <div class="cart-line-meta">${it.duration} · ${it.price} EGP</div>
        </div>
        <div class="cart-line-actions">
          <button data-qty-down aria-label="Decrease quantity">−</button>
          <span class="cart-line-qty">${it.qty}</span>
          <button data-qty-up aria-label="Increase quantity">+</button>
          <button data-remove aria-label="Remove">&times;</button>
        </div>
        <div class="cart-line-total">${(it.price * it.qty).toLocaleString()} EGP</div>
      `;
      li.querySelector('[data-qty-down]').addEventListener('click', () => updateQty(it.id, it.qty - 1));
      li.querySelector('[data-qty-up]').addEventListener('click', () => updateQty(it.id, it.qty + 1));
      li.querySelector('[data-remove]').addEventListener('click', () => removeFromCart(it.id));
      wrap.appendChild(li);
    });
    if (totalEl) totalEl.textContent = cartTotal().toLocaleString();
  }

  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }
  }
  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  }

  function initCartDrawer() {
    if (document.getElementById('cart-drawer')) return;
    const drawer = document.createElement('aside');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-label', 'Shopping cart');
    drawer.innerHTML = `
      <div class="cart-drawer-backdrop"></div>
      <div class="cart-drawer-panel" role="dialog" aria-modal="true">
        <header class="cart-drawer-head">
          <h2 data-en="Your Cart" data-ar="السلة">Your Cart</h2>
          <button class="cart-drawer-close" aria-label="Close cart">&times;</button>
        </header>
        <div id="cart-items" class="cart-items"></div>
        <p id="cart-empty" class="cart-empty" data-en="Your cart is empty. Pick a plan to get started." data-ar="السلة فاضية. اختار خطة وابدأ.">Your cart is empty. Pick a plan to get started.</p>
        <footer class="cart-drawer-foot">
          <div class="cart-total-row">
            <span class="cart-total-label" data-en="Total" data-ar="الإجمالي">Total</span>
            <span class="cart-total-amount"><span id="cart-total">0</span> EGP</span>
          </div>
          <a href="checkout.html" id="cart-checkout-btn" class="btn btn-primary" style="justify-content:center; width:100%;">
            <span data-en="Checkout" data-ar="إتمام الطلب">Checkout</span>
          </a>
        </footer>
      </div>
    `;
    document.body.appendChild(drawer);
    drawer.querySelector('.cart-drawer-backdrop').addEventListener('click', closeCart);
    drawer.querySelector('.cart-drawer-close').addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart();
    });
    renderCart();
  }

  function initCartTriggers() {
    // Cart icon in nav opens drawer
    document.querySelectorAll('[data-cart-open]').forEach((el) => {
      el.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    });
    // Product card add-to-cart buttons (data-add-to-cart on the BUTTON, data-* on the product CARD)
    document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('[data-product]');
        if (!card) return;
        addToCart({
          id: card.dataset.product,
          name: card.dataset.name,
          duration: card.dataset.duration,
          price: parseInt(card.dataset.price, 10),
          qty: 1,
        });
      });
    });
  }

  /* ============================================================
     BEFORE / AFTER SLIDER
     drag + touch + idle auto-animate (left-right ping-pong)
     ============================================================ */
  function initBaSlider(el) {
    if (el.__baInit) return;
    el.__baInit = true;

    const before = el.querySelector('.ba-img-before');
    const handle = el.querySelector('.ba-handle');
    if (!before || !handle) return;

    let pos = 50;          // 0..100 — percentage from the left visible
    let dragging = false;
    let lastInteract = 0;
    let rafId = null;
    let autoDir = 1;
    let autoOn = false;
    let inView = false;

    const setPos = (p) => {
      pos = Math.max(0, Math.min(100, p));
      before.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
      handle.style.left = pos + '%';
    };
    setPos(50);

    const xFromEvent = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      return (x / rect.width) * 100;
    };

    const startDrag = (e) => {
      dragging = true;
      autoOn = false;
      lastInteract = performance.now();
      setPos(xFromEvent(e));
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      setPos(xFromEvent(e));
    };
    const stopDrag = () => {
      dragging = false;
      lastInteract = performance.now();
    };

    el.addEventListener('mousedown', startDrag);
    el.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);

    // Auto-animate ping-pong when idle + in view
    const IDLE_MS = 1800;
    const SPEED = 0.18; // % per frame at 60fps
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (dragging) return;
      const idle = performance.now() - lastInteract > IDLE_MS;
      if (!idle || !inView) { autoOn = false; return; }
      autoOn = true;
      const next = pos + SPEED * autoDir;
      if (next >= 95) { autoDir = -1; setPos(95); return; }
      if (next <= 5) { autoDir = 1; setPos(5); return; }
      setPos(next);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting && entry.intersectionRatio > 0.3;
        });
      }, { threshold: [0, 0.3, 0.6] });
      io.observe(el);
    } else {
      inView = true;
    }
    rafId = requestAnimationFrame(tick);

    // Cleanup hook (if needed)
    el.__baCleanup = () => { cancelAnimationFrame(rafId); };
  }

  function initBaSliders(root) {
    (root || document).querySelectorAll('.ba-slider').forEach(initBaSlider);
  }
  window.CMYH = Object.assign(window.CMYH || {}, { initBaSliders });

  /* ---------- Override Lightbox to support before/after slider tiles ---------- */
  function initBaLightbox() {
    const tiles = document.querySelectorAll('[data-ba-pair]');
    if (!tiles.length) return;
    const lb = document.createElement('div');
    lb.className = 'lightbox ba-lightbox';
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <div class="lightbox-nav prev"><button aria-label="Previous">&lsaquo;</button></div>
      <div class="lightbox-nav next"><button aria-label="Next">&rsaquo;</button></div>
      <div class="ba-slider ba-slider-hero" id="ba-lightbox-slider">
        <img class="ba-img-after" alt="">
        <img class="ba-img-before" alt="">
        <span class="ba-label before" data-en="Before" data-ar="قبل">Before</span>
        <span class="ba-label after" data-en="After" data-ar="بعد">After</span>
        <div class="ba-handle" aria-hidden="true"></div>
      </div>
    `;
    document.body.appendChild(lb);
    const slider = lb.querySelector('.ba-slider');
    const imgAfter = lb.querySelector('.ba-img-after');
    const imgBefore = lb.querySelector('.ba-img-before');
    const close = lb.querySelector('.lightbox-close');
    const prev = lb.querySelector('.lightbox-nav.prev button');
    const next = lb.querySelector('.lightbox-nav.next button');
    const pairs = Array.from(tiles).map((t) => ({
      before: t.dataset.baBefore,
      after: t.dataset.baAfter
    }));
    let i = 0;
    const show = (idx) => {
      i = (idx + pairs.length) % pairs.length;
      imgAfter.src = pairs[i].after;
      imgBefore.src = pairs[i].before;
      // Re-init slider on each new image
      slider.__baInit = false;
      initBaSlider(slider);
    };
    tiles.forEach((t, idx) =>
      t.addEventListener('click', () => {
        lb.classList.add('open');
        show(idx);
      })
    );
    close.addEventListener('click', () => lb.classList.remove('open'));
    prev.addEventListener('click', () => show(i - 1));
    next.addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', (e) => {
      if (e.target === lb) lb.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initA11y();
    initCartDrawer();
    initCartTriggers();
    renderCount();
    initBaSliders();
    initBaLightbox();
    initNav();
    initReveal();
    initCounters();
    initLightbox();

    // Mark the active nav link based on current path
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });

    // Page-leave fade
    initPageTransitions();
  });
})();
