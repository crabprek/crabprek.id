/* ==========================================================================
   CRABPREK JAVASCRIPT ENGINE (FINAL)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. CUSTOM CURSOR TRAIL ENGINE
  const trailCanvas = document.getElementById('trail-canvas');
  if (trailCanvas) {
    const tCtx = trailCanvas.getContext('2d');
    let tWidth = trailCanvas.width = window.innerWidth;
    let tHeight = trailCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      tWidth = trailCanvas.width = window.innerWidth;
      tHeight = trailCanvas.height = window.innerHeight;
    });

    const particles = [];
    const trailColors = ['#FF4038', '#FF8A24', '#D7F34A'];

    const addParticle = (x, y) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (particles.length > 42) particles.shift();
      particles.push({
        x, y,
        size: Math.random() * 5.5 + 2.5,
        alpha: 1,
        color: trailColors[Math.floor(Math.random() * trailColors.length)],
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 1
      });
    };

    window.addEventListener('mousemove', (e) => addParticle(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => { if (e.touches.length > 0) addParticle(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchstart', (e) => { if (e.touches.length > 0) addParticle(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

    const animateTrail = () => {
      tCtx.clearRect(0, 0, tWidth, tHeight);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.025;
        if (p.alpha > 0) {
          tCtx.save();
          tCtx.globalAlpha = p.alpha;
          tCtx.fillStyle = p.color;
          tCtx.shadowBlur = 10;
          tCtx.shadowColor = p.color;
          tCtx.beginPath();
          tCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          tCtx.fill();
          tCtx.restore();
        }
      }
      requestAnimationFrame(animateTrail);
    };
    animateTrail();
  }

  // 2. HERO CANVAS 3D ENGINE
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
    let canvasPointerX = -9999, canvasPointerY = -9999;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };
    window.addEventListener('resize', resize);
    resize();

    const updatePointerPos = (clientX, clientY) => {
      if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
      const rect = canvas.getBoundingClientRect();
      canvasPointerX = clientX - rect.left;
      canvasPointerY = clientY - rect.top;
      targetMouseX = (clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', (e) => updatePointerPos(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => { if (e.touches.length > 0) updatePointerPos(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    canvas.addEventListener('touchmove', (e) => { if (e.touches.length > 0) updatePointerPos(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

    const resetPointer = () => { targetMouseX = 0; targetMouseY = 0; canvasPointerX = -9999; canvasPointerY = -9999; };
    canvas.addEventListener('touchend', resetPointer, { passive: true });
    canvas.addEventListener('touchcancel', resetPointer, { passive: true });
    canvas.addEventListener('mouseleave', resetPointer);

    const particleCount = 110;
    let sphereAngle = 0, crabWalkAngle = 0, crabFleeSpeed = 0;

    const drawProceduralCrab = (x, y, scale, legCycle, isFleeing) => {
      ctx.save();
      ctx.translate(x, y); ctx.scale(scale, scale);
      ctx.fillStyle = '#FF4038';
      ctx.shadowBlur = isFleeing ? 22 : 12;
      ctx.shadowColor = isFleeing ? '#D7F34A' : '#FF8A24';

      ctx.beginPath(); ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5EBDD';
      ctx.beginPath(); ctx.arc(-6, -13, 3, 0, Math.PI * 2); ctx.arc(6, -13, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#08090B';
      ctx.beginPath(); ctx.arc(-6, -14, 1.5, 0, Math.PI * 2); ctx.arc(6, -14, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#FF4038'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-18, -16, -12, -20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -6); ctx.quadraticCurveTo(18, -16, 12, -20); ctx.stroke();
      ctx.lineWidth = 2;

      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
          const legPhase = Math.sin(legCycle + i * 0.8) * (isFleeing ? 7 : 4);
          const startX = side * 12, startY = -2 + i * 5;
          ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(startX + side * 10, startY + legPhase); ctx.lineTo(startX + side * 14, startY + 8 + legPhase); ctx.stroke();
        }
      }

      if (isFleeing) { ctx.fillStyle = '#D7F34A'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('💨 KABUR!', -20, -28); }
      ctx.restore();
    };

    const drawVisualStage = () => {
      ctx.clearRect(0, 0, width, height);
      mouseX += (targetMouseX - mouseX) * 0.02; mouseY += (targetMouseY - mouseY) * 0.02;
      const scrollSpeed = Math.min(window.scrollY * 0.0005, 0.002);
      sphereAngle += 0.004 + scrollSpeed;

      const centerX = width * 0.5 + mouseX * 10, centerY = height * 0.5 + mouseY * 10;
      const radius = Math.min(width, height) * 0.32;
      const crabX = Math.cos(crabWalkAngle) * (radius * 0.95), crabY = -radius * 0.85 + Math.sin(crabWalkAngle * 2) * 8;
      const crabAbsX = centerX + crabX, crabAbsY = centerY + crabY;
      const distToPointer = Math.hypot(canvasPointerX - crabAbsX, canvasPointerY - crabAbsY);
      const isTouchNear = distToPointer < 70;

      crabFleeSpeed = isTouchNear ? 0.03 : crabFleeSpeed * 0.94;
      crabWalkAngle += 0.010 + crabFleeSpeed + scrollSpeed * 0.4;

      ctx.save(); ctx.translate(centerX, centerY);
      for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi + sphereAngle;
        const x = radius * Math.cos(theta) * Math.sin(phi), y = radius * Math.sin(theta) * Math.sin(phi), z = radius * Math.cos(phi);
        const scale = (z + radius * 1.5) / (radius * 2);
        const alpha = Math.max(0.1, scale * 0.75);

        ctx.beginPath(); ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${10 + (z / radius) * 30}, 95%, 60%, ${alpha})`; ctx.fill();
      }

      drawProceduralCrab(crabX, crabY, 0.85 + Math.sin(crabWalkAngle) * 0.15, isTouchNear ? crabWalkAngle * 18 : crabWalkAngle * 6, isTouchNear || crabFleeSpeed > 0.02);
      ctx.restore();
      requestAnimationFrame(drawVisualStage);
    };
    drawVisualStage();
  }

// --------------------------------------------------------------------------
  // 3. SISTEM KERANJANG & CHECKOUT (CART SYSTEM)
  // --------------------------------------------------------------------------
  let orderCart = [];
  const BASE_PRICE = 17000;

  // Form Elements
  const qtyInput = document.getElementById('cust-qty');
  const btnMinus = document.getElementById('btn-qty-minus');
  const btnPlus = document.getElementById('btn-qty-plus');
  const productOptions = document.querySelectorAll('.product-option');
  const serviceCards = document.querySelectorAll('.service-card');
  const extraCheckboxes = document.querySelectorAll('.extra-item');
  const addressGroup = document.getElementById('address-field-group');
  const addressInput = document.getElementById('cust-address');
  
  // Cart Elements
  const btnAddToCart = document.getElementById('btn-add-to-cart');
  const cartContainer = document.getElementById('cart-items-container');
  const liveTotalPrice = document.getElementById('live-total-price');
  const btnSubmitWA = document.getElementById('btn-submit-wa');

  // Logic: Plus Minus Qty Menu
  if (btnMinus && btnPlus && qtyInput) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
    btnPlus.addEventListener('click', () => {
      qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1;
    });
  }

  // Logic: UI Pilihan Menu Aktif
  productOptions.forEach(option => {
    option.addEventListener('click', () => {
      productOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Logic: UI Pilihan Layanan Aktif (Tampil Alamat jika Delivery)
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      if (addressGroup && addressInput) {
        if (card.getAttribute('data-service') === 'delivery') {
          addressGroup.style.display = 'flex'; 
        } else {
          addressGroup.style.display = 'none'; 
          addressInput.value = '';
        }
      }
    });
  });

  // Fungsi Render Keranjang HTML
  const renderCart = () => {
    if (orderCart.length === 0) {
      cartContainer.innerHTML = '<div class="empty-cart-msg">Keranjang masih kosong. Yuk tambah menu di atas!</div>';
      liveTotalPrice.textContent = "Rp 0";
      return;
    }

    let html = '';
    let grandTotal = 0;

    orderCart.forEach((item) => {
      grandTotal += item.total;
      
      let extrasText = item.extras.length > 0 ? `<small>➕ ${item.extras.join(', ')}</small>` : '';
      let noteText = item.note ? `<small>📝 Catatan: ${item.note}</small>` : '';

      html += `
        <div class="cart-item">
          <div class="cart-item-details">
            <strong>${item.qty}x ${item.product}</strong>
            ${extrasText}
            ${noteText}
            <span class="cart-item-price">Rp ${item.total.toLocaleString('id-ID')}</span>
          </div>
          <button type="button" class="btn-remove-item" data-id="${item.id}" aria-label="Hapus item">✕</button>
        </div>
      `;
    });

    cartContainer.innerHTML = html;
    liveTotalPrice.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    // Event Hapus Item
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToRemove = parseInt(e.target.dataset.id);
        orderCart = orderCart.filter(item => item.id !== idToRemove);
        renderCart();
      });
    });
  };

  // Logic: Tambah ke Keranjang
  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => {
      const activeProduct = document.querySelector('input[name="product-type"]:checked');
      if(!activeProduct) return;

      const qty = parseInt(qtyInput.value, 10) || 1;
      const extras = [];
      let extraTotal = 0;

      extraCheckboxes.forEach(cb => {
        if (cb.checked) {
          extras.push(cb.value);
          extraTotal += parseInt(cb.dataset.price, 10);
        }
      });

      const note = document.getElementById('item-note').value.trim();
      const itemTotal = (BASE_PRICE + extraTotal) * qty;

      const cartItem = {
        id: Date.now(),
        product: activeProduct.value,
        qty: qty,
        extras: extras,
        note: note,
        total: itemTotal
      };

      orderCart.push(cartItem);
      renderCart();

      // Feedback Visual Tombol
      const originalText = btnAddToCart.innerHTML;
      btnAddToCart.innerHTML = "Berhasil Ditambahkan! ✓";
      btnAddToCart.style.background = "var(--lime)";
      btnAddToCart.style.color = "#000";
      
      setTimeout(() => {
        btnAddToCart.innerHTML = originalText;
        btnAddToCart.style.background = "";
        btnAddToCart.style.color = "";
      }, 1500);

      // Reset Input Form Menu
      qtyInput.value = 1;
      extraCheckboxes.forEach(cb => cb.checked = false);
      document.getElementById('item-note').value = '';
    });
  }

  // Logic: Eksekusi Kirim WA
  if (btnSubmitWA) {
    btnSubmitWA.addEventListener('click', () => {
      if (orderCart.length === 0) {
        alert("Keranjang pesanan masih kosong! Silakan 'Tambah ke Keranjang' terlebih dahulu.");
        return;
      }

      const name = document.getElementById('cust-name').value.trim();
      if (!name) {
        alert("Mohon isi Nama Pemesan terlebih dahulu.");
        document.getElementById('cust-name').focus();
        return;
      }

      const activeRadio = document.querySelector('input[name="service-type"]:checked');
      const selectedService = activeRadio ? activeRadio.value : 'Makan di Tempat';
      const address = addressInput ? addressInput.value.trim() : '';
      
      if (selectedService.includes('Delivery') && !address) {
        alert("Untuk pesanan Delivery, mohon isi Alamat Lengkap pengiriman.");
        document.getElementById('cust-address').focus();
        return;
      }

      let waMessage = `Halo *CRABPREK Payakumbuh*! Saya ingin memesan:\n\n`;
      waMessage += `🛒 *DAFTAR PESANAN:*\n`;

      let finalTotal = 0;
      orderCart.forEach((item, index) => {
        finalTotal += item.total;
        waMessage += `\n*${index + 1}. ${item.qty}x ${item.product}*\n`;
        if (item.extras.length > 0) waMessage += `   ├ Ekstra: ${item.extras.join(', ')}\n`;
        if (item.note) waMessage += `   ├ Catatan: ${item.note}\n`;
        waMessage += `   └ Subtotal: Rp ${item.total.toLocaleString('id-ID')}\n`;
      });

      waMessage += `\n=========================\n`;
      waMessage += `*TOTAL TAGIHAN: Rp ${finalTotal.toLocaleString('id-ID')}*\n`;
      waMessage += `=========================\n\n`;

      waMessage += `👤 *DATA PEMESAN:*\n`;
      waMessage += `• Nama: ${name}\n`;
      waMessage += `• Layanan: ${selectedService}\n`;
      if (address) waMessage += `• Alamat Antar: ${address}\n`;

      waMessage += `\nMohon diproses ya kak. Terima kasih!`;

      const waNumber = "6282362129646";
      const encodedMessage = encodeURIComponent(waMessage);
      window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
    });
  }

  // 4. ANALOG CLOCK & MODAL ENGINE (With Logo in Center)
  const clockModal = document.getElementById('clock-modal');
  const btnTriggerClock = document.getElementById('trigger-clock-modal');
  const btnCloseClock = document.getElementById('btn-close-clock');
  const analogCanvas = document.getElementById('analog-clock-canvas');
  const digitalText = document.getElementById('digital-clock-text');
  let clockInterval;
  
  // Load Logo untuk Jam
  const clockLogo = new Image();
  clockLogo.src = 'logo.png';

  if (clockModal && btnTriggerClock && btnCloseClock && analogCanvas) {
    const ctxClock = analogCanvas.getContext('2d');
    let radius = analogCanvas.height / 2;
    ctxClock.translate(radius, radius);
    radius = radius * 0.90;

    const drawClock = () => {
      const now = new Date();
      let hour = now.getHours(), minute = now.getMinutes(), second = now.getSeconds();

      if (digitalText) digitalText.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} WIB`;

      // Background Jam
      ctxClock.clearRect(-radius * 1.2, -radius * 1.2, radius * 2.4, radius * 2.4);
      ctxClock.beginPath(); ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctxClock.fillStyle = '#15171d'; ctxClock.fill();
      ctxClock.strokeStyle = '#D7F34A'; ctxClock.lineWidth = 3; ctxClock.stroke();

      // Gambar Logo di Tengah Jam
      if (clockLogo.complete) {
        const logoSize = radius * 0.6;
        ctxClock.globalAlpha = 0.3; // Dibuat sedikit transparan agar jarum jam tetap terlihat jelas
        ctxClock.drawImage(clockLogo, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
        ctxClock.globalAlpha = 1.0;
      }

      ctxClock.font = radius * 0.15 + "px sans-serif";
      ctxClock.textBaseline = "middle"; ctxClock.textAlign = "center"; ctxClock.fillStyle = '#F5EBDD';
      for (let num = 1; num < 13; num++) {
        let ang = num * Math.PI / 6;
        ctxClock.rotate(ang); ctxClock.translate(0, -radius * 0.78); ctxClock.rotate(-ang);
        ctxClock.fillText(num.toString(), 0, 0);
        ctxClock.rotate(ang); ctxClock.translate(0, radius * 0.78); ctxClock.rotate(-ang);
      }

      hour = (hour % 12 * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
      minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
      second = (second * Math.PI / 30);

      const drawHand = (pos, length, width, color) => {
        ctxClock.beginPath(); ctx.lineWidth = width; ctx.lineCap = "round";
        ctxClock.strokeStyle = color;
        ctxClock.moveTo(0, 0); ctxClock.rotate(pos); ctxClock.lineTo(0, -length);
        ctxClock.stroke(); ctxClock.rotate(-pos);
      };

      drawHand(hour, radius * 0.5, 6, '#F5EBDD');
      drawHand(minute, radius * 0.7, 4, '#F5EBDD');
      drawHand(second, radius * 0.8, 2, '#FF4038');

      // Titik Tengah Poros Jam
      ctxClock.beginPath(); ctx.arc(0, 0, 6, 0, 2 * Math.PI);
      ctxClock.fillStyle = '#FF4038'; ctxClock.fill();
    };

    btnTriggerClock.addEventListener('click', () => { clockModal.classList.add('active'); drawClock(); clockInterval = setInterval(drawClock, 1000); });
    const closeModal = () => { clockModal.classList.remove('active'); clearInterval(clockInterval); };
    btnCloseClock.addEventListener('click', closeModal);
    clockModal.addEventListener('click', (e) => { if (e.target === clockModal) closeModal(); });
  }

  // 5. NAVBAR MOBILE TOGGLE
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { navToggle.setAttribute('aria-expanded', 'false'); navLinks.classList.remove('active'); });
    });
  }

  // 6. SCROLL REVEAL ANIMATION
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('active'); revealObserver.unobserve(entry.target); }
      });
    }, { 
      threshold: 0.05, 
      rootMargin: "0px 0px 50px 0px" // Diubah: elemen akan muncul 50px SEBELUM masuk ke layar
    });
    revealElements.forEach(el => revealObserver.observe(el));
  }

});