/* CRABPREK INTERACTIVE JAVASCRIPT ENGINE */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Scroll Reveal Observer (.reveal)
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));

  // 2. Navbar Background Shift saat di-scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.style.background = 'rgba(11, 12, 16, 0.96)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
    } else {
      navbar.style.background = 'rgba(11, 12, 16, 0.92)';
      navbar.style.boxShadow = 'none';
    }
  });

});s