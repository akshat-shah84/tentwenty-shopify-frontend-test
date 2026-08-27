class TentwentyHero extends HTMLElement {
  #index = 0;
  /** @type {number | null} */
  #frame = null;
  #cycleStart = 0;
  #paused = false;
  /** @type {HTMLElement[]} */
  #slides = [];
  /** @type {HTMLElement[]} */
  #thumbnails = [];
  /** @type {HTMLElement | null} */
  #previous = null;
  /** @type {HTMLElement | null} */
  #next = null;
  /** @type {HTMLElement | null} */
  #current = null;
  #duration = 5000;
  /** @type {MediaQueryList | null} */
  #reduceMotion = null;
  #cycle = 0;
  /** @type {HTMLElement | null} */
  #thumbnailTrack = null;
  /** @type {number | null} */
  #transitionTimer = null;
  #targetIndex = 0;
  static #TRANSITION_MS = 1500;

  connectedCallback() {
    this.#slides = /** @type {HTMLElement[]} */ ([...this.querySelectorAll('[data-hero-slide]')]);
    this.#thumbnails = /** @type {HTMLElement[]} */ ([...this.querySelectorAll('[data-hero-thumbnail]')]);
    this.#previous = this.querySelector('[data-hero-previous]');
    this.#next = this.querySelector('[data-hero-next]');
    this.#current = this.querySelector('[data-hero-current]');
    this.#thumbnailTrack = this.querySelector('.tentwenty-hero__thumbnails');
    this.#duration = Number(this.dataset.duration) || 5000;
    this.#targetIndex = this.#index;
    this.#reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.#updateThumbnail();

    this.dataset.enhanced = '';
    this.#previous?.addEventListener('click', this.#showPrevious);
    this.#next?.addEventListener('click', this.#showNext);
    this.#thumbnails.forEach((thumbnail) => thumbnail.addEventListener('click', this.#selectThumbnail));
    this.addEventListener('keydown', this.#handleKeydown);
    document.addEventListener('visibilitychange', this.#handleVisibility);
    this.#reduceMotion.addEventListener('change', this.#handleMotionPreference);
    this.#beginCycle();
  }

  disconnectedCallback() {
    this.#cancelCycle();
    if (this.#transitionTimer !== null) window.clearTimeout(this.#transitionTimer);
    this.#previous?.removeEventListener('click', this.#showPrevious);
    this.#next?.removeEventListener('click', this.#showNext);
    this.#thumbnails?.forEach((thumbnail) => thumbnail.removeEventListener('click', this.#selectThumbnail));
    this.removeEventListener('keydown', this.#handleKeydown);
    document.removeEventListener('visibilitychange', this.#handleVisibility);
    this.#reduceMotion?.removeEventListener('change', this.#handleMotionPreference);
  }

  #showPrevious = () => this.#goTo((this.#targetIndex - 1 + this.#slides.length) % this.#slides.length);
  #showNext = () => this.#goTo((this.#targetIndex + 1) % this.#slides.length);

  #selectThumbnail = (/** @type {Event} */ event) => {
    const target = /** @type {HTMLElement | null} */ (event.currentTarget);
    const index = Number(target?.dataset.index);
    if (!Number.isNaN(index)) this.#goTo(index);
  };

  #handleKeydown = (/** @type {KeyboardEvent} */ event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.#showPrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.#showNext();
    }
  };

  #handleVisibility = () => {
    this.#paused = document.hidden;
    if (document.hidden) this.#cancelCycle();
    else this.#beginCycle();
  };

  #handleMotionPreference = () => {
    this.#cancelCycle();
    this.#setProgress(0);
    if (this.#transitionTimer !== null) {
      window.clearTimeout(this.#transitionTimer);
      this.#completeTransition();
      return;
    }
    this.#beginCycle();
  };

  /** @param {number} index */
  #goTo(index) {
    if (index === this.#targetIndex || !this.#slides[index]) {
      if (this.#transitionTimer === null) this.#beginCycle();
      return;
    }

    if (this.#transitionTimer !== null) {
      window.clearTimeout(this.#transitionTimer);
      this.#completeTransition();
    }

    this.#cancelCycle();
    this.#setProgress(0);
    this.#targetIndex = index;
    if (this.#reduceMotion?.matches) {
      this.#completeTransition();
      return;
    }
    const incomingSlide = this.#slides[index];
    if (!incomingSlide) return;
    incomingSlide.removeAttribute('inert');
    incomingSlide.setAttribute('aria-hidden', 'false');
    void incomingSlide.offsetHeight;
    incomingSlide.classList.add('is-revealing');
    this.#transitionTimer = window.setTimeout(this.#completeTransition, TentwentyHero.#TRANSITION_MS);
  }

  #completeTransition = () => {
    const outgoingSlide = this.#slides[this.#index];
    outgoingSlide?.classList.remove('is-active', 'is-revealing');
    outgoingSlide?.setAttribute('aria-hidden', 'true');
    outgoingSlide?.setAttribute('inert', '');
    this.#index = this.#targetIndex;
    const slide = this.#slides[this.#index];
    if (slide) {
      slide.removeAttribute('inert');
      slide.setAttribute('aria-hidden', 'false');
      slide.classList.remove('is-revealing');
      slide.classList.add('is-active');
    }
    this.#updateThumbnail();
    if (this.#current) this.#current.textContent = String(this.#index + 1).padStart(2, '0');
    this.#setProgress(0);
    this.#transitionTimer = null;
    this.#beginCycle();
  };

  #updateThumbnail() {
    const nextIndex = (this.#index + 1) % this.#slides.length;
    this.#thumbnails.forEach((thumbnail, thumbnailIndex) => {
      const selected = thumbnailIndex === nextIndex;
      thumbnail.classList.toggle('is-selected', selected);
      thumbnail.setAttribute('aria-selected', String(selected));
      thumbnail.tabIndex = selected ? 0 : -1;
    });
    this.#thumbnailTrack?.style.setProperty('transform', `translateX(${-nextIndex * 100}%)`);
  }

  #beginCycle() {
    this.#cancelCycle();
    if (!this.hasAttribute('data-autoplay') || this.#slides.length < 2 || this.#reduceMotion?.matches || this.#paused) return;
    this.#cycleStart = performance.now();
    const cycle = this.#cycle;
    this.#frame = requestAnimationFrame((now) => this.#tick(now, cycle));
  }

  #cancelCycle() {
    this.#cycle += 1;
    if (this.#frame !== null) cancelAnimationFrame(this.#frame);
    this.#frame = null;
  }

  /**
   * @param {number} now
   * @param {number} cycle
   */
  #tick = (now, cycle) => {
    if (cycle !== this.#cycle) return;
    const progress = Math.min((now - this.#cycleStart) / this.#duration, 1);
    this.#setProgress(progress * 100);
    if (progress >= 1) {
      this.#goTo((this.#index + 1) % this.#slides.length);
      return;
    }
    this.#frame = requestAnimationFrame((timestamp) => this.#tick(timestamp, cycle));
  };

  /** @param {number} progress */
  #setProgress(progress) {
    const nextIndex = (this.#index + 1) % this.#slides.length;
    const segments = [
      Math.min(progress * 4, 100),
      Math.min(Math.max((progress - 25) * 4, 0), 100),
      Math.min(Math.max((progress - 50) * 4, 0), 100),
      Math.min(Math.max((progress - 75) * 4, 0), 100),
    ];
    this.#thumbnails.forEach((thumbnail, index) => {
      const values = index === nextIndex ? segments : [0, 0, 0, 0];
      thumbnail.style.setProperty('--hero-progress-top', `${values[0]}%`);
      thumbnail.style.setProperty('--hero-progress-right', `${values[1]}%`);
      thumbnail.style.setProperty('--hero-progress-bottom', `${values[2]}%`);
      thumbnail.style.setProperty('--hero-progress-left', `${values[3]}%`);
    });
  }
}

if (!customElements.get('tentwenty-hero')) {
  customElements.define('tentwenty-hero', TentwentyHero);
}
