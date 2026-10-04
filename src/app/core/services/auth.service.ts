import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AuthOtpResponse,
  AuthResponse,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  User,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'crochus_token';
  private readonly USER_KEY = 'crochus_user';
  private readonly SESSION_EXPIRY_KEY = 'crochus_session_expiry';
  // 2 hours in milliseconds
  private readonly SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);
  isSessionExpired = signal(false);
  redirectUrl: string | null = null;
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.cleanLegacyStorage();
    this.loadFromStorage();
  }

  /**
   * Remove any legacy persistent tokens previously saved in localStorage
   * so sessions are strictly managed via sessionStorage.
   */
  private cleanLegacyStorage() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.SESSION_EXPIRY_KEY);
    } catch {
      // Storage access safety
    }
  }

  private loadFromStorage() {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    const userValue = sessionStorage.getItem(this.USER_KEY);
    const expiryValue = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);

    if (!token || !userValue) {
      return;
    }

    // Check if the 2-hour session has already expired
    if (expiryValue) {
      const expiry = Number(expiryValue);
      const remainingTime = expiry - Date.now();

      if (remainingTime <= 0) {
        this.handleSessionExpired();
        return;
      }

      this.startSessionTimer(remainingTime);
    } else {
      // If legacy or missing expiry, set it now
      const newExpiry = Date.now() + this.SESSION_DURATION_MS;
      sessionStorage.setItem(this.SESSION_EXPIRY_KEY, String(newExpiry));
      this.startSessionTimer(this.SESSION_DURATION_MS);
    }

    try {
      const user = JSON.parse(userValue) as User;
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
    } catch {
      this.logout();
    }
  }

  private persistSession(response: AuthResponse) {
    const expiry = Date.now() + this.SESSION_DURATION_MS;
    sessionStorage.setItem(this.TOKEN_KEY, response.token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    sessionStorage.setItem(this.SESSION_EXPIRY_KEY, String(expiry));

    this.currentUser.set(response.user);
    this.isLoggedIn.set(true);
    this.isSessionExpired.set(false);

    this.startSessionTimer(this.SESSION_DURATION_MS);
  }

  private startSessionTimer(durationMs: number) {
    this.clearSessionTimer();
    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpired();
    }, durationMs);
  }

  private clearSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Called when 2 hours elapse or when backend returns 401 Unauthorized
   */
  handleSessionExpired() {
    this.clearSessionTimer();
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);

    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.isSessionExpired.set(true);
  }

  dismissSessionExpired() {
    this.isSessionExpired.set(false);
  }

  async login(payload: LoginPayload): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
    );

    this.persistSession(response);
  }

  async register(payload: RegisterPayload): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
    );
    this.persistSession(response);
  }

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/verify-otp`, { email, otp })
    );

    this.persistSession(response);
    return response;
  }

  async sendForgotPasswordOtp(email: string): Promise<AuthOtpResponse> {
    return firstValueFrom(
      this.http.post<AuthOtpResponse>(`${environment.apiUrl}/auth/forgot-password`, { email })
    );
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<MessageResponse> {
    return firstValueFrom(
      this.http.post<MessageResponse>(`${environment.apiUrl}/auth/reset-password`, {
        email,
        otp,
        new_password: newPassword,
      })
    );
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const updatedUser = await firstValueFrom(
      this.http.put<User>(`${environment.apiUrl}/profile`, data)
    );

    sessionStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    this.currentUser.set(updatedUser);
    return updatedUser;
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  logout() {
    this.clearSessionTimer();
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
    this.cleanLegacyStorage();

    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.isSessionExpired.set(false);
    this.router.navigate(['/']);
  }
}
