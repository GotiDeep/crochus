import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category, PaginatedResponse, Product, ProductFilter } from '../models';
import { environment } from '../../../environments/environment';

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

    return this.http.get<PaginatedResponse<Product>>(`${environment.apiUrl}/products`, { params });
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${slug}`);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/featured`, {
      params: new HttpParams().set('limit', '10'),
    });
  }

  getHomeProducts(display: 'hero' | 'last_section'): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/home/${display}`);
  }

  getSimilarProducts(categoryId: number, excludeId: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('category_id', String(categoryId))
      .set('exclude_id', String(excludeId))
      .set('limit', '3');

    return this.http
      .get<PaginatedResponse<Product>>(`${environment.apiUrl}/products`, { params })
      .pipe(map((response) => response.data));
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }
}
