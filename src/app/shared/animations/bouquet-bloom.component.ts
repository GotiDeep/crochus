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
  styles: [`
    :host { display: block; width: 100%; }
    .wrap { width: 100%; max-width: 420px; margin: 0 auto; }
    svg { width: 100%; height: auto; display: block; overflow: visible; }
    @media (max-width: 768px) {
      .wrap { max-width: 320px; }
    }
  `]
})
export class BouquetBloomComponent {}
