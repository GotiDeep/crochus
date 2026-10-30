import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  templateUrl: './product-card-skeleton.html',
  styleUrl: './product-card-skeleton.scss'
})
export class ProductCardSkeletonComponent {
  @Input() count = 6;
  get items() { return Array(this.count).fill(0); }
}
