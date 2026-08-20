# TenTwenty Shopify Frontend Developer Assessment

## Project Role

You are working as a senior Shopify theme developer and frontend engineer.

This repository is a Shopify Online Store 2.0 theme based on Shopify's Horizon theme.

The goal is to implement the TenTwenty Frontend Developer Assessment while preserving useful existing Horizon functionality.

The final implementation must be production-quality, responsive, maintainable, accessible, SEO-friendly and performant.

---

# 1. PRIMARY RULE

DO NOT rewrite the entire Horizon theme from scratch.

Before modifying any existing functionality:

1. Inspect the existing Horizon architecture.
2. Understand how the relevant component currently works.
3. Reuse existing Horizon components where appropriate.
4. Extend existing functionality when practical.
5. Only create new components when existing functionality cannot reasonably support the requirement.

Preserve unrelated Horizon functionality.

Do not make destructive changes without a clear technical reason.

---

# 2. DESIGN SOURCE OF TRUTH

## Desktop Figma

https://www.figma.com/design/MfX49RIWERXGpf3OaHqEKG/TenTwenty---Frontend-Developer-Exam-2023--Copy-?node-id=766-11&t=4O9PfAsrrhUvdbIN-0

## Mobile Figma

https://www.figma.com/design/53qj609QzxrQWvlcKOgob0/TenTwenty---Frontend-Developer-Exam-2023?node-id=766-111&t=oTrZdbI8cPeAMaKG-0

## Hero Figma

https://www.figma.com/design/MfX49RIWERXGpf3OaHqEKG/TenTwenty---Frontend-Developer-Exam-2023--Copy-?node-id=766-12&t=4O9PfAsrrhUvdbIN-0

## Hero Thumbnail Figma

https://www.figma.com/design/53qj609QzxrQWvlcKOgob0/TenTwenty---Frontend-Developer-Exam-2023?node-id=766-61&t=oTrZdbI8cPeAMaKG-0

## Second Section Figma

https://www.figma.com/design/53qj609QzxrQWvlcKOgob0/TenTwenty---Frontend-Developer-Exam-2023?node-id=766-82&t=oTrZdbI8cPeAMaKG-0

## Second Slider Figma

https://www.figma.com/design/53qj609QzxrQWvlcKOgob0/TenTwenty---Frontend-Developer-Exam-2023?node-id=766-85&t=oTrZdbI8cPeAMaKG-0

---

# 3. ANIMATION REFERENCES

## Hero Slider Transition

https://vimeo.com/806304396/9613ac1aba

The hero image transition should have a smooth, premium transition between slides.

Do not implement a basic abrupt image swap.

Use performant combinations of:

* transform
* scale
* opacity
* clipping/masking where appropriate
* easing
* controlled timing

Reproduce the visual motion intent of the reference.

Do not claim knowledge of the Vimeo source implementation unless it can actually be verified.

---

## Hero Text Animation

Reference:

https://www.kca-int.com/

The hero text must animate:

* on initial page load
* when the active slide changes

Prefer independent animation of:

1. eyebrow
2. heading
3. paragraph
4. CTA

Use a subtle stagger.

The animation should feel premium and intentional, not excessive.

---

## Hero Thumbnail Progress

The active thumbnail must have a progress border corresponding to the autoplay duration.

Required behavior:

Autoplay:

progress starts → fills → reaches 100% → next slide → reset

Next:

reset progress → change slide → start new progress

Previous:

reset progress → change slide → start new progress

Thumbnail click:

reset progress → change slide → start new progress

Avoid multiple active autoplay timers.

The visual progress and actual autoplay timer must remain synchronized.

---

## Second Section Animation

When the section enters the viewport:

1. Title animates first.
2. Paragraph animates second.

Use IntersectionObserver.

Avoid continuously running scroll handlers for this animation.

Respect:

prefers-reduced-motion: reduce

---

## Second Image Slider

Reference:

https://vimeo.com/806273148/35db756bf7

Requirements:

* mouse drag on desktop
* touch swipe on mobile
* Pointer Events preferred
* smooth drag behavior
* track follows pointer
* snap to slide on release
* active slide state
* synchronized text
* prevent accidental click after drag
* responsive behavior

Image and corresponding text must use one active-slide source of truth.

Do not implement the slider as a fake autoplay-only carousel.

---

# 4. FONT

Use:

Work Sans

Reference:

https://fonts.google.com/specimen/Work+Sans

Use only the font weights required by the design.

Avoid unnecessary font requests.

---

# 5. SHOPIFY ARCHITECTURE

Use Shopify Online Store 2.0 architecture.

Use:

* Liquid
* HTML5
* CSS/SCSS
* JavaScript
* JSON templates
* Shopify sections
* Shopify section blocks
* Shopify snippets
* Shopify Theme Editor settings

Merchant-editable content must not be unnecessarily hardcoded.

Use Shopify settings, blocks, collections, products and metafields where appropriate.

---

# 6. REUSABILITY

Prefer reusable components.

Examples:

* product-card snippet
* responsive-image snippet
* button component
* icon component
* hero slide block
* slider controls
* animation utility

Avoid duplicated Liquid markup.

Do not create multiple implementations of the same UI.

---

# 7. HERO SECTION

The hero must support through Shopify Theme Editor:

* desktop image
* mobile image
* eyebrow
* heading
* description
* CTA text
* CTA URL
* multiple slides

The merchant should be able to add/remove/reorder slides.

Do not hardcode slide content in JavaScript.

---

# 8. PRODUCT REQUIREMENTS

Create at least 6–8 sample products.

Products should have meaningful:

* titles
* descriptions
* prices
* images
* colors
* categories
* collections

Create meaningful collections.

Products must provide enough variation to demonstrate filtering.

---

# 9. COLLECTION / PLP

Implement a proper Shopify collection/product listing page.

Required filtering includes attributes such as:

* Color
* Category

Use Shopify-native filtering architecture where appropriate.

Desktop should provide a usable filter/sidebar experience.

Mobile should provide a suitable filter/sort experience.

Do not implement a fake frontend-only filter when Shopify's native filtering architecture can provide the required behavior.

---

# 10. PRODUCT CARD

Use a reusable product-card component.

Support where appropriate:

* product image
* responsive image
* hover image
* title
* price
* compare-at price
* sale state
* product URL
* alt text

Do not duplicate product-card markup.

---

# 11. RESPONSIVE DESIGN

The supplied desktop and mobile Figma references are both important.

Do not simply scale desktop down.

Test:

* desktop
* laptop
* tablet
* mobile

Mobile may require:

* different spacing
* typography adjustments
* image cropping
* navigation changes
* slider behavior changes
* mobile-specific images

---

# 12. ACCESSIBILITY

Use:

* semantic HTML
* proper heading hierarchy
* accessible names
* keyboard navigation
* visible focus states
* meaningful alt text
* accessible slider controls
* appropriate ARIA only where necessary
* no focusable content inside aria-hidden elements
* reduced-motion support

Do not use ARIA unnecessarily.

---

# 13. SEO

Implement basic SEO best practices:

* semantic headings
* meaningful title/meta handling
* image alt text
* canonical handling where appropriate
* clean internal links
* appropriate product structured data if supported by the theme
* avoid duplicate headings

---

# 14. PERFORMANCE

Performance is important.

Use:

* responsive images
* appropriate image sizes
* lazy loading below the fold
* high-priority loading for the primary hero/LCP image when appropriate
* aspect-ratio or dimensions to reduce CLS
* performant transforms
* minimal JavaScript
* deferred non-critical scripts
* no unnecessary third-party libraries

Avoid:

* layout thrashing
* forced synchronous layout
* animating width/height/top/left unnecessarily
* excessive DOM manipulation
* unnecessary dependencies

---

# 15. JAVASCRIPT

Use clean component-oriented JavaScript.

Prefer:

* classes/modules
* clear initialization
* data attributes for JS hooks
* Pointer Events for drag interactions
* requestAnimationFrame when appropriate
* CSS transforms for movement

Avoid:

* one huge JavaScript file
* anonymous global functions
* duplicated event handlers
* multiple autoplay timers
* unnecessary jQuery
* unnecessary animation libraries

Do not introduce a library merely because it is available.

Use native browser APIs when they are sufficient.

---

# 16. REDUCED MOTION

Support:

prefers-reduced-motion: reduce

When reduced motion is requested:

* minimize transforms
* reduce animation
* disable unnecessary autoplay
* keep content visible
* preserve functionality

---

# 17. FAILURE / DEGRADATION

Core content must remain usable if JavaScript fails.

Links should remain links.

Images should remain visible.

Content should not depend entirely on JavaScript.

---

# 18. DESIGN ACCURACY

Before claiming visual completion, compare the implementation against the supplied Figma.

Check:

* typography
* font weights
* font sizes
* line heights
* letter spacing
* colors
* spacing
* image crops
* image aspect ratios
* section heights
* navigation
* buttons
* thumbnail dimensions
* slider spacing
* mobile layout

Do not claim "pixel perfect" without visual QA.

---

# 19. DO NOT HALLUCINATE

If a Figma value or animation implementation cannot be verified:

* inspect available visual references
* make the smallest reasonable assumption
* document the assumption

Do not invent exact values and claim they came from Figma.

Do not claim that a Vimeo animation uses a specific library unless it can be verified.

Reproduce visual behavior rather than copying inaccessible source code.

---

# 20. DEVELOPMENT PROCESS

Work in phases.

## Phase 1 — Discovery

Inspect:

* Horizon theme architecture
* existing slideshow
* existing media components
* existing product cards
* existing filters
* existing responsive behavior
* existing JavaScript
* existing CSS

Do not modify files during discovery unless necessary.

Report the architecture and proposed implementation approach.

## Phase 2 — Base Design

Implement:

* typography
* global styles
* header
* responsive structure
* main page sections

## Phase 3 — Hero

Implement:

* hero layout
* autoplay
* image transitions
* text animation
* thumbnail navigation
* thumbnail progress
* next/previous
* responsive behavior

## Phase 4 — Second Section

Implement:

* section layout
* IntersectionObserver animation
* title-first/paragraph-second sequence

## Phase 5 — Second Slider

Implement:

* drag
* touch
* snapping
* synchronized text
* responsive behavior

## Phase 6 — Products

Implement:

* products
* collections
* reusable product cards
* collection page
* filters

## Phase 7 — Quality

Perform:

* accessibility review
* SEO review
* performance review
* responsive review
* JavaScript error review
* Liquid/theme validation

## Phase 8 — Visual QA

Compare desktop and mobile against Figma.

Fix visual mismatches.

## Phase 9 — Documentation

Update README.md with:

* project overview
* architecture
* animation implementation
* Shopify Admin content management
* product/collection setup
* filtering
* accessibility
* performance
* assumptions
* development commands

---

# 21. GIT RULES

Work only on:

feature/tentwenty-implementation

Do not directly modify main.

Create meaningful commits.

Examples:

* feat: implement responsive page structure
* feat: implement hero slider
* feat: add hero animations
* feat: implement draggable image slider
* feat: add products and collection filters
* perf: optimize theme assets
* a11y: improve slider accessibility
* docs: add project documentation

Do not commit:

* .env files
* secrets
* credentials
* node_modules
* personal configuration

Before every commit:

1. inspect git diff
2. verify no secrets
3. verify unrelated Horizon functionality was not unintentionally changed

---

# 22. CRITICAL CODE SAFETY RULE

Before making broad changes, inspect the existing files.

Do not replace complete files simply because doing so is easier.

Prefer targeted modifications.

Preserve existing Horizon functionality unless it conflicts directly with the assessment requirements.

---

# 23. FINAL ACCEPTANCE CRITERIA

The project is complete only when:

* desktop matches Figma closely
* mobile matches Figma closely
* hero transitions smoothly
* hero text animates correctly
* thumbnail progress works
* progress resets on manual navigation
* second section animation works
* second slider supports smooth dragging
* slider text synchronizes correctly
* products exist
* collections exist
* color/category filtering works
* content is reasonably editable from Shopify Admin
* accessibility requirements are addressed
* SEO basics are addressed
* performance has been reviewed
* no major JavaScript errors exist
* no major Liquid/theme errors exist
* Git working tree is clean
* README documents the implementation

Do not declare the task complete merely because the page renders.

Perform a complete QA pass first.
