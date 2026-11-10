// [Lanjutan Bagian 3: FORM PEMESANAN]
      waMessage += `\nMohon diproses ya kak. Terima kasih!`;

      // Nomor WhatsApp tujuan (Format: kode negara tanpa +, contoh 62...)
      const waNumber = "6282362129646";
      const encodedMessage = encodeURIComponent(waMessage);
      const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

      // Buka di tab baru / aplikasi WhatsApp
      window.open(waUrl, '_blank');
    });
  }

  // --------------------------------------------------------------------------
  // 4. ANALOG CLOCK & MODAL ENGINE
  // --------------------------------------------------------------------------
  const clockModal = document.getElementById('clock-modal');
  const btnTriggerClock = document.getElementById('trigger-clock-modal');
  const btnCloseClock = document.getElementById('btn-close-clock');
  const analogCanvas = document.getElementById('analog-clock-canvas');
  const digitalText = document.getElementById('digital-clock-text');
  let clockInterval;

  if (clockModal && btnTriggerClock && btnCloseClock && analogCanvas) {
    const ctxClock = analogCanvas.getContext('2d');
    let radius = analogCanvas.height / 2;
    ctxClock.translate(radius, radius);
    radius = radius * 0.90;

    const drawClock = () => {
      const now = new Date();
      let hour = now.getHours();
      let minute = now.getMinutes();
      let second = now.getSeconds();

      // Update Digital Text
      if (digitalText) {
        digitalText.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} WIB`;
      }

      // Draw Face
      ctxClock.clearRect(-radius * 1.2, -radius * 1.2, radius * 2.4, radius * 2.4);
      ctxClock.beginPath();
      ctxClock.arc(0, 0, radius, 0, 2 * Math.PI);
      ctxClock.fillStyle = '#15171d'; 
      ctxClock.fill();
      ctxClock.strokeStyle = '#D7F34A'; 
      ctxClock.lineWidth = 3;
      ctxClock.stroke();

      // Center Dot
      ctxClock.beginPath();
      ctxClock.arc(0, 0, 5, 0, 2 * Math.PI);
      ctxClock.fillStyle = '#FF4038'; 
      ctxClock.fill();

      // Numbers
      ctxClock.font = radius * 0.15 + "px sans-serif";
      ctxClock.textBaseline = "middle";
      ctxClock.textAlign = "center";
      ctxClock.fillStyle = '#F5EBDD';
      for (let num = 1; num < 13; num++) {
        let ang = num * Math.PI / 6;
        ctxClock.rotate(ang);
        ctxClock.translate(0, -radius * 0.78);
        ctxClock.rotate(-ang);
        ctxClock.fillText(num.toString(), 0, 0);
        ctxClock.rotate(ang);
        ctxClock.translate(0, radius * 0.78);
        ctxClock.rotate(-ang);
      }

      // Calculate Angles
      hour = hour % 12;
      hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
      minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
      second = (second * Math.PI / 30);

      // Draw Hands
      const drawHand = (pos, length, width, color) => {
        ctxClock.beginPath();
        ctxClock.lineWidth = width;
        ctxClock.lineCap = "round";
        ctxClock.strokeStyle = color;
        ctxClock.moveTo(0, 0);
        ctxClock.rotate(pos);
        ctxClock.lineTo(0, -length);
        ctxClock.stroke();
        ctxClock.rotate(-pos);
      };

      drawHand(hour, radius * 0.5, 6, '#F5EBDD');
      drawHand(minute, radius * 0.7, 4, '#F5EBDD');
      drawHand(second, radius * 0.8, 2, '#FF4038');
    };

    btnTriggerClock.addEventListener('click', () => {
      clockModal.classList.add('active');
      drawClock();
      clockInterval = setInterval(drawClock, 1000);
    });

    const closeModal = () => {
      clockModal.classList.remove('active');
      clearInterval(clockInterval);
    };

    btnCloseClock.addEventListener('click', closeModal);
    clockModal.addEventListener('click', (e) => {
      if (e.target === clockModal) closeModal();
    });
  }

  // --------------------------------------------------------------------------
  // 5. NAVBAR MOBILE TOGGLE
  // --------------------------------------------------------------------------
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. SCROLL REVEAL ANIMATION (Untuk class .reveal)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target); 
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

}); // Akhir dari DOMContentLoaded