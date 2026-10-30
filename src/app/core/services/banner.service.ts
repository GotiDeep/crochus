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
    subtitle: 'Explore handcrafted crochet bags, flowers, rakhis & adorable gifts.',
    image_url: 'https://res.cloudinary.com/d9lsbgif/image/upload/v1793377606/crochus/banners/qaqizcth0deraqgmuqbl.png',
    link_url: '/shop',
    button_text: 'Explore Collection',
    display_on: 'App, Web',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 2,
    name: 'Artisan Crochet Bouquets',
    title: 'Everlasting Floral Bouquets',
    subtitle: 'Made petal by petal with premium yarn to bring warmth to your home.',
    image_url: 'https://res.cloudinary.com/d9lsbgif/image/upload/v1793377786/crochus/banners/e1uakeximw6nptg0d1z0.png',
    link_url: '/shop',
    button_text: 'View Bouquets',
    display_on: 'App, Web',
    sort_order: 2,
    is_active: true,
  },
];

const BANNERS_CACHE_KEY = 'crochus_cached_banners';

function getInitialBanners(): Banner[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(BANNERS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
  return DEFAULT_BANNERS;
}

@Injectable({ providedIn: 'root' })
export class BannerService {
  private http = inject(HttpClient);
  banners = signal<Banner[]>(getInitialBanners());

  getPublicBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${environment.apiUrl}/banners`).pipe(
      tap((res) => {
        if (res && res.length > 0) {
          this.banners.set(res);
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem(BANNERS_CACHE_KEY, JSON.stringify(res));
            }
          } catch (e) {
            // ignore storage errors
          }
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
