import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { Category, PaginatedResponse, Product, ProductFilter } from '../models';
import { environment } from '../../../environments/environment';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  getProducts(filter?: ProductFilter): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    if (filter?.category_id) {
      params = params.set('category_id', String(filter.category_id));
    }

    if (filter?.search) {
      params = params.set('search', filter.search);
    }

    if (filter?.sort) {
      params = params.set('sort', filter.sort);
    }

    if (filter?.page) {
      params = params.set('page', String(filter.page));
    }

    if (filter?.limit) {
      params = params.set('limit', String(filter.limit));
    }

    if (filter?.featured) {
      params = params.set('featured', 'true');
    }

    if (filter?.exclude_id) {
      params = params.set('exclude_id', String(filter.exclude_id));
    }

    return this.http.get<PaginatedResponse<Product>>(`${environment.apiUrl}/products`, { params }).pipe(
      catchError(() => {
        let list = [...MOCK_PRODUCTS];
        if (filter?.category_id) {
          list = list.filter(p => p.category_id === Number(filter.category_id));
        }
        if (filter?.search) {
          const q = filter.search.toLowerCase();
          list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        if (filter?.featured) {
          list = list.filter(p => p.badge === 'featured' || p.badge === 'bestseller');
        }
        if (filter?.exclude_id) {
          list = list.filter(p => p.id !== Number(filter.exclude_id));
        }
        if (filter?.sort === 'price_asc') {
          list.sort((a, b) => a.price - b.price);
        } else if (filter?.sort === 'price_desc') {
          list.sort((a, b) => b.price - a.price);
        } else if (filter?.sort === 'popular') {
          list.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
        }

        const page = filter?.page ? Number(filter.page) : 1;
        const limit = filter?.limit ? Number(filter.limit) : 12;
        const total = list.length;
        const start = (page - 1) * limit;
        const data = list.slice(start, start + limit);

        return of({
          data,
          total,
          page,
          limit
        });
      })
    );
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${slug}`).pipe(
      catchError(() => {
        const item = MOCK_PRODUCTS.find(p => p.slug === slug) || MOCK_PRODUCTS[0];
        return of(item);
      })
    );
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/featured`, {
      params: new HttpParams().set('limit', '10'),
    }).pipe(
      catchError(() => {
        return of(MOCK_PRODUCTS.filter(p => p.badge !== null).slice(0, 8));
      })
    );
  }

  getHomeProducts(display: 'hero' | 'last_section'): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/home/${display}`).pipe(
      catchError(() => {
        if (display === 'hero') {
          return of(MOCK_PRODUCTS.slice(0, 3));
        }
        return of(MOCK_PRODUCTS.slice(3, 7));
      })
    );
  }

  getSimilarProducts(categoryId: number, excludeId: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('category_id', String(categoryId))
      .set('exclude_id', String(excludeId))
      .set('limit', '3');

    return this.http
      .get<PaginatedResponse<Product>>(`${environment.apiUrl}/products`, { params })
      .pipe(
        map((response) => response.data),
        catchError(() => {
          const similar = MOCK_PRODUCTS.filter(p => p.id !== excludeId && (p.category_id === categoryId || true)).slice(0, 3);
          return of(similar);
        })
      );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`).pipe(
      catchError(() => of(MOCK_CATEGORIES))
    );
  }
}
