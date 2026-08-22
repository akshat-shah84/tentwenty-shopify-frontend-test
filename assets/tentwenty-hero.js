class TentwentyHero extends HTMLElement {
  #index = 0;
  #frame = null;
  #cycleStart = 0;
  #paused = false;
  #slides = [];
  #thumbnails = [];
  #previous = null;
  #next = null;
  #current = null;
  #duration = 5000;
  #reduceMotion = null;

  connectedCallback() {
    this.#slides = [...this.querySelectorAll('[data-hero-slide]')];
    this.#thumbnails = [...this.querySelectorAll('[data-hero-thumbnail]')];
    this.#previous = this.querySelector('[data-hero-previous]');
    this.#next = this.querySelector('[data-hero-next]');
    this.#current = this.querySelector('[data-hero-current]');
    this.#duration = Number(this.dataset.duration) || 5000;
    this.#reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
    this.#previous?.removeEventListener('click', this.#showPrevious);
    this.#next?.removeEventListener('click', this.#showNext);
    this.#thumbnails?.forEach((thumbnail) => thumbnail.removeEventListener('click', this.#selectThumbnail));
    this.removeEventListener('keydown', this.#handleKeydown);
    document.removeEventListener('visibilitychange', this.#handleVisibility);
    this.#reduceMotion?.removeEventListener('change', this.#handleMotionPreference);
  }

  #showPrevious = () => this.#goTo((this.#index - 1 + this.#slides.length) % this.#slides.length);
  #showNext = () => this.#goTo((this.#index + 1) % this.#slides.length);

  #selectThumbnail = (event) => {
    const index = Number(event.currentTarget.dataset.index);
    if (!Number.isNaN(index)) this.#goTo(index);
  };

  #handleKeydown = (event) => {
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
    this.#beginCycle();
  };

  #goTo(index) {
    if (index === this.#index || !this.#slides[index]) {
      this.#beginCycle();
      return;
    }

    this.#cancelCycle();
    this.#slides[this.#index].classList.remove('is-active');
    this.#slides[this.#index].setAttribute('aria-hidden', 'true');
    this.#slides[this.#index].setAttribute('inert', '');
    this.#index = index;
    const slide = this.#slides[this.#index];
    slide.removeAttribute('inert');
    slide.setAttribute('aria-hidden', 'false');
    slide.classList.add('is-active');
    this.#thumbnails.forEach((thumbnail, thumbnailIndex) => {
      const selected = thumbnailIndex === this.#index;
      thumbnail.classList.toggle('is-selected', selected);
      thumbnail.setAttribute('aria-selected', String(selected));
    });
    if (this.#current) this.#current.textContent = String(this.#index + 1).padStart(2, '0');
    this.#setProgress(0);
    this.#beginCycle();
  }

  #beginCycle() {
    this.#cancelCycle();
    if (!this.hasAttribute('data-autoplay') || this.#slides.length < 2 || this.#reduceMotion.matches || this.#paused) return;
    this.#cycleStart = performance.now();
    this.#frame = requestAnimationFrame(this.#tick);
  }

  #cancelCycle() {
    if (this.#frame !== null) cancelAnimationFrame(this.#frame);
    this.#frame = null;
  }

  #tick = (now) => {
    const progress = Math.min((now - this.#cycleStart) / this.#duration, 1);
    this.#setProgress(progress * 100);
    if (progress >= 1) {
      this.#goTo((this.#index + 1) % this.#slides.length);
      return;
    }
    this.#frame = requestAnimationFrame(this.#tick);
  };

  #setProgress(progress) {
    this.#thumbnails.forEach((thumbnail, index) => thumbnail.style.setProperty('--hero-progress', index === this.#index ? `${progress}%` : '0%'));
  }
}

if (!customElements.get('tentwenty-hero')) {
  customElements.define('tentwenty-hero', TentwentyHero);
}
