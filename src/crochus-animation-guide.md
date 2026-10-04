# Crochus – Animation Implementation Guide

Tere project (Angular 17 standalone, SCSS, fonts Cormorant Garamond + Jost, olive `#4A5C2F` / gold `#D4C98A` / cream `#F5F0E0`) ko dekhkar banaya hai. Neeche pehle **kaha kya lagega**, phir **master prompt**, phir **ready code**.

## 1. Kaha kya lagega (Home page)

| # | Animation | Type | Jagah |
| --- | --- | --- | --- |
| A | Marquee ribbon | Constant | `<main>` ke sabse upar, fixed navbar (72px) ke theek neeche |
| B | Dhaga logo "Crochus" | Load pe | Hero me, `section-label` ke upar |
| C | Hero float | Constant | Hero ki images aur `200+` badge halka upar neeche |
| D | Bouquet bloom | Scroll | Categories aur Featured Pieces ke beech |
| E | 3D tilt | Hover | Product cards aur category cards |
| F | Teddy build | Scroll | About Banner me Unsplash image ki jagah |
| G | Hanging charms | Scroll + constant swing | "More Handmade Favourites" ke heading ke upar |
| H | 2nd ribbon (reverse) | Constant | Footer se pehle (optional) |

Rule: ek screen pe ek hi heavy scroll animation. Mobile pe tilt apne aap band rehta hai. `prefers-reduced-motion` me sab band.

## 2. Master prompt (AI tool / developer ko do)

```
Project: Angular 17 standalone-components storefront "Crochus" (handmade crochet catalogue). SCSS, no UI library.
Theme vars in src/styles.scss: --bg #F5F0E0, --primary #4A5C2F, --accent #D4C98A, --text-primary #2C3A1A.
Fonts: Cormorant Garamond (headings), Jost (body). Navbar is position:fixed, height 72px.

Task: add 6 lightweight animations to src/app/pages/home/home.component.ts without changing backend, API,
services, routing, .env or existing logic. Do NOT add any npm package. Use only CSS + small Angular code.

Create folder src/app/shared/animations/ with these standalone files (code is provided in the guide):
1. scroll-progress.directive.ts  - sets CSS var --p (0..1) on the host while it travels through the viewport. Runs outside Angular zone, uses requestAnimationFrame, passive listeners.
2. tilt.directive.ts             - 3D tilt on mouse hover only (pointerType === 'mouse'), resets on leave.
3. marquee-ribbon.component.ts   - infinite text ribbon, inputs: items[], reverse. Pause on hover.
4. thread-logo.component.ts      - "Crochus" drawn like a yarn thread once on page load (CSS only).
5. bouquet-bloom.component.ts    - stems draw + flowers pop, driven by --p.
6. teddy-build.component.ts      - teddy parts pop in sequence, driven by --p.
7. hanging-charms.component.ts   - charms drop on scroll, then swing forever.
Add the shared helper classes (.sp-pop, .sp-draw) to src/styles.scss.

Integrate in HomeComponent:
- add all new components/directives to the `imports` array
- <app-marquee-ribbon /> as first child of <main>; reduce .hero padding-top from 80px to 24px (desktop) since the ribbon now sits under the navbar
- <app-thread-logo class="hero-thread" /> inside .hero-text above the section-label
- <app-bouquet-bloom /> in a new <section class="section"> between Categories and Featured
- replace the Unsplash <img> inside .about-img with <app-teddy-build /> (keep .about-accent)
- <app-hanging-charms /> inside .insta-section above its .section-header
- appTilt on <app-product-card> (host must be display:block) and on .cat-card-img
- add subtle float keyframes to .hero-badge and .img-block.secondary/.tertiary (check they do not already use transform)

Constraints: 60fps, no layout thrash (only transform/opacity/stroke-dashoffset), mobile first, SVG must scale with viewBox,
respect prefers-reduced-motion (show final state, no motion), keep accessibility (aria-hidden on decorative SVG).
After coding, run `ng build` and fix any template/type errors. Show a list of changed files.
```

## 3. Code

### 3.1 `src/styles.scss` (neeche add karo)

```scss
/* ── Scroll-driven helpers (host needs [scrollProgress]) ── */
.sp-pop {
  transform-box: fill-box; transform-origin: center;
  --t: clamp(0, calc((var(--p, 0) - var(--s, 0)) * var(--k, 6)), 1);
  transform: scale(var(--t)); opacity: var(--t);
}
.sp-top { transform-origin: 50% 0; }
.sp-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: calc(1 - clamp(0, calc((var(--p, 0) - var(--s, 0)) * var(--k, 3)), 1));
}
@media (prefers-reduced-motion: reduce) {
  .sp-pop { transform: none; opacity: 1; }
  .sp-draw { stroke-dashoffset: 0; }
}
```

### 3.2 `scroll-progress.directive.ts`

```ts
import { Directive, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';

@Directive({ selector: '[scrollProgress]', standalone: true })
export class ScrollProgressDirective implements OnInit, OnDestroy {
  private raf = 0;
  private tick = () => {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => { this.raf = 0; this.update(); });
  };
  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.el.nativeElement.style.setProperty('--p', '1');
      return;
    }
    this.zone.runOutsideAngular(() => {
      addEventListener('scroll', this.tick, { passive: true });
      addEventListener('resize', this.tick);
    });
    this.update();
  }
  private update() {
    const e = this.el.nativeElement, r = e.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.9 + vh * 0.1)));
    e.style.setProperty('--p', p.toFixed(3));
  }
  ngOnDestroy() {
    removeEventListener('scroll', this.tick);
    removeEventListener('resize', this.tick);
    cancelAnimationFrame(this.raf);
  }
}
```

### 3.3 `tilt.directive.ts`

```ts
import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appTilt]', standalone: true,
  host: { '(pointermove)': 'move($event)', '(pointerleave)': 'reset()' }
})
export class TiltDirective {
  @Input() tiltMax = 8; // degrees
  constructor(private el: ElementRef<HTMLElement>) {
    const s = el.nativeElement.style;
    s.transition = 'transform .15s ease-out'; s.willChange = 'transform';
  }
  move(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    const el = this.el.nativeElement, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(900px) rotateY(${x * this.tiltMax * 2}deg) rotateX(${-y * this.tiltMax * 2}deg) scale(1.02)`;
  }
  reset() { this.el.nativeElement.style.transform = ''; }
}
```

### 3.4 `marquee-ribbon.component.ts`

```ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-marquee-ribbon', standalone: true,
  template: `
    <div class="ribbon" [class.rev]="reverse" aria-hidden="true">
      <div class="track">
        @for (g of [0,1,2,3]; track g) {
          <span class="grp">
            @for (t of items; track $index) { <span>{{ t }}</span><i>✿</i> }
          </span>
        }
      </div>
    </div>`,
  styles: [`
    :host { display: block; }
    .ribbon { background: var(--primary); color: var(--bg); overflow: hidden; white-space: nowrap; padding: 10px 0; }
    :host(.under-nav) .ribbon { margin-top: 72px; }
    .track { display: inline-flex; animation: m 32s linear infinite; }
    .rev .track { animation-direction: reverse; }
    .ribbon:hover .track { animation-play-state: paused; }
    .grp { display: inline-flex; gap: 28px; padding-right: 28px; font: 500 .78rem 'Jost', sans-serif;
           letter-spacing: .16em; text-transform: uppercase; }
    i { font-style: normal; color: var(--accent); }
    @keyframes m { to { transform: translateX(-50%); } }
    @media (prefers-reduced-motion: reduce) { .track { animation: none; } }
  `]
})
export class MarqueeRibbonComponent {
  @Input() reverse = false;
  @Input() items = ['Handmade with love', 'Crochet', 'One of a kind', 'Made to order', 'Crafted to last', 'Crochus'];
}
```

### 3.5 `thread-logo.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-thread-logo', standalone: true,
  template: `
    <svg viewBox="0 0 420 130" aria-hidden="true">
      <path class="yarn" pathLength="1" d="M8 112 C90 82 130 128 210 108 S350 86 412 110"/>
      <text class="word" x="210" y="82" text-anchor="middle">Crochus</text>
    </svg>`,
  styles: [`
    :host { display: block; max-width: 280px; }
    svg { width: 100%; height: auto; overflow: visible; }
    .yarn { fill: none; stroke: var(--accent); stroke-width: 5; stroke-linecap: round;
            stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw 1.6s .2s ease forwards; }
    .word { font: italic 600 76px 'Cormorant Garamond', serif; fill: var(--primary); fill-opacity: 0;
            stroke: var(--primary); stroke-width: 1.6; stroke-dasharray: 420; stroke-dashoffset: 420;
            animation: draw 2.4s .5s ease forwards, fill 1s 2.6s ease forwards; }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @keyframes fill { to { fill-opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .yarn, .word { animation: none; stroke-dashoffset: 0; } .word { fill-opacity: 1; }
    }
  `]
})
export class ThreadLogoComponent {}
```

### 3.6 `bouquet-bloom.component.ts`

```ts
import { Component } from '@angular/core';
import { ScrollProgressDirective } from './scroll-progress.directive';

@Component({
  selector: 'app-bouquet-bloom', standalone: true, imports: [ScrollProgressDirective],
  template: `
  <div class="wrap" scrollProgress>
    <svg viewBox="0 0 400 360" aria-hidden="true" fill="none" stroke-linecap="round">
      <g stroke="#8FA77A" stroke-width="6">
        <path class="sp-draw" style="--s:0"  pathLength="1" d="M170 340 Q90 260 90 120"/>
        <path class="sp-draw" style="--s:.1" pathLength="1" d="M200 340 Q200 220 200 80"/>
        <path class="sp-draw" style="--s:.2" pathLength="1" d="M230 340 Q310 270 310 130"/>
      </g>
      <path class="sp-pop" style="--s:.25;--k:8" d="M118 250 q-44 -8 -54 -48 q44 6 54 48Z" fill="#8FA77A"/>
      <path class="sp-pop" style="--s:.3;--k:8"  d="M262 262 q44 -8 54 -48 q-44 6 -54 48Z" fill="#8FA77A"/>

      <g transform="translate(90 120)"><g class="sp-pop" style="--s:.35" stroke="#C4566F" stroke-width="2">
        <circle r="34" fill="#F4A9BA"/><circle r="25" fill="#E88AA0"/><circle r="16" fill="#F4A9BA"/>
        <path d="M0 -6q8 0 8 8q0 8-9 8"/></g></g>

      <g transform="translate(200 80)"><g class="sp-pop" style="--s:.5">
        @for (a of [0,45,90,135,180,225,270,315]; track a) {
          <ellipse cy="-30" rx="12" ry="22" fill="#fff" stroke="#D8C9A8" stroke-width="2" [attr.transform]="'rotate(' + a + ')'"/>
        }
        <circle r="13" fill="#D4C98A" stroke="#B3A55E" stroke-width="2"/></g></g>

      <g transform="translate(310 130)"><g class="sp-pop" style="--s:.65" stroke="#7A4C8F" stroke-width="2">
        <path d="M-26 -4Q-26 -44 -10 -52Q0 -30 0 -4Z" fill="#C99BE6"/>
        <path d="M26 -4Q26 -44 10 -52Q0 -30 0 -4Z" fill="#C99BE6"/>
        <path d="M-22 8Q0 -60 22 8Q0 24 -22 8Z" fill="#B57EDC"/></g></g>
    </svg>
  </div>`,
  styles: [`:host{display:block} .wrap{max-width:420px;margin:0 auto} svg{width:100%;height:auto}`]
})
export class BouquetBloomComponent {}
```

### 3.7 `teddy-build.component.ts`

```ts
import { Component } from '@angular/core';
import { ScrollProgressDirective } from './scroll-progress.directive';

@Component({
  selector: 'app-teddy-build', standalone: true, imports: [ScrollProgressDirective],
  template: `
  <div class="wrap" scrollProgress>
    <svg viewBox="0 0 400 360" aria-hidden="true">
      <g stroke="#6B4A2B" stroke-width="2.5" fill="#C8955F">
        <ellipse class="sp-pop" style="--s:0"    cx="200" cy="255" rx="62" ry="70"/>
        <ellipse class="sp-pop" style="--s:.07"  cx="150" cy="300" rx="24" ry="32"/>
        <ellipse class="sp-pop" style="--s:.12"  cx="250" cy="300" rx="24" ry="32"/>
        <g transform="rotate(20 140 235)"><ellipse class="sp-pop" style="--s:.18" cx="140" cy="235" rx="20" ry="34"/></g>
        <g transform="rotate(-20 260 235)"><ellipse class="sp-pop" style="--s:.23" cx="260" cy="235" rx="20" ry="34"/></g>
        <circle class="sp-pop" style="--s:.3"  cx="150" cy="88" r="22"/>
        <circle class="sp-pop" style="--s:.34" cx="250" cy="88" r="22"/>
        <circle class="sp-pop" style="--s:.4"  cx="200" cy="140" r="68" fill="#D9A771"/>
        <ellipse class="sp-pop" style="--s:.5" cx="200" cy="160" rx="30" ry="23" fill="#F3DCB9"/>
        <circle class="sp-pop" style="--s:.58;--k:10" cx="174" cy="128" r="7" fill="#2C3A1A"/>
        <circle class="sp-pop" style="--s:.62;--k:10" cx="226" cy="128" r="7" fill="#2C3A1A"/>
        <ellipse class="sp-pop" style="--s:.68;--k:10" cx="200" cy="150" rx="9" ry="6" fill="#2C3A1A"/>
      </g>
    </svg>
  </div>`,
  styles: [`:host{display:block} .wrap{max-width:420px;margin:0 auto} svg{width:100%;height:auto}`]
})
export class TeddyBuildComponent {}
```

### 3.8 `hanging-charms.component.ts`

```ts
import { Component } from '@angular/core';
import { ScrollProgressDirective } from './scroll-progress.directive';

@Component({
  selector: 'app-hanging-charms', standalone: true, imports: [ScrollProgressDirective],
  template: `
  <div class="wrap" scrollProgress>
    <svg viewBox="0 0 400 220" aria-hidden="true">
      <line x1="20" y1="14" x2="380" y2="14" stroke="#B3A55E" stroke-width="3" stroke-linecap="round"/>

      <g transform="translate(100 14)"><g class="drop" style="--s:0"><g class="swing" style="--d:0s">
        <line y2="90" stroke="#8B7B4A" stroke-width="3"/>
        <g transform="translate(0 90)">
          <path d="M0 -10C30 -16 34 18 0 50C-34 18 -30 -16 0 -10Z" fill="#E8495F" stroke="#B02A40" stroke-width="2"/>
          <path d="M-14 -10L0 -22L14 -10L0 -4Z" fill="#5FB870"/>
        </g></g></g></g>

      <g transform="translate(200 14)"><g class="drop" style="--s:.12"><g class="swing" style="--d:-.9s">
        <line y2="90" stroke="#8B7B4A" stroke-width="3"/>
        <g transform="translate(0 90)">
          <ellipse cy="20" rx="26" ry="38" fill="#6FA84A" stroke="#456B2C" stroke-width="2"/>
          <ellipse cy="26" rx="18" ry="29" fill="#D9E88A"/><circle cy="34" r="11" fill="#8A5A44"/>
        </g></g></g></g>

      <g transform="translate(300 14)"><g class="drop" style="--s:.24"><g class="swing" style="--d:-1.8s">
        <line y2="90" stroke="#8B7B4A" stroke-width="3"/>
        <g transform="translate(0 90)">
          <path d="M-4 -8Q-6 14 -14 30M4 -8Q6 14 14 26" fill="none" stroke="#4FAE6A" stroke-width="3"/>
          <circle cx="-14" cy="46" r="15" fill="#D93A55" stroke="#A02037" stroke-width="2"/>
          <circle cx="14" cy="42" r="15" fill="#D93A55" stroke="#A02037" stroke-width="2"/>
        </g></g></g></g>
    </svg>
  </div>`,
  styles: [`
    :host { display: block; }
    .wrap { max-width: 420px; margin: 0 auto 8px; } svg { width: 100%; height: auto; overflow: visible; }
    .drop  { transform: translateY(calc((1 - clamp(0, (var(--p, 0) - var(--s, 0)) * 4, 1)) * -300px)); }
    .swing { transform-origin: 0 0; animation: swing 2.8s ease-in-out infinite alternate; animation-delay: var(--d, 0s); }
    @keyframes swing { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
    @media (prefers-reduced-motion: reduce) { .drop { transform: none; } .swing { animation: none; } }
  `]
})
export class HangingCharmsComponent {}
```

### 3.9 `home.component.ts` me changes

```ts
// imports (top)
import { MarqueeRibbonComponent } from '../../shared/animations/marquee-ribbon.component';
import { ThreadLogoComponent } from '../../shared/animations/thread-logo.component';
import { BouquetBloomComponent } from '../../shared/animations/bouquet-bloom.component';
import { TeddyBuildComponent } from '../../shared/animations/teddy-build.component';
import { HangingCharmsComponent } from '../../shared/animations/hanging-charms.component';
import { TiltDirective } from '../../shared/animations/tilt.directive';

// @Component imports array me add karo:
// MarqueeRibbonComponent, ThreadLogoComponent, BouquetBloomComponent,
// TeddyBuildComponent, HangingCharmsComponent, TiltDirective
```

```html
<main class="main-content">
  <app-marquee-ribbon class="under-nav" />                      <!-- A: navbar ke neeche -->

  <section class="hero"> ...
    <div class="hero-text fade-in">
      <app-thread-logo class="hero-thread" />                    <!-- B -->
      <span class="section-label">✦ Handcrafted with Love</span>
  ...
  </section>

  <!-- categories section ke baad, featured se pehle -->
  <section class="section">                                       <!-- D -->
    <div class="container"><app-bouquet-bloom /></div>
  </section>

  <!-- Featured grid -->
  <app-product-card appTilt [product]="product" />                <!-- E -->

  <!-- About banner: <img ... Unsplash> ki jagah -->
  <div class="about-img"><app-teddy-build /><div class="about-accent"></div></div>   <!-- F -->

  <!-- insta-section ke andar, .section-header se pehle -->
  <app-hanging-charms />                                          <!-- G -->

  <!-- footer se pehle, optional -->
  <app-marquee-ribbon [reverse]="true" />                         <!-- H -->
</main>
```

```scss
/* home styles me */
.hero { min-height: calc(100vh - 72px); }
.hero-content { padding-top: 24px; }          // pehle 80px tha
.hero-thread { margin-bottom: 8px; }
app-product-card { display: block; }

/* C: constant float */
.hero-badge { animation: float 5s ease-in-out -1s infinite; }
.img-block.secondary { animation: float 6s ease-in-out infinite; }
.img-block.tertiary  { animation: float 7s ease-in-out -2s infinite; }
@keyframes float { 50% { transform: translateY(-10px); } }
@media (prefers-reduced-motion: reduce) { .hero-badge, .img-block { animation: none; } }
```

## 4. Check karne ki list

- `npm start` chalao, hard refresh karo, scroll karke har animation dekho.
- Mobile width (375px) pe dekho: ribbon ek line me rahe, charms aur bouquet screen se bahar na jaye.
- Agar `.img-block` ya `.hero-badge` pe pehle se `transform` hai to float keyframes ko usme merge karo.
- DevTools me "Emulate prefers-reduced-motion" on karke dekho, sab static final state me hone chahiye.
- Navbar ke saath ribbon overlap kare to `.under-nav` ka `margin-top` navbar height se match karo.

## 5. Alag pages pe aur kaha lag sakta hai

- **Shop page:** upar ek patli ribbon, product cards pe `appTilt`.
- **About page:** Teddy build "story-img" ki jagah.
- **Product detail:** charms ka swing "Related products" ke upar.
- **404 page:** thread-logo, jaise dhaga ulajh gaya.