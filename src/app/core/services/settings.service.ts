import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { SiteSettings } from '../models';
import { environment } from '../../../environments/environment';

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: '919876543210',
  contact_email: 'hello@crochus.com',
  instagram_url: 'https://instagram.com/crochus',
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);

  settings = signal<SiteSettings>(DEFAULT_SETTINGS);
  whatsappNumber = computed(() => this.settings().whatsapp_number);

  refreshPublicSettings(): Observable<SiteSettings> {
    return this.http
      .get<SiteSettings>(`${environment.apiUrl}/settings/whatsapp`)
      .pipe(tap((settings) => this.settings.set({ ...DEFAULT_SETTINGS, ...settings })));
  }

  getWhatsappNumber(): Observable<string> {
    return this.refreshPublicSettings().pipe(map((settings) => settings.whatsapp_number));
  }

  updateWhatsappNumber(number: string): Observable<SiteSettings> {
    return this.http
      .put<SiteSettings>(`${environment.apiUrl}/admin/settings/whatsapp`, {
        whatsapp_number: number,
      })
      .pipe(tap((settings) => this.settings.set({ ...this.settings(), ...settings })));
  }
}
