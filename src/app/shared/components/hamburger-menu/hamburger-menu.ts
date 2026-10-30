import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-hamburger-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './hamburger-menu.html',
  styleUrl: './hamburger-menu.scss'
})
export class HamburgerMenuComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  auth = inject(AuthService);
  cart = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);

  filtersOpen = signal(true);
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {}
    });
  }

  toggleFilters() {
    this.filtersOpen.update((v) => !v);
  }

  selectCategory(categoryId: number | null) {
    this.close.emit();
    if (categoryId === null) {
      this.router.navigate(['/shop'], { queryParams: {} });
    } else {
      this.router.navigate(['/shop'], { queryParams: { category: categoryId } });
    }
  }

  formatCategoryName(name: string): string {
    if (!name) return 'Handmade';
    const lower = name.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags & Purses';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains & Charms';
    return name;
  }

  logout() {
    this.auth.logout();
    this.close.emit();
  }
}
