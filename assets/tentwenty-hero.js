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
  #cycle = 0;
  #thumbnailTrack = null;
  #transitionTimer = null;
  #targetIndex = 0;

  connectedCallback() {
    this.#slides = [...this.querySelectorAll('[data-hero-slide]')];
    this.#thumbnails = [...this.querySelectorAll('[data-hero-thumbnail]')];
    this.#previous = this.querySelector('[data-hero-previous]');
    this.#next = this.querySelector('[data-hero-next]');
    this.#current = this.querySelector('[data-hero-current]');
    this.#thumbnailTrack = this.querySelector('.tentwenty-hero__thumbnails');
    this.#duration = Number(this.dataset.duration) || 5000;
    this.#targetIndex = this.#index;
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
    if (this.#transitionTimer !== null) {
      window.clearTimeout(this.#transitionTimer);
      this.#completeTransition();
      return;
    }
    this.#beginCycle();
  };

  #goTo(index) {
    if (index === this.#targetIndex || !this.#slides[index]) {
      if (this.#transitionTimer === null) this.#beginCycle();
      return;
    }

    this.#cancelCycle();
    this.#targetIndex = index;
    if (this.#reduceMotion.matches) {
      this.#completeTransition();
      return;
    }
    const outgoingSlide = this.#slides[this.#index];
    outgoingSlide.classList.add('is-exiting');
    outgoingSlide.setAttribute('aria-hidden', 'true');
    outgoingSlide.setAttribute('inert', '');
    if (this.#transitionTimer !== null) window.clearTimeout(this.#transitionTimer);
    this.#transitionTimer = window.setTimeout(this.#completeTransition, 420);
  }

  #completeTransition = () => {
    const outgoingSlide = this.#slides[this.#index];
    outgoingSlide.classList.remove('is-active', 'is-exiting');
    this.#index = this.#targetIndex;
    const slide = this.#slides[this.#index];
    slide.removeAttribute('inert');
    slide.setAttribute('aria-hidden', 'false');
    slide.classList.add('is-active');
    this.#thumbnails.forEach((thumbnail, thumbnailIndex) => {
      const selected = thumbnailIndex === this.#index;
      thumbnail.classList.toggle('is-selected', selected);
      thumbnail.setAttribute('aria-selected', String(selected));
      thumbnail.tabIndex = selected ? 0 : -1;
    });
    this.#thumbnailTrack?.style.setProperty('transform', `translateX(${-this.#index * 100}%)`);
    if (this.#current) this.#current.textContent = String(this.#index + 1).padStart(2, '0');
    this.#setProgress(0);
    this.#transitionTimer = null;
    this.#beginCycle();
  }

  #beginCycle() {
    this.#cancelCycle();
    if (!this.hasAttribute('data-autoplay') || this.#slides.length < 2 || this.#reduceMotion.matches || this.#paused) return;
    this.#cycleStart = performance.now();
    const cycle = this.#cycle;
    this.#frame = requestAnimationFrame((now) => this.#tick(now, cycle));
  }

  #cancelCycle() {
    this.#cycle += 1;
    if (this.#frame !== null) cancelAnimationFrame(this.#frame);
    this.#frame = null;
  }

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

  #setProgress(progress) {
    this.#thumbnails.forEach((thumbnail, index) => thumbnail.style.setProperty('--hero-progress', index === this.#index ? `${progress}%` : '0%'));
  }
}

if (!customElements.get('tentwenty-hero')) {
  customElements.define('tentwenty-hero', TentwentyHero);
}
