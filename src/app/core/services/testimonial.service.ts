import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Testimonial } from '../models';
import { environment } from '../../../environments/environment';

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    customer_name: 'Tanu - Flower Bouquet DM',
    customer_location: 'Instagram DM',
    rating: 5,
    review_text: 'Hey received the order today. It\'s beautiful beyond what I had imagined... Just loved it!',
    image_url: 'assets/testimonials/review-1.jpg',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 2,
    customer_name: 'Ambika - Crochet Flowers Order',
    customer_location: 'Instagram DM',
    rating: 5,
    review_text: 'hyyy Thank You so much Bouquet are very beautiful',
    image_url: 'assets/testimonials/review-2.jpg',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 3,
    customer_name: 'Prolay - Sunflower Desk Decor',
    customer_location: 'Instagram DM',
    rating: 5,
    review_text: 'It\'s really beautiful.... Thank you so much for this one.. Keep it up',
    image_url: 'assets/testimonials/review-3.jpg',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 4,
    customer_name: 'Chaithra - Blue Bouquet Gift',
    customer_location: 'Instagram DM',
    rating: 5,
    review_text: 'Hey i received the package. Thanks a lot it\'s so beautifull Best gift i would ever got for myself',
    image_url: 'assets/testimonials/review-4.jpg',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 5,
    customer_name: 'Siddhesh - Sunflower Bouquet Review',
    customer_location: 'Instagram DM',
    rating: 5,
    review_text: 'My girl love the order. So happy with your work. Thanks so much for this beautiful art.',
    image_url: 'assets/testimonials/review-5.jpg',
    sort_order: 5,
    is_active: true,
  },
];

const TESTIMONIALS_CACHE_KEY = 'crochus_cached_testimonials';

function getInitialTestimonials(): Testimonial[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(TESTIMONIALS_CACHE_KEY);
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
  return DEFAULT_TESTIMONIALS;
}

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private http = inject(HttpClient);
  testimonials = signal<Testimonial[]>(getInitialTestimonials());

  getPublicTestimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(`${environment.apiUrl}/testimonials`).pipe(
      tap((res) => {
        if (res && res.length > 0) {
          this.testimonials.set(res);
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem(TESTIMONIALS_CACHE_KEY, JSON.stringify(res));
            }
          } catch (e) {
            // ignore storage errors
          }
        }
      }),
      catchError((err) => {
        console.warn('[TestimonialService] Failed to fetch testimonials, using fallback:', err);
        return of(this.testimonials());
      })
    );
  }

  getAdminTestimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(`${environment.apiUrl}/admin/testimonials`);
  }

  createTestimonial(formData: FormData): Observable<Testimonial> {
    return this.http.post<Testimonial>(`${environment.apiUrl}/admin/testimonials`, formData);
  }

  updateTestimonial(id: number, formData: FormData): Observable<Testimonial> {
    return this.http.put<Testimonial>(`${environment.apiUrl}/admin/testimonials/${id}`, formData);
  }

  deleteTestimonial(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${environment.apiUrl}/admin/testimonials/${id}`);
  }

  toggleTestimonialStatus(id: number, is_active?: boolean): Observable<Testimonial> {
    return this.http.patch<Testimonial>(`${environment.apiUrl}/admin/testimonials/${id}/status`, { is_active });
  }
}
