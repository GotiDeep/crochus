import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';
import { ProductService } from '../../core/services/product.service';
import { Product, Category, ProductFilter } from '../../core/models';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ProductCardComponent, ProductCardSkeletonComponent, ScrollRevealDirective],
  templateUrl: './shop.html',
  styleUrl: './shop.scss'
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
