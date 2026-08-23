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

  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);
  redirectUrl: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userValue = localStorage.getItem(this.USER_KEY);

    if (!token || !userValue) {
      return;
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
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
    this.isLoggedIn.set(true);
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

    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    this.currentUser.set(updatedUser);
    return updatedUser;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
