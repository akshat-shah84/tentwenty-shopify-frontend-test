class TentwentyContent extends HTMLElement {
  /** @type {IntersectionObserver | null} */
  #observer = null;
  /** @type {MediaQueryList | null} */
  #reducedMotion = null;
  /** @type {number | null} */
  #revealFrame = null;
  /** @type {number | null} */
  #captionTimer = null;
  /** @type {HTMLElement | null} */
  #slider = null;
  /** @type {HTMLElement | null} */
  #viewport = null;
  /** @type {HTMLElement | null} */
  #track = null;
  /** @type {HTMLElement[]} */
  #slides = [];
  /** @type {HTMLElement[]} */
  #details = [];
  /** @type {HTMLElement | null} */
  #cursor = null;
  /** @type {ResizeObserver | null} */
  #resizeObserver = null;
  #index = 0;
  #slotDistance = 500;
  /** @type {number | null} */
  #pointerId = null;
  #startX = 0;
  #startY = 0;
  #lastX = 0;
  #lastTime = 0;
  #velocity = 0;
  #isDragging = false;
  /** @type {number | null} */
  #animFrame = null;
  /** @type {number | null} */
  #autoplayTimer = null;
  #autoplayInterval = 5000;
  #currentProgress = 0;

  connectedCallback() {
    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.#reducedMotion.addEventListener('change', this.#handleMotionPreference);
    this.#autoplayInterval = Number(this.dataset.autoplayInterval) || 5000;
    this.#setupReveal();
    this.#setupSlider();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#resizeObserver?.disconnect();
    if (this.#revealFrame !== null) cancelAnimationFrame(this.#revealFrame);
    if (this.#captionTimer !== null) window.clearTimeout(this.#captionTimer);
    if (this.#animFrame !== null) cancelAnimationFrame(this.#animFrame);
    this.#stopAutoplay();
    this.#reducedMotion?.removeEventListener('change', this.#handleMotionPreference);
    this.#viewport?.removeEventListener('pointerdown', this.#handlePointerDown);
    this.#viewport?.removeEventListener('pointermove', this.#handlePointerMove);
    this.#viewport?.removeEventListener('pointerup', this.#handlePointerEnd);
    this.#viewport?.removeEventListener('pointercancel', this.#handlePointerEnd);
    this.#viewport?.removeEventListener('pointerenter', this.#handlePointerEnter);
    this.#viewport?.removeEventListener('pointerleave', this.#handlePointerLeave);
    this.#slider?.removeEventListener('keydown', this.#handleKeydown);
  }

  #setupReveal() {
    if (this.#reducedMotion.matches || !('IntersectionObserver' in window)) return;
    this.#observer = new IntersectionObserver(this.#handleIntersection, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    this.#observer.observe(this);
  }

  #handleIntersection = (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) this.#reveal();
  };

  #reveal() {
    if (this.classList.contains('is-revealed') || this.dataset.revealing !== undefined) return;
    this.dataset.revealing = '';
    this.#observer?.disconnect();
    this.#observer = null;
    this.#revealFrame = requestAnimationFrame(() => {
      this.#revealFrame = requestAnimationFrame(() => {
        this.classList.add('is-revealed');
        this.#revealFrame = null;
      });
    });
  }

  #setupSlider() {
    this.#slider = this.querySelector('[data-content-slider]');
    this.#viewport = this.querySelector('[data-slider-viewport]');
    this.#track = this.querySelector('[data-slider-track]');
    this.#slides = [...this.querySelectorAll('[data-slider-slide]')];
    this.#details = [...this.querySelectorAll('[data-slider-details]')];
    this.#cursor = this.querySelector('[data-slider-cursor]');

    if (!this.#slider || !this.#viewport || !this.#track || this.#slides.length === 0) return;

    this.#index = Math.max(this.#slides.findIndex((slide) => slide.classList.contains('is-active')), 0);

    this.#viewport.addEventListener('pointerdown', this.#handlePointerDown);
    this.#viewport.addEventListener('pointermove', this.#handlePointerMove);
    this.#viewport.addEventListener('pointerup', this.#handlePointerEnd);
    this.#viewport.addEventListener('pointercancel', this.#handlePointerEnd);
    this.#viewport.addEventListener('pointerenter', this.#handlePointerEnter);
    this.#viewport.addEventListener('pointerleave', this.#handlePointerLeave);
    this.#slider.addEventListener('keydown', this.#handleKeydown);

    this.#resizeObserver = new ResizeObserver(this.#updateDimensions);
    this.#resizeObserver.observe(this.#viewport);
    this.#updateDimensions();
    this.#startAutoplay();
  }

  #updateDimensions = () => {
    if (!this.#viewport || this.#slides.length === 0) return;
    const firstSlide = this.#slides[0];
    const cardWidth = firstSlide.offsetWidth || 435;
    const gap = Math.max(this.#viewport.clientWidth * 0.087, 24);
    this.#slotDistance = cardWidth + gap;
    this.#render(this.#currentProgress);
  };

  #handlePointerEnter = (event) => {
    if (event.pointerType === 'mouse' && this.#cursor) {
      this.#cursor.classList.add('is-visible');
    }
  };

  #handlePointerLeave = () => {
    if (this.#cursor) {
      this.#cursor.classList.remove('is-visible', 'is-active');
    }
  };

  #handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.#stopAutoplay();
    if (this.#animFrame !== null) {
      cancelAnimationFrame(this.#animFrame);
      this.#animFrame = null;
    }
    this.#pointerId = event.pointerId;
    this.#startX = this.#lastX = event.clientX;
    this.#startY = event.clientY;
    this.#lastTime = event.timeStamp;
    this.#velocity = 0;
    this.#isDragging = false;
    if (this.#cursor) this.#cursor.classList.add('is-active');
  };

  #handlePointerMove = (event) => {
    if (this.#cursor && event.pointerType === 'mouse') {
      const rect = this.#viewport.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.#cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${this.#isDragging ? 0.9 : 1})`;
    }

    if (event.pointerId !== this.#pointerId) return;

    const deltaX = event.clientX - this.#startX;
    const deltaY = event.clientY - this.#startY;

    if (!this.#isDragging) {
      if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 6) return;
      this.#isDragging = true;
      this.#slider.classList.add('is-dragging');
      this.#viewport.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    const elapsed = Math.max(event.timeStamp - this.#lastTime, 1);
    this.#velocity = (event.clientX - this.#lastX) / elapsed;
    this.#lastX = event.clientX;
    this.#lastTime = event.timeStamp;

    const progress = Math.max(-1, Math.min(1, -deltaX / this.#slotDistance));
    this.#currentProgress = progress;
    this.#render(progress);
  };

  #handlePointerEnd = (event) => {
    if (event.pointerId !== this.#pointerId) return;

    if (this.#cursor) this.#cursor.classList.remove('is-active');

    if (this.#isDragging) {
      this.#slider.classList.remove('is-dragging');
      const progress = this.#currentProgress;
      const threshold = 0.18;
      const advanceForward = progress > threshold || (progress > 0.05 && this.#velocity < -0.35);
      const advanceReverse = progress < -threshold || (progress < -0.05 && this.#velocity > 0.35);

      if (advanceForward) {
        this.#animateProgress(progress, 1, 480, () => {
          this.#index = (this.#index + 1) % this.#slides.length;
          this.#currentProgress = 0;
          this.#updateClassesAndAria();
          this.#render(0);
          this.#transitionCaption();
          this.#startAutoplay();
        });
      } else if (advanceReverse) {
        this.#animateProgress(progress, -1, 480, () => {
          this.#index = (this.#index - 1 + this.#slides.length) % this.#slides.length;
          this.#currentProgress = 0;
          this.#updateClassesAndAria();
          this.#render(0);
          this.#transitionCaption();
          this.#startAutoplay();
        });
      } else {
        this.#animateProgress(progress, 0, 360, () => {
          this.#currentProgress = 0;
          this.#render(0);
          this.#startAutoplay();
        });
      }

      if (this.#viewport.hasPointerCapture(event.pointerId)) {
        this.#viewport.releasePointerCapture(event.pointerId);
      }
    } else {
      this.#startAutoplay();
    }

    this.#pointerId = null;
    this.#isDragging = false;
  };

  #handleKeydown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.#navigate(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.#navigate(1);
    }
  };

  #navigate(direction) {
    this.#stopAutoplay();
    if (this.#animFrame !== null) {
      cancelAnimationFrame(this.#animFrame);
      this.#animFrame = null;
    }

    if (this.#reducedMotion.matches) {
      this.#index = (this.#index + direction + this.#slides.length) % this.#slides.length;
      this.#currentProgress = 0;
      this.#updateClassesAndAria();
      this.#render(0);
      this.#transitionCaption();
      this.#startAutoplay();
      return;
    }

    const targetProgress = direction > 0 ? 1 : -1;
    this.#animateProgress(0, targetProgress, 720, () => {
      this.#index = (this.#index + direction + this.#slides.length) % this.#slides.length;
      this.#currentProgress = 0;
      this.#updateClassesAndAria();
      this.#render(0);
      this.#transitionCaption();
      this.#startAutoplay();
    });
  }

  #animateProgress(from, to, duration, onComplete) {
    if (this.#animFrame !== null) cancelAnimationFrame(this.#animFrame);
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      this.#currentProgress = current;
      this.#render(current);

      if (t < 1) {
        this.#animFrame = requestAnimationFrame(tick);
      } else {
        this.#animFrame = null;
        if (onComplete) onComplete();
      }
    };

    this.#animFrame = requestAnimationFrame(tick);
  }

  #render(progress) {
    const N = this.#slides.length;
    if (N === 0) return;
    const i = this.#index;
    const d = this.#slotDistance;

    const leftIdx = (i - 1 + N) % N;
    const centerIdx = i;
    const rightIdx = (i + 1) % N;

    this.#slides.forEach((slide, idx) => {
      if (idx !== leftIdx && idx !== centerIdx && idx !== rightIdx) {
        slide.style.opacity = '0';
        slide.style.visibility = 'hidden';
        slide.style.pointerEvents = 'none';
        slide.style.transform = `translate3d(calc(-50% + ${d * 2}px), 0, 0) rotate(10deg)`;
      }
    });

    const centerSlide = this.#slides[centerIdx];
    const rightSlide = this.#slides[rightIdx];
    const leftSlide = this.#slides[leftIdx];

    if (progress >= 0) {
      const p = progress;

      if (centerSlide) {
        const x = -p * d;
        const rot = -10 * p;
        centerSlide.style.visibility = 'visible';
        centerSlide.style.opacity = '1';
        centerSlide.style.zIndex = '3';
        centerSlide.style.transformOrigin = 'right bottom';
        centerSlide.style.transform = `translate3d(calc(-50% + ${x}px), 0, 0) rotate(${rot}deg)`;
      }

      if (rightSlide) {
        const x = (1 - p) * d;
        const rot = 10 * (1 - p);
        rightSlide.style.visibility = 'visible';
        rightSlide.style.opacity = '1';
        rightSlide.style.zIndex = '2';
        rightSlide.style.transformOrigin = 'left bottom';
        rightSlide.style.transform = `translate3d(calc(-50% + ${x}px), 0, 0) rotate(${rot}deg)`;
      }

      if (leftSlide) {
        const x = -(1 + p) * d;
        const rot = -10 - 5 * p;
        leftSlide.style.visibility = 'visible';
        leftSlide.style.opacity = String(Math.max(0, 1 - p));
        leftSlide.style.zIndex = '1';
        leftSlide.style.transformOrigin = 'right bottom';
        leftSlide.style.transform = `translate3d(calc(-50% + ${x}px), 0, 0) rotate(${rot}deg)`;
      }
    } else {
      const q = -progress;

      if (centerSlide) {
        const x = q * d;
        const rot = 10 * q;
        centerSlide.style.visibility = 'visible';
        centerSlide.style.opacity = '1';
        centerSlide.style.zIndex = '3';
        centerSlide.style.transformOrigin = 'left bottom';
        centerSlide.style.transform = `translate3d(calc(-50% + ${x}px), 0, 0) rotate(${rot}deg)`;
      }

      if (leftSlide) {
        const x = -(1 - q) * d;
        const rot = -10 * (1 - q);
        leftSlide.style.visibility = 'visible';
        leftSlide.style.opacity = '1';
        leftSlide.style.zIndex = '2';
        leftSlide.style.transformOrigin = 'right bottom';
        leftSlide.style.transform = `translate3d(calc(-50% + ${x}px), 0, 0) rotate(${rot}deg)`;
      }

      if (rightSlide) {
        const x = (1 + q) * d;
        const rot = 10 + 5 * q;
        rightSlide.style.visibility = 'visible';
        rightSlide.style.opacity = String(Math.max(0, 1 - q));
        rightSlide.style.zIndex = '1';
        rightSlide.style.transformOrigin = 'left bottom';
        rightSlide.style.transform = `translate3d(calc(-50% + ${x}px), 0, 0) rotate(${rot}deg)`;
      }
    }
  }

  #updateClassesAndAria() {
    const N = this.#slides.length;
    const i = this.#index;
    const leftIdx = (i - 1 + N) % N;
    const rightIdx = (i + 1) % N;

    this.#slides.forEach((slide, idx) => {
      const active = idx === i;
      slide.classList.toggle('is-active', active);
      slide.classList.toggle('is-left', idx === leftIdx);
      slide.classList.toggle('is-right', idx === rightIdx);
      slide.setAttribute('aria-hidden', String(!active));
    });
  }

  #transitionCaption() {
    if (this.#captionTimer !== null) window.clearTimeout(this.#captionTimer);
    const outgoing = this.#details.find((detail) => !detail.hidden);
    outgoing?.classList.remove('is-entering');
    outgoing?.classList.add('is-leaving');
    this.#captionTimer = window.setTimeout(() => {
      outgoing?.classList.remove('is-active', 'is-leaving');
      if (outgoing) outgoing.hidden = true;
      const incoming = this.#details[this.#index];
      if (!incoming) return;
      incoming.hidden = false;
      incoming.classList.add('is-active', 'is-entering');
      this.#captionTimer = null;
    }, this.#reducedMotion.matches ? 0 : 320);
  }

  #startAutoplay() {
    this.#stopAutoplay();
    if (this.#reducedMotion.matches || this.#slides.length < 2) return;
    this.#autoplayTimer = window.setTimeout(() => {
      this.#navigate(1);
    }, this.#autoplayInterval);
  }

  #stopAutoplay() {
    if (this.#autoplayTimer !== null) {
      window.clearTimeout(this.#autoplayTimer);
      this.#autoplayTimer = null;
    }
  }

  #handleMotionPreference = () => {
    if (!this.#reducedMotion.matches) {
      this.#startAutoplay();
      return;
    }
    this.#stopAutoplay();
    if (this.#animFrame !== null) {
      cancelAnimationFrame(this.#animFrame);
      this.#animFrame = null;
    }
    if (this.#revealFrame !== null) cancelAnimationFrame(this.#revealFrame);
    delete this.dataset.revealing;
    this.classList.add('is-revealed');
    this.#currentProgress = 0;
    this.#render(0);
  };
}

if (!customElements.get('tentwenty-content')) customElements.define('tentwenty-content', TentwentyContent);
