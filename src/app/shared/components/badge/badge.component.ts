import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type) {
      <span class="badge" [class]="'badge-' + type">
        {{ labels[type] }}
      </span>
    }
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 11px;
      border-radius: 20px;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      @media (max-width: 480px) {
        padding: 2px 7px;
        font-size: 0.58rem;
        letter-spacing: 0.08em;
      }

      &.badge-new {
        background: var(--c-primary);
        color: #FFFFFF;
        border: 1px solid color-mix(in srgb, var(--c-accent) 60%, transparent);
      }
      &.badge-bestseller {
        background: var(--c-accent);
        color: var(--c-text);
        border: 1px solid color-mix(in srgb, var(--c-primary) 30%, transparent);
      }
      &.badge-featured {
        background: var(--c-text);
        color: var(--c-bg);
        border: 1px solid var(--c-accent);
      }
    }
  `]
})
export class BadgeComponent {
  @Input() type: 'new' | 'bestseller' | 'featured' | null = null;
  labels = { new: 'New', bestseller: 'Bestseller', featured: 'Featured' };
}
