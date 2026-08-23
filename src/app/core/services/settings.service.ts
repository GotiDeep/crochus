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

export interface SmtpSettings {
  smtp_host: string; smtp_port: number; smtp_secure: boolean; smtp_user: string;
  smtp_from: string; contact_receiver_email: string; smtp_password?: string; password_configured: boolean;
}

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

  getSmtpSettings(): Observable<SmtpSettings> { return this.http.get<SmtpSettings>(`${environment.apiUrl}/admin/settings/smtp`); }
  updateSmtpSettings(settings: SmtpSettings): Observable<SmtpSettings> { return this.http.put<SmtpSettings>(`${environment.apiUrl}/admin/settings/smtp`, settings); }
  testSmtpSettings(email: string): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${environment.apiUrl}/admin/settings/smtp/test`, { email }); }
}
