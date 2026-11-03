/* ==========================================================================
   CRABPREK CANVAS ENGINE (BOLA 3D BERPUTAR + KEPITING MERANGKAK INTERAKTIF)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const particleCount = 110;
    let sphereAngle = 0;
    let crabWalkAngle = 0; // Sudut posisi merangkak kepiting di atas bola

    // Fungsi menggambar grafis procedural Kepiting Merangkak di Canvas 3D
    const drawProceduralCrab = (x, y, scale, legCycle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Warna Kepiting Merah-Oranye Neon
      ctx.fillStyle = '#ff3b30';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff6b35';

      // 1. Badan Kepiting (Oval)
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Mata Kepiting (2 Tangkai Kecil)
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

      // 3. Supit / Claws (Kiri & Kanan)
      ctx.strokeStyle = '#ff3b30';
      ctx.lineWidth = 3.5;
      
      // Capit Kiri
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.quadraticCurveTo(-18, -16, -12, -20);
      ctx.stroke();

      // Capit Kanan
      ctx.beginPath();
      ctx.moveTo(10, -6);
      ctx.quadraticCurveTo(18, -16, 12, -20);
      ctx.stroke();

      // 4. Kaki Kepiting (Kaki Bergerak Mengayuh)
      ctx.lineWidth = 2;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
          const legPhase = Math.sin(legCycle + i * 0.8) * 4;
          const startX = side * 12;
          const startY = -2 + i * 5;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + side * 10, startY + legPhase);
          ctx.lineTo(startX + side * 14, startY + 8 + legPhase);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const drawVisualStage = () => {
      ctx.clearRect(0, 0, width, height);

      // Mouse Lerp Smooth Movement
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Rotasi bola dipengaruhi oleh scroll
      const scrollSpeed = window.scrollY * 0.002;
      sphereAngle += 0.008 + scrollSpeed;
      crabWalkAngle += 0.015 + scrollSpeed * 1.5;

      const centerX = width * 0.5 + mouseX * 20;
      const centerY = height * 0.5 + mouseY * 20;
      const radius = Math.min(width, height) * 0.32;

      ctx.save();
      ctx.translate(centerX, centerY);

      // --- A. DRAW BOLA 3D PARTIKEL ---
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
        
        const hue = 10 + (z / radius) * 30; // Merah ke Gold
        ctx.fillStyle = `hsla(${hue}, 95%, 60%, ${alpha})`;
        ctx.fill();
      }

      // --- B. DRAW KEPITING MERANGKAK DI ATAS BOLA ---
      // Posisi kepiting berada di sepanjang kurva lingkaran atas bola
      const crabX = Math.cos(crabWalkAngle) * (radius * 0.95);
      const crabY = -radius * 0.85 + Math.sin(crabWalkAngle * 2) * 8; 
      const crabScale = 0.85 + Math.sin(crabWalkAngle) * 0.15;

      drawProceduralCrab(crabX, crabY, crabScale, crabWalkAngle * 5);

      ctx.restore();
      requestAnimationFrame(drawVisualStage);
    };

    drawVisualStage();
  }

  // Transisi Navbar saat di-scroll
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

  // Scroll Reveal Observer
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