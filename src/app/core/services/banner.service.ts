import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Banner } from '../models';
import { environment } from '../../../environments/environment';

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    name: 'Handmade Crochet Collection',
    title: 'Little Things, Handmade with Love',
    subtitle: 'From colorful crochet bags and flower bouquets to cute keychains & thoughtful gifts.',
    image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=1600&q=80',
    link_url: '/shop',
    button_text: 'Explore All Products',
    display_on: 'App, Web',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 2,
    name: 'Artisan Crochet Bouquets',
    title: 'Everlasting Floral Bouquets',
    subtitle: 'Hand-knitted petal by petal with soft cotton yarn — gifts that never wither.',
    image_url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1600&q=80',
    link_url: '/shop',
    button_text: 'View Bouquets',
    display_on: 'App, Web',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 3,
    name: 'Chic Bags & Accessories',
    title: 'Lovable Crochet Bags & Gifts',
    subtitle: 'Brighten every day with bespoke handmade totes, pouches, rakhis, and charms.',
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1600&q=80',
    link_url: '/shop',
    button_text: 'Shop Collection',
    display_on: 'App, Web',
    sort_order: 3,
    is_active: true,
  },
];

@Injectable({ providedIn: 'root' })
export class BannerService {
  private http = inject(HttpClient);
  banners = signal<Banner[]>(DEFAULT_BANNERS);

  getPublicBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${environment.apiUrl}/banners`).pipe(
      tap((res) => {
        if (res && res.length > 0) {
          this.banners.set(res);
        }
      }),
      catchError((err) => {
        console.warn('[BannerService] Failed to fetch banners, using fallback:', err);
        return of(this.banners());
      })
    );
  }

  getAdminBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${environment.apiUrl}/admin/banners`);
  }

  createBanner(formData: FormData): Observable<Banner> {
    return this.http.post<Banner>(`${environment.apiUrl}/admin/banners`, formData);
  }

  updateBanner(id: number, formData: FormData): Observable<Banner> {
    return this.http.put<Banner>(`${environment.apiUrl}/admin/banners/${id}`, formData);
  }

  deleteBanner(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${environment.apiUrl}/admin/banners/${id}`);
  }

  toggleBannerStatus(id: number, is_active?: boolean): Observable<Banner> {
    return this.http.patch<Banner>(`${environment.apiUrl}/admin/banners/${id}/status`, { is_active });
  }
}
