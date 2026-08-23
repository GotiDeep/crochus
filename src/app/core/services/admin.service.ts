import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, map } from 'rxjs';
import {
  Category,
  DashboardOverview,
  Order,
  Product,
  SiteSettings,
} from '../models';
import { environment } from '../../../environments/environment';

interface AdminLoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly ADMIN_TOKEN_KEY = 'crochus_admin_token';
  isAdminLoggedIn = signal(false);

  constructor() {
    this.isAdminLoggedIn.set(Boolean(localStorage.getItem(this.ADMIN_TOKEN_KEY)));
  }

  async login(password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AdminLoginResponse>(`${environment.apiUrl}/admin/login`, { password })
    );

    localStorage.setItem(this.ADMIN_TOKEN_KEY, response.token);
    this.isAdminLoggedIn.set(true);
  }

  logout() {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    this.isAdminLoggedIn.set(false);
    this.router.navigate(['/admin']);
  }

  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${environment.apiUrl}/admin/dashboard`);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/admin/products`);
  }

  addProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/admin/products`, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/admin/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(`${environment.apiUrl}/admin/products/${id}`)
      .pipe(map((response) => response.success));
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/admin/categories`);
  }

  addCategory(formData: FormData): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/admin/categories`, formData);
  }

  updateCategory(id: number, formData: FormData): Observable<Category> {
    return this.http.put<Category>(`${environment.apiUrl}/admin/categories/${id}`, formData);
  }

  deleteCategory(id: number): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(`${environment.apiUrl}/admin/categories/${id}`)
      .pipe(map((response) => response.success));
  }

  getOrders(status?: string): Observable<Order[]> {
    const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.http.get<Order[]>(`${environment.apiUrl}/admin/orders${suffix}`);
  }

  updateOrderStatus(id: number, status: string): Observable<boolean> {
    return this.http
      .put<{ success: boolean }>(`${environment.apiUrl}/admin/orders/${id}`, { status })
      .pipe(map((response) => response.success));
  }

  updateWhatsappNumber(number: string): Observable<SiteSettings> {
    return this.http.put<SiteSettings>(`${environment.apiUrl}/admin/settings/whatsapp`, {
      whatsapp_number: number,
    });
  }
}
