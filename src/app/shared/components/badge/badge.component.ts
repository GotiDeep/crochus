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
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      &.badge-new { background: var(--badge-new-bg); color: var(--badge-new-text); }
      &.badge-bestseller { background: var(--badge-bestseller-bg); color: var(--badge-bestseller-text); }
      &.badge-featured { background: var(--badge-featured-bg); color: var(--badge-featured-text); }
    }
  `]
})
export class BadgeComponent {
  @Input() type: 'new' | 'bestseller' | 'featured' | null = null;
  labels = { new: 'New', bestseller: 'Bestseller', featured: 'Featured' };
}
