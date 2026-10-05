/* ZUT-RT: JavaScript interactivity
   Adds behaviour only. No page content is changed; all styles it needs are injected below. */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Injected styles ---------- */
  const style = document.createElement('style');
  style.textContent = `
    .zt-progress{position:fixed;top:0;left:0;height:4px;width:0;background:#1a237e;z-index:1100}
    nav{transition:box-shadow .3s ease,padding .3s ease}
    nav.zt-scrolled{box-shadow:0 4px 18px rgba(0,0,0,.25)}
    .links a.active{border-bottom:3px solid #fff}
    .zt-reveal{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}
    .zt-reveal.zt-show{opacity:1;transform:none}
    .features-grid div,.team-grid div{transition:transform .25s ease,box-shadow .25s ease,background-color .25s ease}
    .features-grid div:hover,.team-grid div:hover{transform:translateY(-6px);box-shadow:0 12px 24px rgba(0,0,0,.25)}
    .zt-hero-in{opacity:0;animation:ztHero .8s ease forwards}
    @keyframes ztHero{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
    .zt-top{position:fixed;right:24px;bottom:24px;width:48px;height:48px;border:none;border-radius:50%;
      background:#ff6f00;color:#fff;font-size:22px;cursor:pointer;z-index:1000;opacity:0;pointer-events:none;transition:opacity .25s ease,background .2s ease}
    .zt-top.show{opacity:1;pointer-events:auto}
    .zt-top:hover{background:#051ad6}
    .zt-top:focus-visible{outline:3px solid #ffb95e;outline-offset:2px}
    .zt-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);max-width:90vw;padding:14px 22px;border-radius:8px;
      color:#fff;font-size:16px;z-index:1200;opacity:0;pointer-events:none;transition:opacity .3s ease,transform .3s ease}
    .zt-toast.show{opacity:1;transform:translate(-50%,0)}
    .zt-toast.ok{background:#1f9d5b}
    .zt-toast.error{background:#c62828}
    .contact-right .invalid{outline:2px solid #ff6b6b}
    @media (max-width:768px){.zt-top{right:16px;bottom:16px}}
  `;
  document.head.appendChild(style);

  /* ---------- Offset anchor jumps so the fixed nav doesn't cover headings ---------- */
  const nav = document.querySelector('nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileLinks = document.querySelector('.links');

  /* ---------- Mobile navigation ---------- */
  if (menuToggle && mobileLinks) {
    menuToggle.addEventListener('click', () => {
      const open = mobileLinks.classList.toggle('mobile-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });

    mobileLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileLinks.classList.remove('mobile-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        mobileLinks.classList.remove('mobile-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
      }
    });
  }
  const setOffset = () => {
    document.documentElement.style.scrollPaddingTop = (nav ? nav.offsetHeight : 0) + 'px';
  };
  setOffset();
  window.addEventListener('resize', setOffset);

  /* ---------- Scroll progress bar, nav shadow, back-to-top ---------- */
  const bar = document.createElement('div');
  bar.className = 'zt-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);

  const topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'zt-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '&#8593;';
  document.body.appendChild(topBtn);
  topBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    topBtn.classList.toggle('show', window.scrollY > 600);
    if (nav) nav.classList.toggle('zt-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Highlight the nav link of the section in view ---------- */
  const links = [...document.querySelectorAll('.links a[href^="#"]')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) spy.observe(target);
  });

  if (reduceMotion) { initForm(); return; }

  /* ---------- Hero entrance ---------- */
  document.querySelectorAll('.hero-content > *').forEach((el, i) => {
    el.classList.add('zt-hero-in');
    el.style.animationDelay = (0.15 + i * 0.2) + 's';
  });

  /* ---------- Reveal cards and sections as they scroll into view ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('zt-show');
      obs.unobserve(el);
      // Remove the helper classes afterwards so hover effects work normally
      setTimeout(() => {
        el.classList.remove('zt-reveal', 'zt-show');
        el.style.transitionDelay = '';
      }, 1000);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(
    'section:not(#home) h2, #problem p, #solution p, .features-grid > div, .team-grid > div, .contact-left, .contact-right'
  ).forEach(el => {
    const siblings = el.parentElement ? [...el.parentElement.children] : [];
    const index = siblings.indexOf(el);
    el.classList.add('zt-reveal');
    el.style.transitionDelay = ((index % 5) * 0.08) + 's'; // gentle stagger within a grid
    reveal.observe(el);
  });

  initForm();

  /* ---------- Contact form: validation and feedback ---------- */
  function initForm() {
    const form = document.querySelector('.contact-right form');
    if (!form) return;
    form.noValidate = true;

    const toast = document.createElement('div');
    toast.className = 'zt-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    let toastTimer;
    const showToast = (text, type) => {
      toast.textContent = text;
      toast.className = 'zt-toast show ' + type;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
    };

    const fields = [...form.querySelectorAll('input, textarea')];
    fields.forEach(f => f.addEventListener('input', () => f.classList.remove('invalid')));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const [first, , email] = fields;
      fields.forEach(f => f.classList.remove('invalid'));

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      const bad = fields.filter(f => (f === email ? !emailOk : f.value.trim() === ''));

      if (bad.length) {
        bad.forEach(f => f.classList.add('invalid'));
        bad[0].focus();
        showToast(email.value.trim() && !emailOk && bad.length === 1
          ? 'Enter a valid email address.'
          : 'Fill in every field before submitting.', 'error');
        return;
      }

      // Front-end only: connect a backend (e.g. Formspree or your own API) here to deliver the message.
      showToast('Thank you, ' + first.value.trim() + '. Your message has been sent.', 'ok');
      form.reset();
    });
  }
});
