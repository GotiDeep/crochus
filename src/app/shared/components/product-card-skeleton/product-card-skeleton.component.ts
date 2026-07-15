import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  template: `
    @for (i of items; track i) {
      <div class="skeleton-card card">
        <div class="skeleton img-skel"></div>
        <div class="body">
          <div class="skeleton line short"></div>
          <div class="skeleton line medium"></div>
          <div class="footer-skel">
            <div class="skeleton line price"></div>
            <div class="skeleton btn-skel"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .skeleton-card {
      overflow: hidden;
    }

    .img-skel {
      aspect-ratio: 3/4;
      width: 100%;
      border-radius: 0;
    }

    .body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .line {
      height: 12px;
      border-radius: 6px;
      &.short { width: 40%; }
      &.medium { width: 75%; height: 16px; }
      &.price { width: 30%; height: 20px; }
    }

    .footer-skel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .btn-skel {
      width: 90px;
      height: 32px;
      border-radius: 4px;
    }
  `]
})
export class ProductCardSkeletonComponent {
  @Input() count = 6;
  get items() { return Array(this.count).fill(0); }
}
