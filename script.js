// Hero slideshow
const slides = document.querySelectorAll('.hero-slide');
let current = 0;
if (slides.length) {
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 3000);
}

// Mobile nav toggle
const toggle = document.querySelector('.nav__toggle');
const links  = document.getElementById('nav-links');

toggle?.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

// Close nav on link click (mobile)
links?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  });
});

// Newsletter form – Ecomail
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type="submit"]');
  const msg  = document.getElementById('form-msg');
  const name  = form.name.value.trim();
  const email = form.email.value.trim();

  btn.disabled = true;
  btn.textContent = 'Odesílám…';

  const payload = new URLSearchParams({
    'subscriber[email]': email,
    'subscriber[name]':  name
  });

  try {
    await fetch('https://holkyvdatech.ecomailapp.cz/public/subscribe/2/2bb287d15897fe2f9d89c882af9a3a8b', {
      method: 'POST',
      mode:   'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:   payload.toString()
    });
    // no-cors → odpověď nelze číst, ale požadavek Ecomail přijme
    btn.textContent = '✓ Přihlášeno!';
    btn.style.background = '#1a5233';
    msg.textContent = 'Zkontroluj e-mail – pošleme ti potvrzení.';
    msg.style.color = 'var(--green)';
    form.reset();
  } catch {
    btn.disabled = false;
    btn.textContent = 'Přihlásit se k odběru';
    msg.textContent = 'Něco se nepovedlo, zkus to prosím znovu.';
    msg.style.color = '#c0392b';
  }
}

// Scroll-in animations
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  }),
  { threshold: 0.1 }
);
document.querySelectorAll('.card, .event-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .4s ease, transform .4s ease';
  observer.observe(el);
});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.visible').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});

// Polyfill visible class application
document.querySelectorAll('.card, .event-card').forEach(el => {
  el.addEventListener('transitionend', () => {}, { once: true });
});

// Apply visible styles when IntersectionObserver fires
const styleObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      styleObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.1 }
);
document.querySelectorAll('.card, .event-card').forEach(el => styleObserver.observe(el));
