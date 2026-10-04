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
    :host { display: block; width: 100%; }
    .wrap { width: 100%; max-width: 420px; margin: 0 auto 16px; }
    svg { width: 100%; height: auto; overflow: visible; display: block; }
    .drop  { transform: translateY(calc((1 - clamp(0, (var(--p, 0) - var(--s, 0)) * 4, 1)) * -300px)); }
    .swing { transform-origin: 0 0; animation: swing 2.8s ease-in-out infinite alternate; animation-delay: var(--d, 0s); }
    @keyframes swing { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
    @media (max-width: 768px) {
      .wrap { max-width: 320px; margin-bottom: 12px; }
    }
    @media (prefers-reduced-motion: reduce) { .drop { transform: none; } .swing { animation: none; } }
  `]
})
export class HangingCharmsComponent {}
