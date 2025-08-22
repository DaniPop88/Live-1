/* ========== MARQUEE (duplica para loop suave) ========== */
(function initMarquee() {
  const marqueeInner = document.getElementById('mainMarquee');
  if (!marqueeInner) return;
  const parentWidth = marqueeInner.parentElement.offsetWidth;
  while (marqueeInner.scrollWidth < parentWidth * 2) {
    marqueeInner.innerHTML += marqueeInner.innerHTML;
  }
})();

/* ========== MODAL FOCUS TRAP ========== */
const modal = document.getElementById('registrationModal');
const openButtons = document.querySelectorAll('[data-open-modal="registrationModal"]');
const closeButtons = modal.querySelectorAll('[data-close-modal]');
let lastFocusedElement = null;

function getFocusable(container) {
  return [...container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.disabled && !el.getAttribute('aria-hidden'));
}

function openModal() {
  lastFocusedElement = document.activeElement;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  const focusables = getFocusable(modal);
  focusables[0]?.focus();
  document.addEventListener('keydown', trapHandler);
  modal.addEventListener('click', backdropClose);
}

function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
  document.removeEventListener('keydown', trapHandler);
  modal.removeEventListener('click', backdropClose);
  if (lastFocusedElement) lastFocusedElement.focus();
}

function trapHandler(e) {
  if (e.key === 'Escape') {
    closeModal();
    return;
  }
  if (e.key === 'Tab') {
    const focusables = getFocusable(modal);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
}

function backdropClose(e) {
  if (e.target === modal) closeModal();
}

openButtons.forEach(btn => btn.addEventListener('click', openModal));
closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
});

/* ========== SLIDER ========== */
const slider = document.querySelector('[data-slider]');
if (slider) {
  const slides = slider.querySelectorAll('.banner-slide');
  const prevBtn = slider.querySelector('.slide-nav.prev');
  const nextBtn = slider.querySelector('.slide-nav.next');
  let currentSlide = 0;
  let slideInterval;
  const SLIDE_DELAY = 3000;

  function showSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  }
  function nextSlide() { showSlide(currentSlide + 1); }
  function prevSlide() { showSlide(currentSlide - 1); }
  function startAuto() { slideInterval = setInterval(nextSlide, SLIDE_DELAY); }
  function stopAuto() { clearInterval(slideInterval); }
  function restartAuto() { stopAuto(); startAuto(); }

  nextBtn.addEventListener('click', () => { nextSlide(); restartAuto(); });
  prevBtn.addEventListener('click', () => { prevSlide(); restartAuto(); });
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);
  startAuto();
}

/* ========== PHONE INPUT FORMAT & VALIDATION ========== */
const phoneInput = document.getElementById('whatsapp');
const whatsappError = document.getElementById('whatsappError');

if (phoneInput) {
  phoneInput.addEventListener('input', e => {
    let digits = e.target.value.replace(/\D/g, '').slice(0,11);
    if (digits.length <= 2) {
      digits = digits.replace(/(\d{0,2})/, '($1');
    } else if (digits.length <= 7) {
      digits = digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
      digits = digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    e.target.value = digits;
    whatsappError.textContent = '';
  });
}

/* ========== FORM SUBMISSION (SIMULATED) ========== */
const existingPhones = new Set(['11987654321','21123456789','85999887766']);
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitLoading = document.getElementById('submitLoading');
const submitError = document.getElementById('submitError');
const submitSuccess = document.getElementById('submitSuccess');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitError.textContent = '';
    submitSuccess.textContent = '';

    const raw = phoneInput.value.replace(/\D/g,'');
    if (raw.length !== 11) {
      whatsappError.textContent = 'Número deve ter 11 dígitos (DDD + número).';
      return;
    }
    if (existingPhones.has(raw)) {
      submitError.textContent = 'Este número já está cadastrado em nosso sistema!';
      return;
    }

    submitBtn.disabled = true;
    submitText.hidden = true;
    submitLoading.hidden = false;

    const payload = {
      whatsapp: phoneInput.value.trim(),
      timestamp: new Date().toISOString(),
      ip: await getUserIP()
    };

    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log('Registration data:', payload);
      submitSuccess.textContent = 'Cadastro realizado com sucesso! Em breve entraremos em contato.';
      setTimeout(() => {
        closeModal();
        form.reset();
        submitSuccess.textContent = '';
      }, 2200);
    } catch (err) {
      console.error(err);
      submitError.textContent = 'Erro ao enviar cadastro. Tente novamente.';
    } finally {
      submitBtn.disabled = false;
      submitText.hidden = false;
      submitLoading.hidden = true;
    }
  });
}

async function getUserIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return 'Unknown';
  }
}

/* ========== STAGGER ENTRANCE FOR PLATFORM LINKS ========== */
(function platformEntrance() {
  const links = document.querySelectorAll('.platform-link');
  if (!links.length) return;
  links.forEach((el,i) => el.style.setProperty('--stagger', i));
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:.2 });
  links.forEach(l => io.observe(l));
})();

/* ========== HOVER RIPPLE (mouse position) ========== */
document.addEventListener('mousemove', e => {
  if (!e.target.classList?.contains('platform-link')) return;
  let ripple = e.target.querySelector('.ripple');
  if (!ripple) {
    ripple = document.createElement('span');
    ripple.className = 'ripple';
    e.target.appendChild(ripple);
  }
  const rect = e.target.getBoundingClientRect();
  const rx = ((e.clientX - rect.left) / rect.width) * 100;
  const ry = ((e.clientY - rect.top) / rect.height) * 100;
  ripple.style.setProperty('--rx', rx + '%');
  ripple.style.setProperty('--ry', ry + '%');
});

/* ========== ROTATING PROMO MESSAGES ========== */
(function rotatingMessages(){
  const container = document.querySelector('[data-rotating-msg]');
  if(!container) return;
  const msgs = [
    'REGISTRE UMA CONTA E RECEBA SEU BÔNUS GRÁTIS!',
    '50 GANHADORES POR DIA – NÃO FIQUE DE FORA!',
    'PARTICIPE AGORA E DUPLIQUE SUAS CHANCES!',
    'ENTRE NO GRUPO E VEJA OS VENCEDORES AO VIVO!'
  ];
  let idx = 0;
  msgs.forEach((m,i)=>{
    const span = document.createElement('div');
    span.className = 'rot-msg' + (i===0 ? ' active':'');
    span.textContent = m;
    container.appendChild(span);
  });
  setInterval(()=>{
    const all = container.querySelectorAll('.rot-msg');
    all[idx].classList.remove('active');
    idx = (idx+1)%msgs.length;
    all[idx].classList.add('active');
  }, 4000);
})();

/* ========== ADAPTIVE MARQUEE SPEED (opcional) ========== */
(function adaptiveMarqueeSpeed(){
  const width = window.innerWidth;
  const root = document.documentElement;
  if (width < 420) {
    root.style.setProperty('--marquee-speed','40s');
  }
})();
