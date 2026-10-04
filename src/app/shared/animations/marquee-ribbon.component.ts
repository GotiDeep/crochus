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
    :host { display: block; width: 100%; overflow: hidden; }
    .ribbon { background: var(--primary); color: var(--bg); overflow: hidden; white-space: nowrap; padding: 10px 0; }
    :host(.under-nav) .ribbon { margin-top: 72px; }
    .track { display: inline-flex; animation: m 32s linear infinite; }
    .rev .track { animation-direction: reverse; }
    .ribbon:hover .track { animation-play-state: paused; }
    .grp { display: inline-flex; gap: 28px; padding-right: 28px; font: 500 .78rem 'Jost', sans-serif;
           letter-spacing: .16em; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
    i { font-style: normal; color: var(--accent); }
    @keyframes m { to { transform: translateX(-50%); } }
    @media (max-width: 600px) {
      .ribbon { padding: 8px 0; }
      .grp { font-size: 0.7rem; gap: 18px; padding-right: 18px; }
    }
    @media (prefers-reduced-motion: reduce) { .track { animation: none; } }
  `]
})
export class MarqueeRibbonComponent {
  @Input() reverse = false;
  @Input() items = ['Handmade with love', 'Crochet', 'One of a kind', 'Made to order', 'Crafted to last', 'Crochus'];
}
