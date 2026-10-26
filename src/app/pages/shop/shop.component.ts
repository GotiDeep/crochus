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
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';
import { ProductService } from '../../core/services/product.service';
import { Product, Category, ProductFilter } from '../../core/models';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent, FooterComponent,
    HamburgerMenuComponent, ProductCardComponent, ProductCardSkeletonComponent, ScrollRevealDirective],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <div class="container">
          <!-- Page Header -->
          <header class="shop-header">
            <span class="section-label">Handmade Products Catalogue</span>
            <h1 class="shop-title">Explore All Handmade Products</h1>
            <p class="shop-subtitle">
              Browse {{ total() }} handmade creations, from colorful crochet bags and flower bouquets to cute keychains, kidswear, and thoughtful gifts.
            </p>
          </header>

          <!-- Search & Filter Bar Controls -->
          <div class="catalogue-controls-card">
            <!-- Search Input -->
            <div class="search-bar">
              <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7.5"></circle>
                <line x1="16.5" y1="16.5" x2="22" y2="22"></line>
              </svg>
              <input
                type="text"
                class="search-input"
                placeholder="Search crochet bags, bouquets, keychains, gifts…"
                [(ngModel)]="searchInput"
                (ngModelChange)="onSearchChange($event)"
              />
              @if (searchInput) {
                <button class="clear-btn" (click)="clearSearch()" title="Clear Search">✕</button>
              }
            </div>

            <!-- Filters Row -->
            <div class="filters-row">
              <!-- Category Chips (Desktop & Tablet) -->
              <div class="chips-scroll category-chips">
                <button
                  class="chip"
                  [class.active]="!activeCategory()"
                  (click)="setCategory(null)"
                >
                  All Products
                </button>
                @for (cat of categories(); track cat.id) {
                  <button
                    class="chip"
                    [class.active]="activeCategory() === cat.id"
                    (click)="setCategory(cat.id)"
                  >
                    {{ formatCategoryName(cat.name) }}
                  </button>
                }
              </div>

              <!-- Desktop Sort Selector -->
              <div class="sort-wrapper hide-mobile">
                <span class="sort-label">Sort by:</span>
                <select class="form-control sort-select" [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              <!-- Mobile Filter & Sort Bar -->
              <div class="mobile-filter-bar">
                <button class="mobile-filter-btn" (click)="menuOpen.set(true)">
                  <span>✦ Categories</span>
                  @if (activeCategoryName()) {
                    <strong>({{ formatCategoryName(activeCategoryName()!) }})</strong>
                  }
                </button>
                <select class="form-control sort-select" [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            <!-- Active Filter Badges Bar -->
            @if (activeCategory() || searchInput) {
              <div class="active-filters-bar">
                <span class="af-title">Active Filters:</span>
                @if (activeCategoryName()) {
                  <span class="filter-tag">
                    Category: {{ formatCategoryName(activeCategoryName()!) }}
                    <button (click)="setCategory(null)">✕</button>
                  </span>
                }
                @if (searchInput) {
                  <span class="filter-tag">
                    Search: "{{ searchInput }}"
                    <button (click)="clearSearch()">✕</button>
                  </span>
                }
                <button class="reset-all-link" (click)="clearAll()">Clear All</button>
              </div>
            }
          </div>

          <!-- Product Results Showcase -->
          @if (loading()) {
            <div class="product-grid fade-in">
              <app-product-card-skeleton [count]="12" />
            </div>
          } @else if (products().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">✦</span>
              <h3>No Products Found</h3>
              <p>We could not find any handmade items matching your search. Try another word or clear your filters to see all products.</p>
              <button class="btn btn-primary" (click)="clearAll()">View All Products</button>
            </div>
          } @else {
            <div class="product-grid">
              @for (product of products(); track product.id; let i = $index) {
                <app-product-card [product]="product" appScrollReveal [revealDelay]="(i % 6) * 40" />
              }
            </div>

            <!-- Luxury Numbered Pagination -->
            @if (totalPages() > 1) {
              <nav class="pagination" aria-label="Catalogue Pages">
                <button class="page-btn prev-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
                  ‹
                </button>
                @for (p of pageNumbers(); track p) {
                  <button class="page-btn" [class.active]="p === currentPage()" (click)="goToPage(p)">
                    {{ p }}
                  </button>
                }
                <button class="page-btn next-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">
                  ›
                </button>
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
      padding: 56px 0 28px;
      text-align: center;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      margin-bottom: 32px;
    }

    .shop-title {
      font-size: clamp(2.2rem, 4.5vw, 3.4rem);
      margin: 8px 0 12px;
      letter-spacing: -0.01em;
    }

    .shop-subtitle {
      max-width: 540px;
      margin: 0 auto;
      font-size: 1rem;
      color: var(--c-muted);
    }

    .catalogue-controls-card {
      background: var(--c-surface);
      border: 1px solid color-mix(in srgb, var(--c-accent) 50%, var(--border));
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 36px;
      box-shadow: 0 4px 20px rgba(44, 58, 26, 0.04);

      @media (max-width: 600px) {
        padding: 14px 12px;
        margin-bottom: 24px;
      }
    }

    .search-bar {
      position: relative;
      margin-bottom: 20px;

      @media (max-width: 600px) {
        margin-bottom: 14px;
      }

      .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--c-muted);
        pointer-events: none;

        @media (max-width: 480px) {
          left: 12px;
          width: 16px;
          height: 16px;
        }
      }

      .search-input {
        width: 100%;
        min-height: 48px;
        padding: 14px 44px 14px 44px;
        background: color-mix(in srgb, var(--c-bg) 50%, var(--c-surface));
        border: 1.5px solid var(--border);
        border-radius: 8px;
        font-size: 0.92rem;
        color: var(--c-text);
        outline: none;
        transition: all 0.25s ease;
        box-sizing: border-box;

        @media (max-width: 480px) {
          min-height: 42px;
          padding: 10px 36px 10px 36px;
          font-size: 0.84rem;
        }

        &:focus {
          border-color: var(--c-primary);
          background: #FFFFFF;
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-primary) 15%, transparent);
        }

        &::placeholder {
          color: var(--c-muted);
          opacity: 0.75;
          font-style: italic;
          text-overflow: ellipsis;
        }
      }

      .clear-btn {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 0.9rem;
        color: var(--c-muted);
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover { color: var(--c-text); background: var(--c-bg); }
      }
    }

    .filters-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .category-chips {
      flex: 1;
      min-width: 0;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .chip {
      background: var(--c-surface);
      border: 1px solid var(--border);
      color: var(--c-text);
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 500;
      padding: 8px 18px;
      border-radius: 20px;
      transition: all 0.22s ease;

      &:hover, &.active {
        background: var(--c-primary);
        color: #FFFFFF;
        border-color: var(--c-primary);
        box-shadow: 0 4px 12px rgba(74, 92, 47, 0.2);
      }
    }

    .sort-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .sort-label {
        font-size: 0.76rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--c-muted);
        font-weight: 600;
      }
    }

    .sort-select {
      min-height: 40px;
      padding: 8px 12px;
      font-size: 0.82rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: #FFFFFF;
      color: var(--c-text);
      box-sizing: border-box;

      @media (min-width: 769px) {
        min-width: 175px;
      }

      @media (max-width: 768px) {
        flex: 1 1 0;
        min-width: 0;
        width: auto;
      }
    }

    .mobile-filter-bar {
      display: none;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      @media (max-width: 768px) {
        display: flex;
      }

      @media (max-width: 340px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .mobile-filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 40px;
      padding: 8px 10px;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--c-primary);
      cursor: pointer;
      flex: 1 1 0;
      min-width: 0;
      justify-content: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;

      &:hover { border-color: var(--c-primary); }
    }

    .active-filters-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid color-mix(in srgb, var(--border) 50%, transparent);

      .af-title {
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--c-muted);
        font-weight: 600;
      }

      .filter-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: color-mix(in srgb, var(--c-bg) 75%, var(--c-surface));
        border: 1px solid var(--border);
        border-radius: 4px;
        font-size: 0.75rem;
        color: var(--c-text);

        button {
          background: none;
          border: none;
          font-size: 0.8rem;
          color: var(--c-muted);
          cursor: pointer;
          &:hover { color: var(--c-text); }
        }
      }

      .reset-all-link {
        background: none;
        border: none;
        font-size: 0.74rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--c-primary);
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
      }
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
      width: 40px;
      height: 40px;
      background: var(--c-surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--c-text);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        border-color: var(--c-primary);
        color: var(--c-primary);
      }

      &.active {
        background: var(--c-primary);
        color: #FFFFFF;
        border-color: var(--c-primary);
      }

      &:disabled {
        opacity: 0.35;
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
  formatCategoryName(name: string): string {
    if (!name) return 'Handmade';
    const lower = name.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains';
    if (lower === 'all items') return 'All Products';
    return name;
  }

  clearSearch() { this.searchInput = ''; this.searchSubject.next(''); }
  clearAll() { this.searchInput = ''; this.searchQuery.set(''); this.activeCategory.set(null); this.loadProducts(); }
}
