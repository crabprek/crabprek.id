/* ==========================================================================
   CRABPREK JAVASCRIPT ENGINE (LIVE ANALOG CLOCK, MAPS AUTO, & AUTO WA)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. CUSTOM CURSOR TRAIL ENGINE
  // --------------------------------------------------------------------------
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

    const addParticle = (x, y) => {
      if (particles.length > 40) particles.shift();
      particles.push({
        x: x,
        y: y,
        size: Math.random() * 6 + 3,
        alpha: 1,
        color: Math.random() > 0.5 ? '#ff3b30' : '#ffb703',
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 1
      });
    };

    window.addEventListener('mousemove', (e) => addParticle(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    addParticle(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });
window.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    addParticle(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

    const animateTrail = () => {
      tCtx.clearRect(0, 0, tWidth, tHeight);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;

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

  // --------------------------------------------------------------------------
  // 2. HERO CANVAS 3D ENGINE (BOLA & KEPITING INTERAKTIF)
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    let canvasPointerX = -9999;
    let canvasPointerY = -9999;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };
    window.addEventListener('resize', resize);
    resize();

    const updatePointerPos = (clientX, clientY) => {
  // ✅ Guard: abaikan nilai invalid supaya mouseX/Y tidak pernah NaN
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;

  const rect = canvas.getBoundingClientRect();
  canvasPointerX = clientX - rect.left;
  canvasPointerY = clientY - rect.top;
  targetMouseX = (clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (clientY / window.innerHeight - 0.5) * 2;
};

    window.addEventListener('mousemove', (e) => updatePointerPos(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });
canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

// ✅ Saat jari diangkat → bola kembali ke tengah, crab berhenti "kabur"
const resetPointer = () => {
  targetMouseX = 0;
  targetMouseY = 0;
  canvasPointerX = -9999;
  canvasPointerY = -9999;
};
canvas.addEventListener('touchend', resetPointer, { passive: true });
canvas.addEventListener('touchcancel', resetPointer, { passive: true });
canvas.addEventListener('mouseleave', resetPointer);

    const particleCount = 110;
    let sphereAngle = 0;
    let crabWalkAngle = 0;
    let crabFleeSpeed = 0;

    const drawProceduralCrab = (x, y, scale, legCycle, isFleeing) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.fillStyle = isFleeing ? '#ff1100' : '#ff3b30';
      ctx.shadowBlur = isFleeing ? 20 : 12;
      ctx.shadowColor = isFleeing ? '#ffb703' : '#ff6b35';

      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-6, -13, 3, 0, Math.PI * 2);
      ctx.arc(6, -13, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-6, -14, 1.5, 0, Math.PI * 2);
      ctx.arc(6, -14, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ff3b30';
      ctx.lineWidth = 3.5;
      
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.quadraticCurveTo(-18, -16, -12, -20);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(10, -6);
      ctx.quadraticCurveTo(18, -16, 12, -20);
      ctx.stroke();

      ctx.lineWidth = 2;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
          const legPhase = Math.sin(legCycle + i * 0.8) * (isFleeing ? 7 : 4);
          const startX = side * 12;
          const startY = -2 + i * 5;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + side * 10, startY + legPhase);
          ctx.lineTo(startX + side * 14, startY + 8 + legPhase);
          ctx.stroke();
        }
      }

      if (isFleeing) {
        ctx.fillStyle = '#ffb703';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('💨 KABUR!', -20, -28);
      }

      ctx.restore();
    };

    const drawVisualStage = () => {
  // ✅ Defensive: kalau entah kenapa ada NaN, langsung reset — tidak akan lari ke sudut
  if (!Number.isFinite(mouseX)) mouseX = 0;
  if (!Number.isFinite(mouseY)) mouseY = 0;
  if (!Number.isFinite(targetMouseX)) targetMouseX = 0;
  if (!Number.isFinite(targetMouseY)) targetMouseY = 0;

  ctx.clearRect(0, 0, width, height);
  // ... sisa kode tetap
};

  // ✅ Lerp lebih lambat → transisi posisi halus, tidak "lompat"
  mouseX += (targetMouseX - mouseX) * 0.02;
  mouseY += (targetMouseY - mouseY) * 0.02;

  // ✅ Scroll di-cap → tidak pernah berputar kencang walau scroll jauh
  const scrollSpeed = Math.min(window.scrollY * 0.0005, 0.002);
  sphereAngle += 0.004 + scrollSpeed;

  // ✅ Parallax mouse dikurangi (20px → 10px) → tidak mudah pindah posisi
  const centerX = width * 0.5 + mouseX * 10;
  const centerY = height * 0.5 + mouseY * 10;
  const radius = Math.min(width, height) * 0.32;

  const crabX = Math.cos(crabWalkAngle) * (radius * 0.95);
  const crabY = -radius * 0.85 + Math.sin(crabWalkAngle * 2) * 8;
  const crabAbsX = centerX + crabX;
  const crabAbsY = centerY + crabY;

  // ✅ Deteksi kursor lebih kecil (85px → 70px) → kepiting lebih jarang kabur
  const distToPointer = Math.hypot(canvasPointerX - crabAbsX, canvasPointerY - crabAbsY);
  const isTouchNear = distToPointer < 70;

  // ✅ Kecepatan kabur dikurangi + decay lebih cepat → berhenti lebih cepat
  if (isTouchNear) {
    crabFleeSpeed = 0.03;
  } else {
    crabFleeSpeed *= 0.94;
  }

  // ✅ Efek scroll ke kepiting dikurangi (1.5 → 0.4) → tidak "loncat"
  crabWalkAngle += 0.010 + crabFleeSpeed + scrollSpeed * 0.4;

  ctx.save();
  ctx.translate(centerX, centerY);

  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi + sphereAngle;

    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    const scale = (z + radius * 1.5) / (radius * 2);
    const alpha = Math.max(0.1, scale * 0.75);

    ctx.beginPath();
    ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);

    const hue = 10 + (z / radius) * 30;
    ctx.fillStyle = `hsla(${hue}, 95%, 60%, ${alpha})`;
    ctx.fill();
  }

  const crabScale = 0.85 + Math.sin(crabWalkAngle) * 0.15;
  const legCycleSpeed = isTouchNear ? crabWalkAngle * 18 : crabWalkAngle * 6;

  drawProceduralCrab(crabX, crabY, crabScale, legCycleSpeed, isTouchNear || crabFleeSpeed > 0.02);

  ctx.restore();
  requestAnimationFrame(drawVisualStage);
};

    drawVisualStage();
  }

  // --------------------------------------------------------------------------
  // 3. FORM PEMESANAN INTERAKTIF & HARGA EKSTRA REVISI
  // --------------------------------------------------------------------------
  const qtyInput = document.getElementById('cust-qty');
  const btnMinus = document.getElementById('btn-qty-minus');
  const btnPlus = document.getElementById('btn-qty-plus');
  const livePriceEl = document.getElementById('live-total-price');
  const waForm = document.getElementById('wa-order-form');
  const serviceCards = document.querySelectorAll('.service-card');
  const extraCheckboxes = document.querySelectorAll('.extra-item');
  const addressGroup = document.getElementById('address-field-group');
  const addressInput = document.getElementById('cust-address');

  const BASE_PRICE = 18000;

  const calculateTotal = () => {
    let qty = parseInt(qtyInput.value) || 1;
    let total = qty * BASE_PRICE;

    extraCheckboxes.forEach(cb => {
      if (cb.checked) {
        total += (parseInt(cb.getAttribute('data-price')) || 0) * qty;
      }
    });

    if (livePriceEl) {
      livePriceEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
  };

  if (btnMinus && btnPlus && qtyInput) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
        calculateTotal();
      }
    });

    btnPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
      calculateTotal();
    });
  }

  extraCheckboxes.forEach(cb => cb.addEventListener('change', calculateTotal));

  // Toggle Alamat Pengiriman
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const serviceType = card.getAttribute('data-service');
      if (serviceType === 'delivery') {
        addressGroup.style.display = 'flex';
        addressInput.required = true;
      } else {
        addressGroup.style.display = 'none';
        addressInput.required = false;
        addressInput.value = '';
      }
    });
  });

  // Submit Form -> Redirect wa.me
  if (waForm) {
    waForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('cust-name').value.trim();
      const qty = parseInt(qtyInput.value) || 1;
      
      let selectedService = "Makan di Tempat";
      const activeRadio = document.querySelector('input[name="service-type"]:checked');
      if (activeRadio) selectedService = activeRadio.value;

      const address = addressInput.value.trim();
      const note = document.getElementById('cust-note').value.trim();

      let selectedExtras = [];
      extraCheckboxes.forEach(cb => {
        if (cb.checked) selectedExtras.push(cb.value);
      });

      let currentTotalText = livePriceEl ? livePriceEl.textContent : `Rp ${(qty * BASE_PRICE).toLocaleString('id-ID')}`;

      let waMessage = `Halo *CRABPREK Payakumbuh*! Saya ingin memesan:\n\n`;
      waMessage += `📋 *DETAIL PESANAN:*\n`;
      waMessage += `• Menu Utama: *Crabprek Sambel Geprek*\n`;
      waMessage += `• Jumlah: *${qty} Porsi*\n`;
      waMessage += `• Layanan: *${selectedService}*\n`;
      if (selectedExtras.length > 0) {
        waMessage += `• Ekstra: ${selectedExtras.join(', ')}\n`;
      }
      waMessage += `• Total Est: *${currentTotalText}*\n\n`;
      
      waMessage += `👤 *DATA PEMESAN:*\n`;
      waMessage += `• Nama: ${name}\n`;
      if (address) waMessage += `• Alamat/Lokasi Antar: ${address}\n`;
      if (note) waMessage += `• Catatan: ${note}\n`;

      waMessage += `\nMohon diproses ya kak. Terima kasih! 🦀🔥`;

      const waUrl = `https://wa.me/6282362129646?text=${encodeURIComponent(waMessage)}`;
      window.location.href = waUrl;
    });
  }

  // --------------------------------------------------------------------------
  // 4. MODAL JAM ANALOG INTERAKTIF & LOGO CRABPREK
  // --------------------------------------------------------------------------
  const clockTrigger = document.getElementById('trigger-clock-modal');
  const clockModal = document.getElementById('clock-modal');
  const btnCloseClock = document.getElementById('btn-close-clock');
  const clockCanvas = document.getElementById('analog-clock-canvas');
  const digitalClockText = document.getElementById('digital-clock-text');

  let clockInterval = null;

  const drawAnalogClock = () => {
    if (!clockCanvas) return;
    const cCtx = clockCanvas.getContext('2d');
    const radius = clockCanvas.width / 2;

    cCtx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Update Text Digital
    if (digitalClockText) {
      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');
      digitalClockText.textContent = `${hStr}:${mStr}:${sStr} WIB`;
    }

    cCtx.save();
    cCtx.translate(radius, radius);

    // Dial Ring
    cCtx.beginPath();
    cCtx.arc(0, 0, radius - 8, 0, Math.PI * 2);
    cCtx.fillStyle = '#12141d';
    cCtx.fill();
    cCtx.lineWidth = 4;
    cCtx.strokeStyle = '#ff3b30';
    cCtx.stroke();

    // Logo / Ikon Kepiting di Tengah Jam
    cCtx.font = '28px sans-serif';
    cCtx.textAlign = 'center';
    cCtx.textBaseline = 'middle';
    cCtx.fillText('🦀', 0, 0);

    // Tanda Jam (Tick Marks)
    for (let i = 0; i < 12; i++) {
      const ang = (i * Math.PI) / 6;
      cCtx.beginPath();
      cCtx.rotate(ang);
      cCtx.moveTo(0, -(radius - 20));
      cCtx.lineTo(0, -(radius - 12));
      cCtx.strokeStyle = '#ffb703';
      cCtx.lineWidth = 3;
      cCtx.stroke();
      cCtx.rotate(-ang);
    }

    // Jarum Jam
    const hourAng = ((hours % 12) * Math.PI) / 6 + (minutes * Math.PI) / 360;
    cCtx.beginPath();
    cCtx.rotate(hourAng);
    cCtx.moveTo(0, 0);
    cCtx.lineTo(0, -(radius * 0.5));
    cCtx.strokeStyle = '#f8fafc';
    cCtx.lineWidth = 5;
    cCtx.stroke();
    cCtx.rotate(-hourAng);

    // Jarum Menit
    const minAng = (minutes * Math.PI) / 30 + (seconds * Math.PI) / 1800;
    cCtx.beginPath();
    cCtx.rotate(minAng);
    cCtx.moveTo(0, 0);
    cCtx.lineTo(0, -(radius * 0.7));
    cCtx.strokeStyle = '#ffb703';
    cCtx.lineWidth = 3;
    cCtx.stroke();
    cCtx.rotate(-minAng);

    // Jarum Detik
    const secAng = (seconds * Math.PI) / 30;
    cCtx.beginPath();
    cCtx.rotate(secAng);
    cCtx.moveTo(0, 10);
    cCtx.lineTo(0, -(radius * 0.82));
    cCtx.strokeStyle = '#ff3b30';
    cCtx.lineWidth = 2;
    cCtx.stroke();
    cCtx.rotate(-secAng);

    cCtx.restore();
  };

  if (clockTrigger && clockModal) {
    clockTrigger.addEventListener('click', () => {
      clockModal.classList.add('active');
      drawAnalogClock();
      clockInterval = setInterval(drawAnalogClock, 1000);
    });

    btnCloseClock.addEventListener('click', () => {
      clockModal.classList.remove('active');
      if (clockInterval) clearInterval(clockInterval);
    });

    clockModal.addEventListener('click', (e) => {
      if (e.target === clockModal) {
        clockModal.classList.remove('active');
        if (clockInterval) clearInterval(clockInterval);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. PARALLAX 3D TILT ON HOVER
  // --------------------------------------------------------------------------
  const tiltCard = document.querySelector('.tilt-card');
  if (tiltCard) {
    tiltCard.addEventListener('mousemove', (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const tiltX = (y / rect.height) * -12;
      const tiltY = (x / rect.width) * 12;

      tiltCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    tiltCard.addEventListener('mouseleave', () => {
      tiltCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
  }

  // --------------------------------------------------------------------------
  // 6. NAVBAR SCROLL SHIFT & SCROLL REVEAL OBSERVER
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.background = 'rgba(8, 9, 13, 0.96)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
      navbar.style.height = '70px';
    } else {
      navbar.style.background = 'rgba(8, 9, 13, 0.85)';
      navbar.style.boxShadow = 'none';
      navbar.style.height = '80px';
    }
  });

  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => revealObserver.observe(el));

});