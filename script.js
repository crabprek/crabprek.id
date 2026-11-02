/* CRABPREK SCROLL-DRIVEN CANVAS ENGINE */
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

    const particleCount = 100;
    let angle = 0;

    const drawVisualStage = () => {
      ctx.clearRect(0, 0, width, height);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Rotasi berbasis guliran halaman (scroll-driven rotation)
      const scrollOffset = window.scrollY * 0.003;
      angle += 0.008 + scrollOffset * 0.01;

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
        
        const hue = 10 + (z / radius) * 30;
        ctx.fillStyle = `hsla(${hue}, 95%, 60%, ${alpha})`;
        ctx.fill();
      }

      ctx.restore();
      requestAnimationFrame(drawVisualStage);
    };

    drawVisualStage();
  }

  // Transisi Navbar saat di-scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.background = 'rgba(9, 10, 15, 0.96)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
      navbar.style.height = '70px';
    } else {
      navbar.style.background = 'rgba(9, 10, 15, 0.85)';
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