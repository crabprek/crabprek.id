/* ==========================================================================
   CRABPREK — script.js
   Hero canvas · form WhatsApp · jam analog · navigasi & kartu horizontal scroll
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);

  // --------------------------------------------------------------------------
  // 1. HERO CANVAS (bola partikel + kepiting prosedural yang kabur dari sentuhan)
  // --------------------------------------------------------------------------
  const canvas = $('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const COUNT = 110;
    let width = 0, height = 0;
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    let px = -9999, py = -9999;
    let sphereAngle = 0, crabAngle = 0, flee = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      width = canvas.width = r.width;
      height = canvas.height = r.height;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('load', resize);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);

    const point = (x, y) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const r = canvas.getBoundingClientRect();
      px = x - r.left;
      py = y - r.top;
      targetX = (x / window.innerWidth - 0.5) * 2;
      targetY = (y / window.innerHeight - 0.5) * 2;
    };
    const resetPointer = () => { targetX = targetY = 0; px = py = -9999; };

    window.addEventListener('mousemove', (e) => point(e.clientX, e.clientY));
    ['touchstart', 'touchmove'].forEach((ev) =>
      canvas.addEventListener(ev, (e) => {
        if (e.touches.length) point(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true })
    );
    ['touchend', 'touchcancel'].forEach((ev) =>
      canvas.addEventListener(ev, resetPointer, { passive: true })
    );

    const dot = (x, y, r, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCrab = (x, y, scale, leg, scared) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.fillStyle = scared ? '#ff1100' : '#ff3b30';
      ctx.shadowBlur = scared ? 20 : 12;
      ctx.shadowColor = scared ? '#ffb703' : '#ff6b35';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      dot(-6, -13, 3, '#fff');
      dot(6, -13, 3, '#fff');
      dot(-6, -14, 1.5, '#000');
      dot(6, -14, 1.5, '#000');

      ctx.strokeStyle = '#ff3b30';
      ctx.lineWidth = 3.5;
      [-1, 1].forEach((sd) => {
        ctx.beginPath();
        ctx.moveTo(sd * 10, -6);
        ctx.quadraticCurveTo(sd * 18, -16, sd * 12, -20);
        ctx.stroke();
      });

      ctx.lineWidth = 2;
      for (let sd = -1; sd <= 1; sd += 2) {
        for (let i = 0; i < 3; i++) {
          const phase = Math.sin(leg + i * 0.8) * (scared ? 7 : 4);
          const sx = sd * 12, sy = -2 + i * 5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + sd * 10, sy + phase);
          ctx.lineTo(sx + sd * 14, sy + 8 + phase);
          ctx.stroke();
        }
      }

      if (scared) {
        ctx.fillStyle = '#ffb703';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('💨 KABUR!', -20, -28);
      }
      ctx.restore();
    };

    const draw = () => {
      requestAnimationFrame(draw);
      if (width < 10 || height < 10) return;
      ctx.clearRect(0, 0, width, height);

      mouseX += (targetX - mouseX) * 0.02;
      mouseY += (targetY - mouseY) * 0.02;

      const boost = Math.min(window.scrollY * 0.0005, 0.002);
      sphereAngle += 0.004 + boost;

      const cx = width / 2 + mouseX * 10;
      const cy = height / 2 + mouseY * 10;
      const R = Math.min(width, height) * 0.32;

      const crabX = Math.cos(crabAngle) * R * 0.95;
      const crabY = -R * 0.85 + Math.sin(crabAngle * 2) * 8;
      const near = Math.hypot(px - (cx + crabX), py - (cy + crabY)) < 70;

      flee = near ? 0.03 : flee * 0.94;
      crabAngle += 0.01 + flee + boost * 0.4;

      ctx.save();
      ctx.translate(cx, cy);

      for (let i = 0; i < COUNT; i++) {
        const phi = Math.acos(-1 + (2 * i) / COUNT);
        const theta = Math.sqrt(COUNT * Math.PI) * phi + sphereAngle;
        const x = R * Math.cos(theta) * Math.sin(phi);
        const y = R * Math.sin(theta) * Math.sin(phi);
        const z = R * Math.cos(phi);
        const s = (z + R * 1.5) / (R * 2);
        ctx.beginPath();
        ctx.arc(x, y, 3 * s, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${10 + (z / R) * 30}, 95%, 60%, ${Math.max(0.1, s * 0.75)})`;
        ctx.fill();
      }

      drawCrab(
        crabX, crabY,
        0.85 + Math.sin(crabAngle) * 0.15,
        crabAngle * (near ? 18 : 6),
        near || flee > 0.02
      );
      ctx.restore();
    };
    draw();
  }

  // --------------------------------------------------------------------------
  // 2. FORM PEMESANAN → WHATSAPP
  // --------------------------------------------------------------------------
  const qtyInput = $('cust-qty');
  const livePrice = $('live-total-price');
  const waForm = $('wa-order-form');
  const addressGroup = $('address-field-group');
  const addressInput = $('cust-address');
  const serviceCards = document.querySelectorAll('.service-card');
  const extras = document.querySelectorAll('.extra-item');
  const BASE_PRICE = 18000;

  const rupiah = (n) => `Rp ${n.toLocaleString('id-ID')}`;
  const getQty = () => Math.min(50, Math.max(1, parseInt(qtyInput.value) || 1));
  const getTotal = () => {
    const qty = getQty();
    let total = qty * BASE_PRICE;
    extras.forEach((cb) => {
      if (cb.checked) total += (parseInt(cb.dataset.price) || 0) * qty;
    });
    return total;
  };
  const refreshTotal = () => { livePrice.textContent = rupiah(getTotal()); };

  $('btn-qty-minus').addEventListener('click', () => {
    qtyInput.value = Math.max(1, getQty() - 1);
    refreshTotal();
  });
  $('btn-qty-plus').addEventListener('click', () => {
    qtyInput.value = Math.min(50, getQty() + 1);
    refreshTotal();
  });
  extras.forEach((cb) => cb.addEventListener('change', refreshTotal));

  serviceCards.forEach((card) => {
    card.addEventListener('click', () => {
      serviceCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const isDelivery = card.dataset.service === 'delivery';
      addressGroup.style.display = isDelivery ? 'flex' : 'none';
      addressInput.required = isDelivery;
      if (!isDelivery) addressInput.value = '';
    });
  });

  waForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = $('cust-name').value.trim();
    const qty = getQty();
    const service = (document.querySelector('input[name="service-type"]:checked') || {}).value || 'Makan di Tempat';
    const address = addressInput.value.trim();
    const note = $('cust-note').value.trim();
    const selected = [...extras].filter((cb) => cb.checked).map((cb) => cb.value);

    let msg = `Halo *CRABPREK Payakumbuh*! Saya ingin memesan:\n\n`;
    msg += `📋 *DETAIL PESANAN:*\n`;
    msg += `• Menu Utama: *Crabprek Sambel Geprek*\n`;
    msg += `• Jumlah: *${qty} Porsi*\n`;
    msg += `• Layanan: *${service}*\n`;
    if (selected.length) msg += `• Ekstra: ${selected.join(', ')}\n`;
    msg += `• Total Est: *${rupiah(getTotal())}*\n\n`;
    msg += `👤 *DATA PEMESAN:*\n`;
    msg += `• Nama: ${name}\n`;
    if (address) msg += `• Alamat/Lokasi Antar: ${address}\n`;
    if (note) msg += `• Catatan: ${note}\n`;
    msg += `\nMohon diproses ya kak. Terima kasih! 🦀🔥`;

    window.location.href = `https://wa.me/6282362129646?text=${encodeURIComponent(msg)}`;
  });

  // --------------------------------------------------------------------------
  // 3. MODAL JAM ANALOG + DIGITAL (waktu WIB)
  // --------------------------------------------------------------------------
  const clockTrigger = $('trigger-clock-modal');
  const clockModal = $('clock-modal');
  const clockCanvas = $('analog-clock-canvas');
  const digitalText = $('digital-clock-text');
  let clockTimer = null;

  const drawClock = () => {
    const c = clockCanvas.getContext('2d');
    const R = clockCanvas.width / 2;
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();

    digitalText.textContent = [h, m, s].map((n) => String(n).padStart(2, '0')).join(':') + ' WIB';

    c.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
    c.save();
    c.translate(R, R);

    c.beginPath();
    c.arc(0, 0, R - 8, 0, Math.PI * 2);
    c.fillStyle = '#12141d';
    c.fill();
    c.lineWidth = 4;
    c.strokeStyle = '#ff3b30';
    c.stroke();

    c.font = '28px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('🦀', 0, 0);

    c.lineCap = 'round';
    c.strokeStyle = '#ffb703';
    c.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      c.save();
      c.rotate((i * Math.PI) / 6);
      c.beginPath();
      c.moveTo(0, -(R - 20));
      c.lineTo(0, -(R - 12));
      c.stroke();
      c.restore();
    }

    const hand = (angle, len, color, w, tail = 0) => {
      c.save();
      c.rotate(angle);
      c.beginPath();
      c.moveTo(0, tail);
      c.lineTo(0, -len);
      c.strokeStyle = color;
      c.lineWidth = w;
      c.stroke();
      c.restore();
    };
    hand(((h % 12) * Math.PI) / 6 + (m * Math.PI) / 360, R * 0.5, '#f8fafc', 5);
    hand((m * Math.PI) / 30 + (s * Math.PI) / 1800, R * 0.7, '#ffb703', 3);
    hand((s * Math.PI) / 30, R * 0.82, '#ff3b30', 2, 10);

    c.restore();
  };

  const openClock = () => {
    clockModal.classList.add('active');
    drawClock();
    clearInterval(clockTimer);
    clockTimer = setInterval(drawClock, 1000);
  };
  const closeClock = () => {
    clockModal.classList.remove('active');
    clearInterval(clockTimer);
  };

  clockTrigger.addEventListener('click', openClock);
  clockTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openClock(); }
  });
  $('btn-close-clock').addEventListener('click', closeClock);
  clockModal.addEventListener('click', (e) => { if (e.target === clockModal) closeClock(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && clockModal.classList.contains('active')) closeClock();
  });

  // --------------------------------------------------------------------------
  // 4. TILT KARTU PRODUK (hanya perangkat dengan kursor)
  // --------------------------------------------------------------------------
  const tiltCard = document.querySelector('.tilt-card');
  if (tiltCard && window.matchMedia('(hover: hover)').matches) {
    tiltCard.addEventListener('mousemove', (e) => {
      const r = tiltCard.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      tiltCard.style.transform = `perspective(1000px) rotateX(${(y / r.height) * -5}deg) rotateY(${(x / r.width) * 5}deg)`;
    });
    tiltCard.addEventListener('mouseleave', () => {
      tiltCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // --------------------------------------------------------------------------
  // 5. NAVBAR, SCROLLSPY & HORIZONTAL SCROLLER (geser mouse / sentuhan)
  // --------------------------------------------------------------------------
  const navbar = $('navbar');
  const nav = $('main-nav');
  const navLinks = [...nav.querySelectorAll('a')];

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Tandai tepi yang masih bisa digeser (memunculkan fade di sisi tersebut)
  const updateEdges = (el) => {
    const max = el.scrollWidth - el.clientWidth;
    el.classList.toggle('can-l', el.scrollLeft > 4);
    el.classList.toggle('can-r', el.scrollLeft < max - 4);
  };

  // Sentuhan memakai scroll native; mouse memakai drag-to-scroll
  const enableDragScroll = (el) => {
    let down = false, moved = false, startX = 0, startLeft = 0;

    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; el.classList.add('dragging'); }
      if (moved) el.scrollLeft = startLeft - dx;
    });
    const end = () => { down = false; el.classList.remove('dragging'); };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);

    // Cegah klik link/kartu yang tidak sengaja setelah drag
    el.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    el.addEventListener('scroll', () => updateEdges(el), { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(() => updateEdges(el)).observe(el);
    window.addEventListener('load', () => updateEdges(el));
    updateEdges(el);
  };

  enableDragScroll(nav);
  const infoScroller = $('info-scroller');
  if (infoScroller) enableDragScroll(infoScroller);

  // Scrollspy: menu aktif mengikuti section dan otomatis berada di tengah navigasi
  let current = null;
  const setActive = (id) => {
    if (id === current) return;
    current = id;
    navLinks.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('active', on);
      if (on && nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  };

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean)
    .forEach((sec) => spy.observe(sec));

  // --------------------------------------------------------------------------
  // 6. REVEAL SAAT SCROLL
  // --------------------------------------------------------------------------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('active');
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
});