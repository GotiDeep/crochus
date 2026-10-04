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
    svg { width: 100%; height: auto; overflow: visible; display: block; }
    .yarn { fill: none; stroke: var(--accent); stroke-width: 5; stroke-linecap: round;
            stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw 1.6s .2s ease forwards; }
    .word { font: italic 600 76px 'Cormorant Garamond', serif; fill: var(--primary); fill-opacity: 0;
            stroke: var(--primary); stroke-width: 1.6; stroke-dasharray: 420; stroke-dashoffset: 420;
            animation: draw 2.4s .5s ease forwards, fill 1s 2.6s ease forwards; }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @keyframes fill { to { fill-opacity: 1; } }
    @media (max-width: 900px) {
      :host { max-width: 220px; margin: 0 auto; }
    }
    @media (prefers-reduced-motion: reduce) {
      .yarn, .word { animation: none; stroke-dashoffset: 0; } .word { fill-opacity: 1; }
    }
  `]
})
export class ThreadLogoComponent {}
