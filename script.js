/* ==========================================================================
   PORTFOLIO WEBSITE JAVASCRIPT (INTERACTIVE CANVAS & SCROLL ENGINE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Interactive Canvas Rendering Engine (Visual Objek 3D Sinematik)
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

    // Mouse Move Parallax Tracker
    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Particle Sphere Rendering
    const particleCount = 100;
    let angle = 0;

    const drawVisualStage = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse positioning
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      angle += 0.008;

      const centerX = width * 0.5 + mouseX * 20;
      const centerY = height * 0.5 + mouseY * 20;
      const radius = Math.min(width, height) * 0.32;

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi + angle;

        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        const scale = (z + radius * 1.5) / (radius * 2);
        const alpha = Math.max(0.1, scale * 0.75);

        ctx.beginPath();
        ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);

        // Dynamic Glowing Hue
        const hue = 230 + (z / radius) * 40;
        ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${alpha})`;
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = `hsla(${hue}, 85%, 60%, 0.8)`;
        ctx.fill();
      }

      ctx.restore();
      requestAnimationFrame(drawVisualStage);
    };

    drawVisualStage();
  }

  // 2. Navbar Background Scroll Shift
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.background = 'rgba(9, 10, 15, 0.95)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
      navbar.style.height = '70px';
    } else {
      navbar.style.background = 'rgba(9, 10, 15, 0.75)';
      navbar.style.boxShadow = 'none';
      navbar.style.height = '80px';
    }
  });

  // 3. Scroll Reveal Observer (.reveal)
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => revealObserver.observe(el));

  // 4. Smooth Anchor Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const elem = document.querySelector(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});