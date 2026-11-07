/* ==========================================================================
   CRABPREK — Interactive Script
   Fitur: form pesanan (WA), kalkulasi harga promo, horizontal scroll, jam
   analog, scroll reveal, active nav.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* === KONFIGURASI === */
  const BASE_PRICE = 16000;   // Harga promo (digunakan untuk perhitungan)
  const NORMAL_PRICE = 18000; // Harga normal (hanya tampil sebagai info)
  const WA_NUMBER = '6282362129646';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rupiah = (n) => 'Rp' + n.toLocaleString('id-ID');

  /* ========================================================================
     1. NAVBAR SCROLL STATE
     ======================================================================== */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ========================================================================
     2. HORIZONTAL SCROLL UTILITY (nav + info cards)
     ======================================================================== */
  const setupHScroll = (scroller) => {
    if (!scroller) return;
    const wrap = scroller.parentElement;

    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const hasOverflow = max > 4;
      wrap.classList.toggle('has-overflow', hasOverflow);
      wrap.classList.toggle('at-start', scroller.scrollLeft < 4);
      wrap.classList.toggle('at-end', scroller.scrollLeft >= max - 4);
    };

    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    // Drag-to-scroll (mouse only; touch swipe ditangani browser)
    let isDown = false, moved = false, startX = 0, startScroll = 0;

    scroller.addEventListener('mousedown', (e) => {
      isDown = true;
      moved = false;
      startX = e.pageX;
      startScroll = scroller.scrollLeft;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) moved = true;
      if (moved) {
        e.preventDefault();
        scroller.classList.add('dragging');
        scroller.scrollLeft = startScroll - dx;
      }
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
      scroller.classList.remove('dragging');
    });

    // Cegah klik link saat drag (capture phase)
    scroller.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);

    update();
  };

  setupHScroll(document.getElementById('nav-scroll'));
  setupHScroll(document.getElementById('info-scroll'));

  /* ========================================================================
     3. ORDER FORM
     ======================================================================== */
  const form = document.getElementById('order-form');
  if (form) {
    const qtyInput = document.getElementById('cust-qty');
    const btnMinus = document.getElementById('btn-qty-minus');
    const btnPlus = document.getElementById('btn-qty-plus');
    const totalEl = document.getElementById('live-total-price');
    const totalDetail = document.getElementById('live-total-detail');
    const extras = form.querySelectorAll('.extra-item');
    const addrGroup = document.getElementById('address-field-group');
    const addrInput = document.getElementById('cust-address');
    const nameInput = document.getElementById('cust-name');
    const noteInput = document.getElementById('cust-note');
    const serviceCards = form.querySelectorAll('.service-card');

    const getQty = () => Math.max(1, Math.min(99, parseInt(qtyInput.value, 10) || 1));

    const getSelectedExtras = () => {
      const list = [];
      let perPorsiExtra = 0;
      extras.forEach((cb) => {
        if (cb.checked) {
          list.push({ name: cb.value, price: parseInt(cb.dataset.price, 10) || 0 });
          perPorsiExtra += parseInt(cb.dataset.price, 10) || 0;
        }
      });
      return { list, perPorsiExtra };
    };

    const calculateTotal = () => {
      const qty = getQty();
      const { list, perPorsiExtra } = getSelectedExtras();
      const perPorsi = BASE_PRICE + perPorsiExtra;
      const total = perPorsi * qty;

      if (totalEl) totalEl.textContent = rupiah(total);
      if (totalDetail) {
        totalDetail.textContent = list.length
          ? `${qty} porsi × ${rupiah(BASE_PRICE)} + ${list.length} ekstra`
          : `${qty} porsi × ${rupiah(BASE_PRICE)}`;
      }
    };

    // Qty ±
    btnMinus.addEventListener('click', () => {
      qtyInput.value = Math.max(1, getQty() - 1);
      calculateTotal();
    });
    btnPlus.addEventListener('click', () => {
      qtyInput.value = Math.min(99, getQty() + 1);
      calculateTotal();
    });
    qtyInput.addEventListener('input', () => {
      const v = parseInt(qtyInput.value, 10);
      if (Number.isNaN(v) || v < 1) qtyInput.value = 1;
      if (v > 99) qtyInput.value = 99;
      calculateTotal();
    });

    // Extras
    extras.forEach((cb) => cb.addEventListener('change', calculateTotal));

    // Service type cards
    serviceCards.forEach((card) => {
      card.addEventListener('click', () => {
        serviceCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        const isDelivery = card.dataset.service === 'delivery';
        addrGroup.hidden = !isDelivery;
        addrInput.required = isDelivery;
        if (!isDelivery) {
          addrInput.value = '';
          addrGroup.classList.remove('error');
        }
      });
    });

    // Inisialisasi
    calculateTotal();

    /* --- Submit → WhatsApp --- */
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      if (!name) {
        nameInput.classList.add('error');
        nameInput.focus();
        return;
      }
      nameInput.classList.remove('error');

      const qty = getQty();
      const activeRadio = form.querySelector('input[name="service-type"]:checked');
      const service = activeRadio ? activeRadio.value : 'Makan di Tempat';
      const isDelivery = service === 'Delivery';
      const address = addrInput.value.trim();

      if (isDelivery && !address) {
        addrGroup.classList.add('error');
        addrInput.focus();
        return;
      }
      addrGroup.classList.remove('error');

      const note = noteInput.value.trim();
      const { list: extrasList, perPorsiExtra } = getSelectedExtras();
      const perPorsi = BASE_PRICE + perPorsiExtra;
      const total = perPorsi * qty;

      let msg = `Halo *CRABPREK Payakumbuh*! Saya ingin memesan:\n\n`;
      msg += `📋 *DETAIL PESANAN*\n`;
      msg += `• Menu: *Crabprek Sambel Geprek*\n`;
      msg += `• Jumlah: *${qty} porsi*\n`;
      msg += `• Layanan: *${service}*\n`;
      msg += `• Harga Normal: ${rupiah(NORMAL_PRICE)} /porsi\n`;
      msg += `• Harga Promo: ${rupiah(BASE_PRICE)} /porsi\n`;
      if (extrasList.length) {
        msg += `• Ekstra:\n`;
        extrasList.forEach((ex) => {
          msg += `   – ${ex.name} (+${rupiah(ex.price)})\n`;
        });
      }
      msg += `\n👤 *DATA PEMESAN*\n`;
      msg += `• Nama: ${name}\n`;
      if (isDelivery && address) msg += `• Alamat: ${address}\n`;
      if (note) msg += `• Catatan: ${note}\n`;
      msg += `\n💰 *TOTAL ESTIMASI: ${rupiah(total)}*\n`;
      msg += `\nMohon diproses ya kak. Terima kasih! 🦀🔥`;

      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ========================================================================
     4. MODAL JAM ANALOG + DIGITAL
     ======================================================================== */
  const clockTrigger = document.getElementById('trigger-clock-modal');
  const clockModal = document.getElementById('clock-modal');
  const btnCloseClock = document.getElementById('btn-close-clock');
  const clockCanvas = document.getElementById('analog-clock-canvas');
  const digitalClockText = document.getElementById('digital-clock-text');
  let clockInterval = null;

  const drawClock = () => {
    if (!clockCanvas) return;
    const ctx = clockCanvas.getContext('2d');
    const size = clockCanvas.width;
    const radius = size / 2;
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (digitalClockText) {
      digitalClockText.textContent =
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} WIB`;
    }

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(radius, radius);

    // Face
    ctx.beginPath();
    ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
    ctx.fillStyle = '#FAF3E7';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#D62828';
    ctx.stroke();

    // Tick marks
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -(radius - 22));
      ctx.lineTo(0, -(radius - 32));
      ctx.strokeStyle = i % 3 === 0 ? '#2B1D14' : 'rgba(43,29,20,0.35)';
      ctx.lineWidth = i % 3 === 0 ? 3 : 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Center crab emoji
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦀', 0, -radius * 0.5);

    // Hour hand
    const hourAng = ((h % 12) * Math.PI) / 6 + (m * Math.PI) / 360;
    ctx.save();
    ctx.rotate(hourAng);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, -(radius * 0.5));
    ctx.strokeStyle = '#2B1D14';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Minute hand
    const minAng = (m * Math.PI) / 30 + (s * Math.PI) / 1800;
    ctx.save();
    ctx.rotate(minAng);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, -(radius * 0.72));
    ctx.strokeStyle = '#D62828';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Second hand
    const secAng = (s * Math.PI) / 30;
    ctx.save();
    ctx.rotate(secAng);
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -(radius * 0.85));
    ctx.strokeStyle = '#F4A261';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#D62828';
    ctx.fill();

    ctx.restore();
  };

  const openClock = () => {
    if (!clockModal) return;
    clockModal.classList.add('active');
    drawClock();
    if (clockInterval) clearInterval(clockInterval);
    clockInterval = setInterval(drawClock, 1000);
  };
  const closeClock = () => {
    if (!clockModal) return;
    clockModal.classList.remove('active');
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
  };

  if (clockTrigger) clockTrigger.addEventListener('click', openClock);
  if (btnCloseClock) btnCloseClock.addEventListener('click', closeClock);
  if (clockModal) {
    clockModal.addEventListener('click', (e) => {
      if (e.target === clockModal) closeClock();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && clockModal && clockModal.classList.contains('active')) closeClock();
  });

  /* ========================================================================
     5. SCROLL REVEAL
     ======================================================================== */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('visible'));
  } else {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealIO.observe(el));
  }

  /* ========================================================================
     6. ACTIVE NAV LINK
     ======================================================================== */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => navIO.observe(s));
  }
});