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
              <span class="section-label">Curated Handcrafted Catalogue</span>
              <h1>Artisan Collection</h1>
              <p>{{ total() }} unique pieces, individually made by hand with natural fibers & mindful care.</p>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="search-bar">
            <span class="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              class="search-input"
              placeholder="Search handcrafted bags, jewellery, décor, scarves…"
              [(ngModel)]="searchInput"
              (ngModelChange)="onSearchChange($event)"
              aria-label="Search handcrafted collection"
            />
            @if (searchInput) {
              <button class="clear-btn" (click)="clearSearch()" aria-label="Clear search">✕</button>
            }
          </div>

          <!-- Filters & Sort Row -->
          <div class="filters-row">
            <!-- Category Chips: Always accessible, horizontal scrolling on mobile -->
            <div class="chips-scroll category-chips" role="tablist" aria-label="Filter by category">
              <button
                class="chip"
                [class.active]="!activeCategory()"
                (click)="setCategory(null)"
                role="tab"
                [attr.aria-selected]="!activeCategory()"
              >All Pieces</button>
              @for (cat of categories(); track cat.id) {
                <button
                  class="chip"
                  [class.active]="activeCategory() === cat.id"
                  (click)="setCategory(cat.id)"
                  role="tab"
                  [attr.aria-selected]="activeCategory() === cat.id"
                >
                  {{ cat.name }}
                  @if (cat.product_count) {
                    <span class="chip-count">({{ cat.product_count }})</span>
                  }
                </button>
              }
            </div>

            <!-- Sort Select Dropdown -->
            <div class="sort-wrapper">
              <label class="sort-label hide-mobile" for="sort-dropdown">Sort:</label>
              <select id="sort-dropdown" class="form-control sort-select" [(ngModel)]="sortBy" (ngModelChange)="onSortChange()" aria-label="Sort products">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          <!-- Active Filter Pill Indicator -->
          @if (activeCategoryName() || searchInput) {
            <div class="active-filter-bar fade-in">
              <span>Showing: <strong>{{ activeCategoryName() || 'All Pieces' }}</strong></span>
              @if (searchInput) {
                <span>matching "<em>{{ searchInput }}</em>"</span>
              }
              <button class="clear-pill-btn" (click)="clearAll()">✕ Clear Filters</button>
            </div>
          }

          <!-- Results -->
          @if (loading()) {
            <div class="product-grid fade-in">
              <app-product-card-skeleton [count]="8" />
            </div>
          } @else if (products().length === 0) {
            <div class="empty-state card">
              <span class="empty-icon">🧵</span>
              <h3>No pieces found</h3>
              <p>We couldn't find any handmade treasures matching your selection. Try clearing your search or exploring other categories.</p>
              <button class="btn btn-primary" (click)="clearAll()">Browse All Pieces</button>
            </div>
          } @else {
            <div class="product-grid fade-in">
              @for (product of products(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <nav class="pagination" aria-label="Catalogue pagination">
                <button
                  class="page-btn prev-btn"
                  [disabled]="currentPage() === 1"
                  (click)="goToPage(currentPage() - 1)"
                  aria-label="Previous page"
                >‹ Prev</button>

                @for (p of pageNumbers(); track p) {
                  <button
                    class="page-btn num-btn"
                    [class.active]="p === currentPage()"
                    (click)="goToPage(p)"
                    [attr.aria-label]="'Go to page ' + p"
                    [attr.aria-current]="p === currentPage() ? 'page' : null"
                  >{{ p }}</button>
                }

                <button
                  class="page-btn next-btn"
                  [disabled]="currentPage() === totalPages()"
                  (click)="goToPage(currentPage() + 1)"
                  aria-label="Next page"
                >Next ›</button>
              </nav>
            }
          }
        </div>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .shop-header {
      padding: 40px 0 24px;
      h1 {
        margin: 8px 0 10px;
        font-size: clamp(2.2rem, 4vw, 3.2rem);
      }
      p {
        max-width: 540px;
        font-size: 1.05rem;
      }
    }

    .search-bar {
      position: relative;
      margin-bottom: 24px;

      .search-icon {
        position: absolute;
        left: 18px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
        display: flex;
        align-items: center;
      }

      .search-input {
        width: 100%;
        min-height: 52px;
        padding: 14px 48px 14px 50px;
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-md);
        font-size: 1rem;
        color: var(--text-primary);
        outline: none;
        transition: all 0.2s ease;
        box-shadow: var(--shadow-sm);

        &:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(74, 92, 47, 0.12);
        }

        &::placeholder { color: var(--text-muted); }
      }

      .clear-btn {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        background: var(--bg-warm);
        border: 1px solid var(--border);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;

        &:hover {
          background: var(--primary);
          color: #FFFFFF;
          border-color: var(--primary);
        }
      }
    }

    .filters-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
    }

    .category-chips {
      flex: 1;
      min-width: 0;
      padding-bottom: 4px;
    }

    .chip-count {
      font-size: 0.72rem;
      opacity: 0.85;
      margin-left: 4px;
    }

    .sort-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .sort-label {
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
    }

    .sort-select {
      min-width: 180px;
      min-height: 42px;
      padding: 9px 14px;
      font-size: 0.88rem;
      font-weight: 600;
      background: var(--surface);
      border-radius: var(--radius-sm);

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .active-filter-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: var(--bg-warm);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      margin-bottom: 24px;
      font-size: 0.88rem;
      color: var(--text-secondary);
      flex-wrap: wrap;

      strong { color: var(--primary); }

      .clear-pill-btn {
        margin-left: auto;
        background: none;
        border: none;
        color: var(--primary);
        font-weight: 600;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.15s;

        &:hover {
          background: rgba(74, 92, 47, 0.1);
        }
      }
    }

    .empty-state.card {
      padding: 60px 24px;
      max-width: 600px;
      margin: 40px auto;
      text-align: center;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 48px;
      padding-bottom: 48px;
      flex-wrap: wrap;
    }

    .page-btn {
      min-height: 44px; /* Touch target */
      padding: 8px 16px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        border-color: var(--primary);
        color: var(--primary);
        transform: translateY(-1px);
      }

      &.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
        box-shadow: 0 4px 12px rgba(74, 92, 47, 0.25);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
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

  activeCategoryName = () => {
    const cat = this.categories().find(c => c.id === this.activeCategory());
    return cat ? cat.name : '';
  };

  totalPages = () => Math.ceil(this.total() / this.limit);
  pageNumbers = () => Array.from({ length: this.totalPages() }, (_, i) => i + 1);

  ngOnInit() {
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));

    // Handle query params (from homepage category chips / hamburger menu)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category']) {
        this.activeCategory.set(+params['category']);
      } else {
        this.activeCategory.set(null);
      }
      this.currentPage.set(1);
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

    // If selected category is "All Items" (special category), treat as no filter
    const selectedCat = this.categories().find(c => c.id === this.activeCategory());
    const isAllItems = selectedCat && selectedCat.name.trim().toLowerCase() === 'all items';
    const effectiveCategoryId = isAllItems ? undefined : (this.activeCategory() || undefined);

    const filter: ProductFilter = {
      category_id: effectiveCategoryId,
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
