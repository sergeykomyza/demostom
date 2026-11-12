/* ============================================================
   Эмаль — GSAP хореография
   Правила скилла: анимируем только transform/opacity, единая
   кривая cubic-bezier(0.22,1,0.36,1) через CustomEase «base»,
   prefers-reduced-motion отключает всё движение.
   Единственное осознанное отступление: аккордеон FAQ плавно
   меняет height (иначе раскрытие выглядит рывком).
   ============================================================ */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const preloader = document.querySelector('.preloader');

  // Фоновое видео — это движение: при reduced motion не запускаем его
  const heroVideo = document.querySelector('.hero-media');
  if (heroVideo && prefersReduced) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }

  /* ---- FAQ, форма и подбор визита работают даже без GSAP ---- */
  initFaq();
  initForm();
  initPlanner();

  if (!hasGsap) {
    if (preloader) preloader.remove();
    initAnchors(null);
    initMenu(false);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('base', '0.22, 1, 0.36, 1');
  const EASE = 'base';

  /* ---- Lenis: плавный скролл + интеграция с ScrollTrigger ---- */
  let lenis = null;
  if (!prefersReduced && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const canMove = !prefersReduced;

  /* ---- Прелоадер и вход хиро ---- */
  if (prefersReduced) {
    if (preloader) preloader.remove();
  } else {
    playIntro();
  }

  if (canMove) {
    // Порядок инициализации = порядок документа: пины должны создаваться
    // сверху вниз, иначе их координаты посчитаются до чужих pin-распорок
    initTagline();
    initSystem();
    initServicesTrack();
    initReviewsDeck();
    initReveals();
    initCounters();
    initStepsDot();
    initGalleryParallax();
    initProblemFx();
    initHeroExit();
    initVelocityFx();
    initNav();
    initFloatAndParallax();
    initMagnetic();
    initRotator();
    initTitleLines();
    initMediaZoom();
    initReviewsDrift();
    initDoctorsGhost();
    initFinaleFx();
    initChapterRail();
  }
  initAnchors(lenis);
  initMenu(canMove);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // matchMedia-контексты откладывают создание пинов на кадр — из-за этого
  // load/fonts могли пересчитать триггеры ДО появления pin-распорок.
  // Принудительно пересчитываем после того, как все сцены точно созданы.
  if (hasGsap) {
    requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    setTimeout(() => ScrollTrigger.refresh(), 300);
    setTimeout(() => ScrollTrigger.refresh(), 1200);
  }

  /* ============================================================ */

  function playIntro() {
    const tl = gsap.timeline();

    // Начальные состояния прячем только через JS: без скрипта страница полностью видима
    gsap.set('.hero-title .line-inner', { yPercent: 110 });
    gsap.set('.hero-copy [data-intro="fade"]', { y: 24, autoAlpha: 0 });
    gsap.set('.hero-visual [data-intro="card"]', { y: 32, autoAlpha: 0 });

    tl.to('.preloader-fill', { scaleX: 1, duration: 0.7, ease: EASE })
      .to('.preloader', { yPercent: -100, duration: 0.6, ease: EASE }, '+=0.05')
      .set('.preloader', { pointerEvents: 'none' })
      .to('.hero-title .line-inner', { yPercent: 0, duration: 0.8, ease: EASE, stagger: 0.09 }, '-=0.35')
      .to('.hero-copy [data-intro="fade"]', { y: 0, autoAlpha: 1, duration: 0.7, ease: EASE, stagger: 0.07 }, '-=0.55')
      .to('.hero-visual [data-intro="card"]', { y: 0, autoAlpha: 1, duration: 0.8, ease: EASE, stagger: 0.08 }, '-=0.6')
      .set('.preloader', { display: 'none' });
  }

  /* ---- Появление секций: подъём на 32px + фейд, один раз (B7) ---- */
  function initReveals() {
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      // Заголовки секций усиливает initTitleLines — не дублируем движение
      if (el.classList.contains('section-title')) return;
      gsap.from(el, {
        y: 32,
        autoAlpha: 0,
        duration: 0.8,
        ease: EASE,
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
      // «Как обычно / как у нас»: карточки съезжаются с разных сторон
      if (group.classList.contains('problem-grid')) {
        gsap.from(group.children, {
          x: (i) => (i === 0 ? -40 : 40),
          autoAlpha: 0,
          duration: 0.9,
          ease: EASE,
          stagger: 0.12,
          clearProps: 'transform',
          scrollTrigger: { trigger: group, start: 'top 82%', once: true }
        });
        return;
      }
      gsap.from(group.children, {
        y: 32,
        autoAlpha: 0,
        duration: 0.8,
        ease: EASE,
        stagger: 0.08,
        clearProps: 'transform',
        scrollTrigger: { trigger: group, start: 'top 82%', once: true }
      });
    });

    // Пункты списков проблемы проявляются следом за карточками
    gsap.utils.toArray('.problem-card .check-list').forEach((list) => {
      gsap.from(list.children, {
        y: 14,
        autoAlpha: 0,
        duration: 0.5,
        ease: EASE,
        stagger: 0.07,
        clearProps: 'transform',
        scrollTrigger: { trigger: list, start: 'top 88%', once: true }
      });
    });
    // Карточки услуг и отзывов не трогаем: ими владеют закреплённые
    // сцены (initServicesTrack / initReviewsDeck) или их мобильные ветки
  }

  /* ---- Tagline: сцена-высказывание (десктоп) / пословное проявление (мобайл) ---- */
  function initTagline() {
    const tag = document.querySelector('.tagline-text');
    const section = document.querySelector('.tagline');
    if (!tag || !section) return;

    // Оборачиваем слова, сохраняя подсветку «на первом приёме»
    const wrapWords = (text) => text.trim().split(/\s+/).map((w) => '<span class="tagline-word">' + w + '</span>').join(' ');
    let html = '';
    Array.prototype.forEach.call(tag.childNodes, (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        html += wrapWords(node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('tagline-hl')) {
        html += '<span class="tagline-hl"><span class="tagline-hl-line" aria-hidden="true"></span>' + wrapWords(node.textContent) + '</span>';
      }
    });
    if (html) tag.innerHTML = html;

    const words = tag.querySelectorAll('.tagline-word');
    const line = tag.querySelector('.tagline-hl-line');
    const mm = gsap.matchMedia();

    // Десктоп: закреплённая сцена — слова вспыхивают, под фразой рисуется линия
    mm.add('(min-width: 1025px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      section.classList.add('tagline--scene');
      if (line) gsap.set(line, { scaleX: 0 });

      const tl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => document.body.classList.toggle('is-scene', self.isActive)
        }
      });

      tl.fromTo(words, { opacity: 0.18 }, { opacity: 1, stagger: 0.06, duration: words.length * 0.06, ease: 'none' }, 0)
        .to(tag, { scale: 1.02, transformOrigin: 'left center', duration: 2, ease: 'none' }, 0);
      if (line) tl.to(line, { scaleX: 1, duration: 0.6 }, words.length * 0.06 + 0.1);
      tl.to({}, { duration: 0.5 }); // короткая пауза «на высказывании»

      return () => {
        section.classList.remove('tagline--scene');
        if (line) gsap.set(line, { scaleX: 1 });
      };
    });

    // Мобильный: прежнее пословное проявление при скролле
    mm.add('(max-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(words, { opacity: 0.3 }, {
        opacity: 1,
        ease: EASE,
        stagger: 0.05,
        scrollTrigger: { trigger: tag, start: 'top 78%', end: 'top 28%', scrub: 0.6 }
      });
    });
  }

  /* ---- Счётчики цифр ---- */
  function initCounters() {
    const fmt = (v, dec) => v.toLocaleString('ru-RU', { minimumFractionDigits: dec, maximumFractionDigits: dec });

    gsap.utils.toArray('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const obj = { v: 0 };
      el.textContent = fmt(0, dec);

      gsap.to(obj, {
        v: end,
        duration: 1.4,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = fmt(obj.v, dec); }
      });
    });
  }

  /* ---- Шаги: линия прорисовывается, точка бежит, номера «зажигаются» ---- */
  function initStepsDot() {
    const wrap = document.querySelector('.steps-wrap');
    const line = document.querySelector('.steps-line');
    const dot = document.querySelector('.steps-dot');
    if (!wrap || !line || !dot) return;

    const steps = gsap.utils.toArray('.step', wrap);
    const mm = gsap.matchMedia();

    // Десктоп: три шага в ряд — подсветка следует за прогрессом точки
    mm.add('(min-width: 1025px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: wrap,
        start: 'top 75%',
        end: 'bottom 55%',
        onUpdate: (self) => {
          const p = self.progress;
          steps.forEach((step, i) => {
            step.classList.toggle('is-active', p >= i / steps.length);
          });
        }
      });

      gsap.fromTo(line, { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        transformOrigin: 'left center',
        scrollTrigger: { trigger: wrap, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 }
      });

      gsap.fromTo(dot, { x: 0 }, {
        x: () => line.clientWidth - 10,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top 75%',
          end: 'bottom 55%',
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });

      return () => steps.forEach((s) => s.classList.remove('is-active'));
    });

    // Мобильный: линия скрыта, номера зажигаются по мере прохода
    mm.add('(max-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const triggers = steps.map((step) => ScrollTrigger.create({
        trigger: step,
        start: 'top 72%',
        end: 'bottom 45%',
        toggleClass: { targets: step, className: 'is-active' }
      }));
      return () => steps.forEach((s) => s.classList.remove('is-active'));
    });
  }

  /* ---- Заголовки секций: маска-подъём по словам (язык hero) ---- */
  function initTitleLines() {
    const titles = gsap.utils.toArray('[data-reveal].section-title, .system-title-main, .planner-title');
    titles.forEach((title) => {
      const words = title.textContent.trim().split(/\s+/);
      title.innerHTML = words.map((w) => '<span class="t-word"><span class="t-word-in">' + w + '</span></span>').join(' ');
      gsap.fromTo(title.querySelectorAll('.t-word-in'), { yPercent: 115 }, {
        yPercent: 0,
        duration: 0.7,
        ease: EASE,
        stagger: 0.035,
        scrollTrigger: { trigger: title, start: 'top 85%', once: true }
      });
    });
  }

  /* ---- Фото врачей: приближение при входе (фото услуг обрабатывает initServicesTrack) ---- */
  function initMediaZoom() {
    gsap.utils.toArray('.doctor-photo img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.15 }, {
        scale: 1,
        duration: 1.1,
        ease: EASE,
        clearProps: 'transform',
        scrollTrigger: { trigger: img.closest('.doctor-card'), start: 'top 85%', once: true }
      });
    });
  }

  /* ---- Отзывы на мобильном: лёгкий вертикальный дрейф карточек ---- */
  function initReviewsDrift() {
    const pin = document.querySelector('.reviews-pin');
    if (!pin) return;
    gsap.matchMedia().add('(max-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.review-card').forEach((card, i) => {
        gsap.fromTo(card, { yPercent: i % 2 ? 3 : -3 }, {
          yPercent: i % 2 ? -3 : 3,
          ease: 'none',
          scrollTrigger: { trigger: pin, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        });
      });
    });
  }

  /* ---- Параллакс фото: галерея и фоны секций ---- */
  function initGalleryParallax() {
    gsap.utils.toArray('.gallery-media img, .section-bg').forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -6, scale: 1.12 },
        {
          yPercent: 6,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.gallery-item'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6
          }
        }
      );
    });
  }

  /* ---- Навигация: прячется при скролле вниз, возвращается вверх ---- */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let lastY = 0;
    let hidden = false;

    const show = () => {
      if (!hidden) return;
      hidden = false;
      gsap.to(nav, { yPercent: 0, duration: 0.4, ease: EASE });
    };
    const hide = () => {
      if (hidden) return;
      hidden = true;
      gsap.to(nav, { yPercent: -140, duration: 0.4, ease: EASE });
    };

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        if (document.body.classList.contains('is-menu-open')) { show(); lastY = y; return; }
        if (y < 80) show();
        else if (y > lastY + 4) hide();
        else if (y < lastY - 4) show();
        lastY = y;
      }
    });
  }

  /* ---- Параллакс хиро: скролл, мышь, лёгкий «покой» карточек ---- */
  function initFloatAndParallax() {
    // Лёгкое дыхание карточек (канал yPercent, чтобы не спорить с параллаксом по y)
    document.querySelectorAll('.float-card').forEach((el, i) => {
      gsap.to(el, { yPercent: -4, duration: 2.4 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });

    // Скролл-параллакс визуала, декоративного текста и видео-фона
    gsap.to('.hero-visual', {
      y: 64,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('.hero-bg video', {
      yPercent: 5,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('.hero-deco', {
      yPercent: 26,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    // Мышь: слои с data-depth смещаются с разной глубиной
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const hero = document.querySelector('.hero');
    const layers = gsap.utils.toArray('[data-depth]');
    if (!hero || !layers.length) return;

    layers.forEach((el) => {
      el._depthX = gsap.quickTo(el, 'x', { duration: 0.6, ease: EASE });
      el._depthY = gsap.quickTo(el, 'y', { duration: 0.6, ease: EASE });
    });

    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      layers.forEach((el) => {
        const d = parseFloat(el.dataset.depth) || 0.1;
        el._depthX(nx * 100 * d * 10);
        el._depthY(ny * 100 * d * 10);
      });
    });
  }

  /* ---- Магнитные кнопки ---- */
  function initMagnetic() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: EASE });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: EASE });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.25);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---- Якорные ссылки через Lenis ---- */
  function initAnchors(lenisInstance) {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href === '#') { e.preventDefault(); return; }
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (lenisInstance) lenisInstance.scrollTo(target, { offset: -88, duration: 1.2 });
        else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
        if (window.__closeMobileMenu) window.__closeMobileMenu();
      });
    });
  }

  /* ---- Мобильное меню: панель + стаггер ссылок (не дольше 400мс) ---- */
  function initMenu(canAnimate) {
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.mobile-menu');
    if (!burger || !menu) return;

    let menuTl = null;
    if (canAnimate) {
      menuTl = gsap.timeline({ paused: true })
        .set(menu, { visibility: 'visible' })
        .fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: EASE })
        .fromTo('.mobile-link', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, ease: EASE, stagger: 0.03 }, '-=0.2')
        .fromTo('.mobile-extra', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, ease: EASE }, '-=0.1');
    }

    let open = false;

    function setMenu(state) {
      open = state;
      document.body.classList.toggle('is-menu-open', state);
      burger.setAttribute('aria-expanded', String(state));
      menu.setAttribute('aria-hidden', String(!state));
      if (menuTl) {
        if (state) { menuTl.timeScale(1).play(); if (lenis) lenis.stop(); }
        else { menuTl.timeScale(1.6).reverse(); if (lenis) lenis.start(); }
      } else {
        menu.style.visibility = state ? 'visible' : 'hidden';
      }
    }

    burger.addEventListener('click', () => setMenu(!open));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setMenu(false); });

    // Глобальная ссылка на setMenu для якорей
    window.__closeMobileMenu = () => { if (open) setMenu(false); };
  }

  /* ---- FAQ аккордеон (height: осознанное отступление, см. шапку файла) ---- */
  function initFaq() {
    function setFaq(item, state) {
      const btn = item.querySelector('.faq-q');
      const panel = item.querySelector('.faq-a');
      if (!btn || !panel) return;

      item.classList.toggle('is-open', state);
      btn.setAttribute('aria-expanded', String(state));

      if (hasGsap && !prefersReduced) {
        gsap.to(panel, { height: state ? 'auto' : 0, duration: 0.45, ease: 'base', onComplete: () => ScrollTrigger.refresh() });
      } else {
        panel.style.height = state ? 'auto' : '0px';
      }
    }

    document.querySelectorAll('.faq-item').forEach((item) => {
      const btn = item.querySelector('.faq-q');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        document.querySelectorAll('.faq-item.is-open').forEach((other) => {
          if (other !== item) setFaq(other, false);
        });
        setFaq(item, willOpen);
      });
    });
  }

  /* ---- Форма записи: маска, валидация, состояния (демо, без бэкенда) ---- */
  function initForm() {
    const form = document.getElementById('book-form');
    if (!form) return;

    const nameEl = form.querySelector('#f-name');
    const phoneEl = form.querySelector('#f-phone');
    const submitBtn = form.querySelector('button[type="submit"]');
    const success = document.querySelector('.form-success');

    // Маска +7 (XXX) XXX-XX-XX
    phoneEl.addEventListener('input', () => {
      let v = phoneEl.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (v && !v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '';
      if (v.length >= 1) out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 5) out += ') ' + v.slice(4, 7);
      if (v.length >= 8) out += '-' + v.slice(7, 9);
      if (v.length >= 10) out += '-' + v.slice(9, 11);
      phoneEl.value = out;
    });

    function setError(input, message) {
      const field = input.closest('.field');
      const label = field.querySelector('.field-error');
      field.classList.toggle('is-error', Boolean(message));
      if (label) label.textContent = message || '';
      return !message;
    }

    [nameEl, phoneEl].forEach((el) => {
      el.addEventListener('input', () => setError(el, ''));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const okName = setError(nameEl, nameEl.value.trim().length >= 2 ? '' : 'Введите имя, так мы к вам обратимся');
      const digits = phoneEl.value.replace(/\D/g, '');
      const okPhone = setError(phoneEl, digits.length === 11 ? '' : 'Телефон не дописан, нужно 11 цифр');

      if (!okName || !okPhone) return;

      // Демо-отправка: здесь подключается ваш бэкенд или сервис форм (см. SEO-READY.md)
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        const done = () => {
          form.hidden = true;
          if (success) {
            success.hidden = false;
            if (hasGsap && !prefersReduced) {
              gsap.from(success, { autoAlpha: 0, y: 8, duration: 0.5, ease: 'base' });
            }
          }
        };
        if (hasGsap && !prefersReduced) {
          gsap.to(form, { autoAlpha: 0, y: -8, duration: 0.4, ease: 'base', onComplete: done });
        } else {
          done();
        }
      }, 900);
    });
  }

  /* ---- Ротатор слоганов в hero: смена фразы + счётчик 01/04 ---- */
  function initRotator() {
    const wrap = document.querySelector('.hero-rotator');
    if (!wrap) return;
    const items = Array.from(wrap.querySelectorAll('.hero-rotator-item'));
    const indexEl = wrap.querySelector('[data-rotator-index]');
    if (items.length < 2) return;

    let cur = 0;
    window.setInterval(() => {
      if (document.hidden) return;
      const next = (cur + 1) % items.length;
      gsap.to(items[cur], { autoAlpha: 0, y: -14, duration: 0.4, ease: EASE });
      gsap.fromTo(items[next], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: EASE, delay: 0.16 });
      cur = next;
      if (indexEl) indexEl.textContent = String(cur + 1).padStart(2, '0');
    }, 4200);
  }

  /* ---- «Система клиники»: закреплённая история 01–04.
     Только десктоп + JS + разрешённое движение; иначе секция
     остаётся обычным стеком (класс system--enhanced не ставится). ---- */
  function initSystem() {
    const section = document.querySelector('.system');
    if (!section || typeof gsap.matchMedia !== 'function') return;

    gsap.matchMedia().add('(min-width: 1025px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      section.classList.add('system--enhanced');
      const panels = gsap.utils.toArray('.system-panel', section);
      const medias = panels.map((p) => p.querySelector('.system-media'));
      const fill = section.querySelector('.system-progress-fill');

      if (!panels.length || !fill) {
        section.classList.remove('system--enhanced');
        return;
      }

      const hold = 1;      // время «жизни» панели на экране
      const trans = 0.5;   // длительность перехода между панелями
      const total = panels.length * hold + (panels.length - 1) * trans;

      gsap.set(panels, { autoAlpha: 0, y: 56 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0 });
      gsap.set(medias, { scale: 1.06 });

      const tl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + panels.length * window.innerHeight * 0.9,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => document.body.classList.toggle('is-scene', self.isActive)
        }
      });

      tl.to(fill, { scaleX: 1, duration: total, ease: 'none' }, 0);
      tl.fromTo(medias[0], { scale: 1.06 }, { scale: 1, duration: hold + trans, ease: 'none' }, 0);

      panels.forEach((panel, i) => {
        if (i === 0) return;
        const at = i * hold + (i - 1) * trans;
        tl.to(panels[i - 1], { autoAlpha: 0, y: -56, duration: trans }, at)
          .to(panel, { autoAlpha: 1, y: 0, duration: trans }, at + trans * 0.35)
          .fromTo(medias[i], { scale: 1.06 }, { scale: 1, duration: hold + trans, ease: 'none' }, at);
      });

      // При возврате на ширину ≤1024 gsap.matchMedia сам откатит
      // инлайновые стили; класс снимаем вручную.
      return () => section.classList.remove('system--enhanced');
    });
  }

  /* ---- Подбор визита: чипы + карточка + предзаполнение формы.
     Работает и без GSAP (просто без плавной смены). ---- */
  function initPlanner() {
    const grid = document.querySelector('.planner-grid');
    if (!grid) return;

    const chips = Array.from(grid.querySelectorAll('.planner-chip'));
    const card = grid.querySelector('.planner-card');
    const fields = {
      doctor: grid.querySelector('[data-plan-doctor]'),
      step: grid.querySelector('[data-plan-step]'),
      price: grid.querySelector('[data-plan-price]'),
      time: grid.querySelector('[data-plan-time]')
    };
    const select = document.getElementById('f-service');
    const note = document.getElementById('f-note');

    // Все тексты и цены совпадают с секцией «Услуги и цены»
    const plans = {
      pain: {
        doctor: 'Терапевт — приём в день обращения',
        step: 'Осмотр, снимок и снятие боли. Обычно хватает одного визита.',
        price: 'Консультация 1 400 ₽ — вычитается из стоимости лечения',
        time: '40 минут',
        service: 'consult',
        note: 'Болит зуб — нужна помощь сегодня'
      },
      fear: {
        doctor: 'Терапевт · первый визит без лечения',
        step: 'Осмотр, снимок и разговор с врачом. Дальше — бережная анестезия или седация.',
        price: 'Консультация 1 400 ₽ — вычитается из стоимости лечения',
        time: '40 минут',
        service: 'consult',
        note: 'Боюсь стоматологов — хочу первый визит без лечения'
      },
      white: {
        doctor: 'Гигиенист',
        step: 'Ультразвуковая чистка, Air Flow и полировка зубов.',
        price: 'от 5 800 ₽',
        time: '40 минут',
        service: 'hygiene',
        note: 'Хочу чистку и белизну'
      },
      old: {
        doctor: 'Терапевт, при необходимости ортопед',
        step: 'Снимок и оценка: можно ли сохранить зуб и что делать дальше.',
        price: 'Лечение от 7 400 ₽ · коронка от 41 800 ₽',
        time: 'Первый визит — 40 минут',
        service: 'caries',
        note: 'Старая пломба или разрушен зуб — нужен осмотр'
      },
      kid: {
        doctor: 'Павел Ерёмин, детский стоматолог',
        step: 'Знакомый визит: мультик, инструменты в руки, лечение в игровой форме.',
        price: 'Консультация 1 400 ₽ — вычитается из стоимости лечения',
        time: '30–40 минут',
        service: 'kids',
        note: 'Запись для ребёнка'
      },
      check: {
        doctor: 'Терапевт и гигиенист',
        step: 'Осмотр, снимок и план: что наблюдать, а что лечить сразу.',
        price: 'Консультация 1 400 ₽ — вычитается из стоимости лечения',
        time: '40 минут',
        service: 'consult',
        note: 'Плановый осмотр'
      }
    };

    let current = 'pain';

    function paint(plan) {
      if (fields.doctor) fields.doctor.textContent = plan.doctor;
      if (fields.step) fields.step.textContent = plan.step;
      if (fields.price) fields.price.textContent = plan.price;
      if (fields.time) fields.time.textContent = plan.time;
      if (select) select.value = plan.service;
      if (note) note.value = plan.note;
    }

    function apply(key) {
      const plan = plans[key];
      if (!plan) return;
      current = key;
      if (hasGsap && !prefersReduced) {
        gsap.to(card, {
          autoAlpha: 0,
          y: 12,
          duration: 0.22,
          ease: 'base',
          onComplete: () => {
            paint(plan);
            gsap.to(card, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'base' });
          }
        });
      } else {
        paint(plan);
      }
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (chip.dataset.plan === current) return;
        chips.forEach((c) => {
          const on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        apply(chip.dataset.plan);
      });
    });

    // Форма сразу согласована с выбором по умолчанию
    if (plans[current] && select) select.value = plans[current].service;
  }

  /* ============================================================
     Сквозная скролл-хореография: hero-выезд, сцены на закреплении,
     горизонтальная лента услуг, колода отзывов, рельса глав.
     Все сцены — только десктоп + JS + разрешённое движение.
     ============================================================ */

  /* ---- Hero: кинематографичный выезд при уходе с первого экрана ---- */
  function initHeroExit() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
    })
      .to('.hero-copy', { yPercent: -7, autoAlpha: 0.25, ease: 'none' }, 0)
      .to('.hero-cards', { yPercent: -14, scale: 0.97, ease: 'none' }, 0);
  }

  /* ---- Скоростной наклон: бегущая строка чуть skew'ится от скорости
     скролла и возвращается в ноль. Только десктоп. ---- */
  function initVelocityFx() {
    const target = document.querySelector('.marquee-skew');
    if (!target) return;
    const setSkew = gsap.quickSetter(target, 'skewX', 'deg');
    const clamp = gsap.utils.clamp(-5, 5);
    const proxy = { skew: 0 };

    gsap.matchMedia().add('(min-width: 1025px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const skew = clamp(self.getVelocity() / -400);
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, {
              skew: 0,
              duration: 0.6,
              ease: 'power3.out',
              overwrite: true,
              onUpdate: () => setSkew(proxy.skew)
            });
          }
        }
      });
      return () => {
        st.kill();
        setSkew(0);
      };
    });
  }

  /* ---- Проблема: scrub-дуэль — «как обычно» гаснет, «как у нас» поднимается ---- */
  function initProblemFx() {
    const left = document.querySelector('.problem-card:not(.is-accent)');
    const right = document.querySelector('.problem-card.is-accent');
    if (!left || !right) return;
    gsap.timeline({
      scrollTrigger: { trigger: '.problem', start: 'top 40%', end: 'bottom 80%', scrub: 0.6 }
    })
      .to(left, { opacity: 0.5, scale: 0.97, ease: 'none' }, 0)
      .to(right, { scale: 1.02, ease: 'none' }, 0);
  }

  /* ---- Услуги: закреплённая горизонтальная лента (десктоп) ---- */
  function initServicesTrack() {
    const section = document.querySelector('.services');
    const grid = document.querySelector('.services-grid');
    if (!section || !grid) return;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1025px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      section.classList.add('services--track');
      const container = section.querySelector('.container');
      const cards = gsap.utils.toArray('.service-card', grid);
      const counter = section.querySelector('[data-services-index]');
      const fill = section.querySelector('.services-progress-fill');

      const getDistance = () => {
        const startLeft = container.getBoundingClientRect().left + parseFloat(getComputedStyle(container).paddingLeft);
        return Math.max(0, grid.offsetWidth - (window.innerWidth - startLeft) + 48);
      };

      const tween = gsap.to(grid, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + (getDistance() + window.innerHeight * 0.5),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => document.body.classList.toggle('is-scene', self.isActive),
          onUpdate: (self) => {
            const idx = Math.min(cards.length, Math.max(1, Math.round(self.progress * (cards.length - 1)) + 1));
            if (counter) counter.textContent = String(idx).padStart(2, '0');
            if (fill) gsap.set(fill, { scaleX: self.progress });
          }
        }
      });

      // Внутренний параллакс фото вдоль движения ленты
      cards.forEach((card) => {
        const img = card.querySelector('.service-media img');
        if (img) {
          gsap.fromTo(img, { xPercent: -4 }, {
            xPercent: 4,
            ease: 'none',
            scrollTrigger: { containerAnimation: tween, trigger: card, start: 'left right', end: 'right left', scrub: true }
          });
        }
      });

      return () => {
        section.classList.remove('services--track');
        if (counter) counter.textContent = '01';
        if (fill) gsap.set(fill, { scaleX: 0 });
      };
    });

    // Мобильный: карточки появляются каскадом, фото приближается при входе
    mm.add('(max-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.from(grid.children, {
        y: 32,
        autoAlpha: 0,
        duration: 0.8,
        ease: EASE,
        stagger: 0.08,
        clearProps: 'transform',
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true }
      });
      gsap.utils.toArray('.service-media img').forEach((img) => {
        gsap.fromTo(img, { scale: 1.15 }, {
          scale: 1,
          duration: 1.1,
          ease: EASE,
          clearProps: 'transform',
          scrollTrigger: { trigger: img.closest('.service-card'), start: 'top 85%', once: true }
        });
      });
    });
  }

  /* ---- Отзывы: закреплённая колода карточек (десктоп),
     каскадное появление на мобильном ---- */
  function initReviewsDeck() {
    const section = document.querySelector('.reviews');
    const track = document.querySelector('.reviews-track');
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1025px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      section.classList.add('reviews--deck');
      const cards = gsap.utils.toArray('.review-card', track);
      const counter = section.querySelector('[data-reviews-index]');
      if (!cards.length) {
        section.classList.remove('reviews--deck');
        return;
      }

      gsap.set(cards, { autoAlpha: 0, yPercent: 40 });
      gsap.set(cards[0], { autoAlpha: 1, yPercent: 0 });

      const tl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: () => '+=' + Math.round(cards.length * window.innerHeight * 0.85),
          onToggle: (self) => document.body.classList.toggle('is-scene', self.isActive),
          onUpdate: (self) => {
            if (!counter) return;
            const idx = Math.min(cards.length, Math.round(self.progress * (cards.length - 1)) + 1);
            counter.textContent = String(idx).padStart(2, '0');
          }
        }
      });

      cards.forEach((card, i) => {
        if (i === 0) return;
        const at = (i - 1) + 0.45;
        // Перекрёстная смена с вертикальным разведением: уходящая гаснет
        // быстрее и уходит вверх, входящая въезжает снизу — сцена не
        // пустеет, а тексты не сидят друг на друге
        tl.to(cards[i - 1], { autoAlpha: 0, yPercent: -6, scale: 0.97, duration: 0.35 }, at)
          .fromTo(card, { yPercent: 30, autoAlpha: 0 }, { autoAlpha: 1, yPercent: 0, duration: 0.55 }, at + 0.08);
      });

      return () => section.classList.remove('reviews--deck');
    });

    mm.add('(max-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.from(track.children, {
        y: 32,
        autoAlpha: 0,
        duration: 0.8,
        ease: EASE,
        stagger: 0.1,
        clearProps: 'transform',
        scrollTrigger: { trigger: '.reviews-pin', start: 'top 82%', once: true }
      });
    });
  }

  /* ---- Врачи: призрачные моно-номера въезжают вместе с карточками ---- */
  function initDoctorsGhost() {
    gsap.utils.toArray('.doctor-ghost').forEach((ghost) => {
      gsap.from(ghost, {
        yPercent: 60,
        autoAlpha: 0,
        duration: 0.8,
        ease: EASE,
        scrollTrigger: { trigger: ghost.closest('.doctor-card'), start: 'top 85%', once: true }
      });
    });
  }

  /* ---- Финал: гигантский контурный «ЭМАЛЬ» дрейфует за формой ---- */
  function initFinaleFx() {
    const deco = document.querySelector('.contact-deco');
    if (!deco) return;
    gsap.fromTo(deco, { xPercent: -4 }, {
      xPercent: 4,
      ease: 'none',
      scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });
  }

  /* ---- Рельса глав: номер текущей главы + общий прогресс страницы ---- */
  function initChapterRail() {
    const rail = document.querySelector('.chapter-rail');
    if (!rail) return;
    const numEl = rail.querySelector('[data-chapter]');
    const fill = rail.querySelector('.chapter-rail-fill');

    const chapters = gsap.utils.toArray('main .section-eyebrow')
      .map((eyebrow) => ({
        num: (eyebrow.textContent.match(/\d+/) || ['01'])[0],
        section: eyebrow.closest('section')
      }))
      .filter((item) => item.section);

    let cur = null;
    const setNum = (n) => {
      if (n === cur || !numEl) return;
      cur = n;
      numEl.textContent = n;
      gsap.fromTo(numEl, { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: EASE, overwrite: true });
    };

    chapters.forEach((item) => {
      ScrollTrigger.create({
        trigger: item.section,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => { if (self.isActive) setNum(item.num); }
      });
    });

    if (fill) {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => gsap.set(fill, { scaleY: self.progress })
      });
    }
  }
})();
