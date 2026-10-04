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
  styles: [`
    :host {
      display: block;
      width: 100%;
      aspect-ratio: 4/5;
      background: var(--bg);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wrap {
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
      padding: 16px;
    }
    svg {
      width: 100%;
      height: auto;
      display: block;
    }
    @media (max-width: 768px) {
      .wrap { max-width: 320px; }
    }
  `]
})
export class TeddyBuildComponent {}
