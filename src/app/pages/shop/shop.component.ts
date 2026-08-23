import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ProductService } from '../../core/services/product.service';
import { Product, Category, ProductFilter } from '../../core/models';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent, FooterComponent,
    HamburgerMenuComponent, ProductCardComponent, ProductCardSkeletonComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <div class="container">
          <!-- Page Header -->
          <div class="shop-header">
            <div>
              <span class="section-label">Explore</span>
              <h1 style="font-size: 2.5rem; margin:8px 0">Our Collection</h1>
              <p>{{ total() }} handmade pieces, curated with care</p>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search products…"
              [(ngModel)]="searchInput"
              (ngModelChange)="onSearchChange($event)"
            />
            @if (searchInput) {
              <button class="clear-btn" (click)="clearSearch()">✕</button>
            }
          </div>

          <!-- Filters Row -->
          <div class="filters-row">
            <!-- Category Chips -->
            <div class="chips-scroll category-chips">
              <button
                class="chip"
                [class.active]="!activeCategory()"
                (click)="setCategory(null)"
              >All</button>
              @for (cat of categories(); track cat.id) {
                <button
                  class="chip"
                  [class.active]="activeCategory() === cat.id"
                  (click)="setCategory(cat.id)"
                >{{ cat.name }}</button>
              }
            </div>

            <!-- Sort -->
            <select class="form-control sort-select" [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <!-- Results -->
          @if (loading()) {
            <div class="product-grid fade-in">
              <app-product-card-skeleton [count]="10" />
            </div>
          } @else if (products().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">🧵</span>
              <h3>No pieces found</h3>
              <p>Try adjusting your search or browse all categories.</p>
              <button class="btn btn-primary" (click)="clearAll()">Clear Filters</button>
            </div>
          } @else {
            <div class="product-grid fade-in">
              @for (product of products(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="pagination">
                <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">‹</button>
                @for (p of pageNumbers(); track p) {
                  <button class="page-btn" [class.active]="p === currentPage()" (click)="goToPage(p)">{{ p }}</button>
                }
                <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">›</button>
              </div>
            }
          }
        </div>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .shop-header {
      padding: 48px 0 24px;
    }

    .search-bar {
      position: relative;
      margin-bottom: 20px;

      .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1rem;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 14px 48px;
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: 8px;
        font-size: 1rem;
        color: var(--text-primary);
        outline: none;
        transition: border-color 0.2s;

        &:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(74,92,47,0.1);
        }

        &::placeholder { color: var(--text-secondary); opacity: 0.7; }
      }

      .clear-btn {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 0.85rem;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 4px;
        &:hover { color: var(--text-primary); }
      }
    }

    .filters-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 36px;
      flex-wrap: wrap;
    }

    .category-chips {
      flex: 1;
      min-width: 0;
    }

    .sort-select {
      flex-shrink: 0;
      padding: 10px 16px;
      font-size: 0.85rem;
      min-width: 180px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 48px;
      padding-bottom: 48px;
    }

    .page-btn {
      width: 40px; height: 40px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;

      &:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); color: white; border-color: var(--primary); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
  `]
})
export class ShopComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  menuOpen = signal(false);
  loading = signal(true);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  total = signal(0);
  currentPage = signal(1);
  limit = 10;

  activeCategory = signal<number | null>(null);
  sortBy = 'newest';
  searchInput = '';
  searchQuery = signal('');

  totalPages = () => Math.ceil(this.total() / this.limit);
  pageNumbers = () => Array.from({ length: this.totalPages() }, (_, i) => i + 1);

  ngOnInit() {
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));

    // Handle query params (from homepage category chips)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category']) {
        this.activeCategory.set(+params['category']);
      }
      this.loadProducts();
    });

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadProducts();
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  loadProducts() {
    this.loading.set(true);
    const filter: ProductFilter = {
      category_id: this.activeCategory() || undefined,
      search: this.searchQuery() || undefined,
      sort: this.sortBy as ProductFilter['sort'],
      page: this.currentPage(),
      limit: this.limit
    };

    this.productService.getProducts(filter).subscribe(res => {
      this.products.set(res.data);
      this.total.set(res.total);
      this.loading.set(false);
    });
  }

  onSearchChange(value: string) { this.searchSubject.next(value); }
  setCategory(id: number | null) { this.activeCategory.set(id); this.currentPage.set(1); this.loadProducts(); }
  onSortChange() { this.currentPage.set(1); this.loadProducts(); }
  goToPage(p: number) { this.currentPage.set(p); this.loadProducts(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  clearSearch() { this.searchInput = ''; this.searchSubject.next(''); }
  clearAll() { this.searchInput = ''; this.searchQuery.set(''); this.activeCategory.set(null); this.loadProducts(); }
}
