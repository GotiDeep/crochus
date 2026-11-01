import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { FounderStory } from '../models';
import { environment } from '../../../environments/environment';

export const DEFAULT_FOUNDER_STORY: FounderStory = {
  id: 1,
  title: 'Thankyou Crochus Family',
  story_body: 'We started this journey with a simple mission: to bring you the finest products with exceptional service. Every item we offer is carefully crafted by us by our own hands with lots of love.',
  sub_message: 'Thank you for being part of our story.',
  founder_name: 'CROCHUS - Founder',
  image_url: 'assets/founder.jpg',
  is_active: true,
};

const FOUNDER_STORY_CACHE_KEY = 'crochus_cached_founder_story';

function getInitialFounderStory(): FounderStory {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(FOUNDER_STORY_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.title && parsed.story_body) {
          return parsed;
        }
      }
    }
  } catch (e) {
    // Ignore cache parse error
  }
  return DEFAULT_FOUNDER_STORY;
}

@Injectable({ providedIn: 'root' })
export class FounderStoryService {
  private http = inject(HttpClient);
  founderStory = signal<FounderStory>(getInitialFounderStory());

  getPublicFounderStory(): Observable<FounderStory> {
    return this.http.get<FounderStory>(`${environment.apiUrl}/founder-story`).pipe(
      tap((data) => {
        if (data) {
          this.founderStory.set(data);
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem(FOUNDER_STORY_CACHE_KEY, JSON.stringify(data));
            }
          } catch (e) {
            // ignore storage error
          }
        }
      }),
      catchError((err) => {
        console.warn('[FounderStoryService] Failed to fetch founder story, using fallback:', err);
        return of(this.founderStory());
      })
    );
  }

  getAdminFounderStory(): Observable<FounderStory> {
    return this.http.get<FounderStory>(`${environment.apiUrl}/admin/founder-story`);
  }

  updateFounderStory(formData: FormData): Observable<FounderStory> {
    return this.http.put<FounderStory>(`${environment.apiUrl}/admin/founder-story`, formData).pipe(
      tap((updated) => {
        if (updated) {
          this.founderStory.set(updated);
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem(FOUNDER_STORY_CACHE_KEY, JSON.stringify(updated));
            }
          } catch (e) {
            // ignore
          }
        }
      })
    );
  }
}
