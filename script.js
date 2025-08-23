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

/* ========== PHONE INPUT FORMAT & VALIDATION (ACCEPT 9–11 DIGITS) ========== */
const phoneInput = document.getElementById('whatsapp');
const whatsappError = document.getElementById('whatsappError');

// (Opsional) DDD válidos – remova se não quiser validar
const DDD_VALIDOS = new Set([
  '11','12','13','14','15','16','17','18','19',
  '21','22','24','27','28',
  '31','32','33','34','35','37','38',
  '41','42','43','44','45','46',
  '47','48','49',
  '51','53','54','55',
  '61','62','63','64','65','66','67','68','69',
  '71','73','74','75','77','79',
  '81','82','83','84','85','86','87','88','89',
  '91','92','93','94','95','96','97','98','99'
]);

if (phoneInput) {
  phoneInput.addEventListener('input', e => {
    let digits = e.target.value.replace(/\D/g, '').slice(0,11);
    if (!digits.length) {
      e.target.value = '';
      whatsappError.textContent = '';
      return;
    }
    if (digits.length <= 2) {
      e.target.value = '(' + digits;
      whatsappError.textContent = '';
      return;
    }

    const ddd = digits.slice(0,2);
    const rest = digits.slice(2);
    const isCelularStyle = rest[0] === '9';

    let formatted;
    if (isCelularStyle) {
      if (rest.length <= 5) {
        formatted = `(${ddd}) ${rest}`;
      } else {
        formatted = `(${ddd}) ${rest.slice(0,5)}-${rest.slice(5,9)}`;
      }
    } else {
      if (rest.length <= 4) {
        formatted = `(${ddd}) ${rest}`;
      } else {
        formatted = `(${ddd}) ${rest.slice(0,4)}-${rest.slice(4,8)}`;
      }
    }

    e.target.value = formatted;
    whatsappError.textContent = '';
    phoneInput.removeAttribute('aria-invalid');
  });

  // Optional: handle paste to sanitize quickly
  phoneInput.addEventListener('paste', e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const digits = text.replace(/\D/g,'').slice(0,11);
    phoneInput.value = digits;
    phoneInput.dispatchEvent(new Event('input'));
  });
}

/* ========== FORM SUBMISSION (ACCEPT 9–11 DIGITS) ========== */
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
    whatsappError.textContent = '';
    phoneInput?.removeAttribute('aria-invalid');

    const raw = phoneInput.value.replace(/\D/g,'');
    const len = raw.length;

    if (len < 9 || len > 11) {
      whatsappError.textContent = 'Digite entre 9 e 11 dígitos (DDD + número).';
      phoneInput?.setAttribute('aria-invalid','true');
      return;
    }

    if (len >= 3) {
      const ddd = raw.slice(0,2);
      if (!DDD_VALIDOS.has(ddd)) {
        whatsappError.textContent = 'DDD inválido.';
        phoneInput?.setAttribute('aria-invalid','true');
        return;
      }
    }

    if (len === 11 && raw[2] !== '9') {
      whatsappError.textContent = 'Para 11 dígitos, deve haver 9 após o DDD.';
      phoneInput?.setAttribute('aria-invalid','true');
      return;
    }

    if (len === 10 && raw[2] === '9') {
      // Se quiser permitir mesmo assim, comente as 2 linhas abaixo.
      whatsappError.textContent = 'Parece celular incompleto (faltando 1 dígito).';
      phoneInput?.setAttribute('aria-invalid','true');
      return;
    }

    let tipo;
    if (len === 11) tipo = 'celular';
    else if (len === 10) tipo = 'fixo';
    else tipo = 'parcial';

    submitBtn.disabled = true;
    submitText.hidden = true;
    submitLoading.hidden = false;

    const payload = {
      numero_wa: '+55' + raw,
      tipo,
      length: len,
      referrer: window.location.href
    };

    try {
      const res = await fetch('https://poplive-backend.onrender.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.ok) {
        submitSuccess.textContent = 'Cadastro enviado!';
        setTimeout(() => {
          closeModal();
          form.reset();
          submitSuccess.textContent = '';
        }, 1800);
      } else {
        submitError.textContent = result.message || 'Erro ao enviar.';
      }
    } catch (err) {
      console.error(err);
      submitError.textContent = 'Falha de conexão. Tente novamente.';
    } finally {
      submitBtn.disabled = false;
      submitText.hidden = false;
      submitLoading.hidden = true;
    }
  });
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
    'CRIE SUA CONTA AGORA E GANHE BÔNUS GRÁTIS!',
    'CADASTRE-SE HOJE E RECEBA SEU PRÊMIO GRATUITO!',
    'ABRA SUA CONTA E GARANTA SEU BÔNUS DE BOAS-VINDAS!',
    'REGISTRE-SE JÁ E APROVEITE SEU BÔNUS GRÁTIS!',
    'FAÇA SEU CADASTRO E RECEBA RECOMPENSAS IMEDIATAS!',
    'ENTRE AGORA E GANHE BÔNUS EXCLUSIVO GRÁTIS!',
    'CADASTRE-SE EM SEGUNDOS E GANHE BÔNUS NA HORA!',
    'CRIE SUA CONTA GRÁTIS E RECEBA BÔNUS ESPECIAL!',
    'REGISTRE-SE E DESBLOQUEIE SEU BÔNUS GRATUITO!'
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

/* === VIDEO FALLBACK HANDLER === */
(function initHeroVideoFallback(){
  const video = document.querySelector('.banner-video');
  const fallback = document.querySelector('.banner-video-fallback');
  if (!video) return;

  function showFallback() {
    if (!fallback) return;
    if (!fallback.hidden) return;
    fallback.hidden = false;
    // Hapus video supaya tidak tetap memegang resource
    try { video.pause(); } catch(e){}
    video.remove();
  }

  // 1. Browser tidak punya dukungan video element (sangat jarang modern)
  if (!('HTMLVideoElement' in window)) {
    showFallback();
    return;
  }

  // 2. Prefers-reduced-motion → langsung fallback (opsional)
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showFallback();
    return;
  }

  // 3. Error decoding / load
  video.addEventListener('error', showFallback);

  // 4. Autoplay test
  // (Kalau gagal, kita fallback – atau bisa pilih: tampilkan kontrol)
  try {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {
        // Autoplay gagal (biasanya video tidak muted; tapi kita sudah muted)
        showFallback();
      });
    }
  } catch(e) {
    showFallback();
  }

  // 5. Timeout safeguard: kalau 3 detik belum dapat frame
  let gotFrame = false;
  const canPlayHandler = () => { gotFrame = true; };
  video.addEventListener('loadeddata', canPlayHandler, { once:true });
  setTimeout(() => {
    if (!gotFrame) showFallback();
  }, 3000);
})();
