import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <!-- Left Panel -->
      <div class="auth-visual">
        <div class="av-inner">
          <a routerLink="/" class="auth-logo">
            <img src="assets/logo.svg" alt="Crochus" class="auth-logo-img" />
          </a>
          <div class="av-quote">
            <blockquote>"Every handmade piece carries a piece of the maker's soul."</blockquote>
          </div>
          <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80" alt="Artisan" class="av-img" />
        </div>
      </div>

      <!-- Right Panel -->
      <div class="auth-form-panel">
        <div class="auth-form-inner">
          <a routerLink="/" class="auth-logo mobile-logo">
            <img src="assets/logo.svg" alt="Crochus" class="auth-logo-img" />
          </a>

          <!-- LOGIN -->
          @if (mode() === 'login') {
            <h2>Welcome back</h2>
            <p class="auth-sub">Sign in to your account to continue shopping</p>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="email" placeholder="you@example.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="pass-wrap">
                <input [type]="showPass() ? 'text' : 'password'" class="form-control" [(ngModel)]="password" placeholder="Your password" />
                <button class="pass-toggle" type="button" (click)="togglePassword()">{{ showPass() ? '🙈' : '👁' }}</button>
              </div>
            </div>

            <button class="forgot-link" (click)="mode.set('forgot')">Forgot password?</button>

            @if (error()) { <div class="auth-error">{{ error() }}</div> }

            <button class="btn btn-primary btn-full btn-lg" [disabled]="loading()" (click)="login()">
              {{ loading() ? 'Signing in…' : 'Sign In' }}
            </button>

            <p class="auth-switch">Don't have an account? <button (click)="mode.set('register')">Register</button></p>
          }

          <!-- REGISTER -->
          @if (mode() === 'register') {
            <h2>Create account</h2>
            <p class="auth-sub">Join Crochus to start collecting handmade treasures</p>

            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control" [(ngModel)]="fullName" placeholder="Your full name" />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="email" placeholder="you@example.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Mobile</label>
              <input type="tel" class="form-control" [(ngModel)]="mobile" placeholder="10-digit mobile number" maxlength="10" />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="pass-wrap">
                <input [type]="showPass() ? 'text' : 'password'" class="form-control" [(ngModel)]="password" placeholder="Min. 6 characters" />
                <button class="pass-toggle" type="button" (click)="togglePassword()">{{ showPass() ? '🙈' : '👁' }}</button>
              </div>
            </div>

            @if (error()) { <div class="auth-error">{{ error() }}</div> }

            <button class="btn btn-primary btn-full btn-lg" [disabled]="loading()" (click)="register()">
              {{ loading() ? 'Creating account…' : 'Create Account' }}
            </button>

            <p class="auth-switch">Already have an account? <button (click)="mode.set('login')">Sign In</button></p>
          }

          <!-- OTP VERIFY -->
          @if (mode() === 'verify') {
            <h2>Verify your email</h2>
            <p class="auth-sub">We sent a 6-digit OTP to <strong>{{ email }}</strong></p>

            <div class="otp-inputs">
              @for (i of [0,1,2,3,4,5]; track i) {
                <input
                  type="text"
                  maxlength="1"
                  class="otp-box"
                  [(ngModel)]="otpDigits[i]"
                  (input)="onOtpInput($event, i)"
                  (keydown)="onOtpKeydown($event, i)"
                  [id]="'otp-' + i"
                />
              }
            </div>

            @if (error()) { <div class="auth-error">{{ error() }}</div> }

            <button class="btn btn-primary btn-full btn-lg" [disabled]="loading()" (click)="verifyOtp()">
              {{ loading() ? 'Verifying…' : 'Verify OTP' }}
            </button>

            <button class="forgot-link" (click)="mode.set('login')" style="margin-top:12px; display:block; text-align:center">
              ← Back to Login
            </button>
          }

          <!-- FORGOT PASSWORD -->
          @if (mode() === 'forgot') {
            <h2>Reset password</h2>
            <p class="auth-sub">Enter your email and we'll send an OTP to reset your password</p>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="email" placeholder="you@example.com" />
            </div>

            @if (error()) { <div class="auth-error">{{ error() }}</div> }

            <button class="btn btn-primary btn-full btn-lg" [disabled]="loading()" (click)="sendForgotOtp()">
              {{ loading() ? 'Sending OTP…' : 'Send OTP' }}
            </button>

            <button class="forgot-link" (click)="mode.set('login')" style="margin-top:12px; display:block; text-align:center">
              ← Back to Login
            </button>
          }

          <!-- RESET PASSWORD -->
          @if (mode() === 'reset') {
            <h2>Set new password</h2>
            <p class="auth-sub">Enter the OTP sent to <strong>{{ email }}</strong> and your new password</p>

            <div class="otp-inputs" style="margin-bottom:20px">
              @for (i of [0,1,2,3,4,5]; track i) {
                <input type="text" maxlength="1" class="otp-box"
                  [(ngModel)]="otpDigits[i]"
                  (input)="onOtpInput($event, i)"
                  (keydown)="onOtpKeydown($event, i)"
                  [id]="'otp-' + i" />
              }
            </div>

            <div class="form-group">
              <label class="form-label">New Password</label>
              <div class="pass-wrap">
                <input [type]="showPass() ? 'text' : 'password'" class="form-control" [(ngModel)]="password" placeholder="Min. 6 characters" />
                <button class="pass-toggle" type="button" (click)="togglePassword()">{{ showPass() ? '🙈' : '👁' }}</button>
              </div>
            </div>

            @if (error()) { <div class="auth-error">{{ error() }}</div> }

            <button class="btn btn-primary btn-full btn-lg" [disabled]="loading()" (click)="resetPassword()">
              {{ loading() ? 'Updating…' : 'Update Password' }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .auth-visual {
      background: var(--primary);
      position: relative;
      overflow: hidden;

      @media (max-width: 768px) { display: none; }
    }

    .av-inner {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 48px;
      z-index: 2;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      text-decoration: none;

      .auth-logo-img {
        height: 66px;
        width: auto;
        transform: scale(1.18);
        transform-origin: left center;
        filter: brightness(10) invert(0);
      }
    }

    .mobile-logo {
      display: none;
      margin-bottom: 32px;

      .auth-logo-img {
        height: 66px;
        width: auto;
        transform: scale(1.18);
        transform-origin: left center;
        filter: var(--logo-filter, none);
      }

      @media (max-width: 768px) { display: flex; }
    }

    .av-quote {
      margin-top: auto;
      margin-bottom: 32px;

      blockquote {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.4rem;
        font-style: italic;
        color: rgba(255,255,255,0.9);
        line-height: 1.5;
        border: none;
        padding: 0;
        margin: 0;
      }
    }

    .av-img {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      opacity: 0.2;
      z-index: -1;
    }

    .auth-form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      padding: 48px 32px;
      min-height: 100vh;
    }

    .auth-form-inner {
      width: 100%;
      max-width: 420px;

      h2 { margin-bottom: 8px; }
    }

    .auth-sub {
      margin-bottom: 32px;
      font-size: 0.95rem;
    }

    .pass-wrap {
      position: relative;
      .form-control { padding-right: 48px; width: 100%; }
      .pass-toggle {
        position: absolute;
        right: 12px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none;
        font-size: 1rem; cursor: pointer;
        opacity: 0.6;
        &:hover { opacity: 1; }
      }
    }

    .forgot-link {
      background: none; border: none;
      color: var(--primary); font-size: 0.85rem;
      cursor: pointer; padding: 0;
      margin-bottom: 20px; display: block;
      text-align: right; width: 100%;
      &:hover { text-decoration: underline; }
    }

    .auth-error {
      background: var(--error-bg);
      color: var(--error-text);
      border-radius: 4px;
      padding: 10px 14px;
      font-size: 0.88rem;
      margin-bottom: 16px;
    }

    .auth-switch {
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 20px;

      button {
        background: none; border: none;
        color: var(--primary); font-weight: 600;
        cursor: pointer; font-size: inherit;
        &:hover { text-decoration: underline; }
      }
    }

    /* OTP */
    .otp-inputs {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 28px;
    }

    .otp-box {
      width: 48px; height: 56px;
      text-align: center;
      font-size: 1.3rem;
      font-weight: 600;
      background: var(--input-bg);
      border: 1.5px solid var(--border);
      border-radius: 8px;
      color: var(--text-primary);
      outline: none;
      transition: border-color 0.2s;

      &:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(74,92,47,0.12); }
    }
  `]
})
export class AuthComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  mode = signal<Mode>('login');
  loading = signal(false);
  error = signal('');
  showPass = signal(false);

  email = '';
  password = '';
  fullName = '';
  mobile = '';
  otpDigits: string[] = ['', '', '', '', '', ''];

  ngOnInit() {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'register') this.mode.set('register');

    if (this.adminService.isAdminLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.authService.redirectUrl || '/']);
    }
  }

  togglePassword() {
    this.showPass.set(!this.showPass());
  }

  async login() {
    this.error.set('');
    if (!this.email || !this.password) { this.error.set('Please fill in all fields'); return; }
    this.loading.set(true);
    try {
      if (this.email.trim().toLowerCase() === 'admin@crochus.com') {
        await this.adminService.login(this.password);
        this.loading.set(false);
        this.toast.success('Welcome admin!');
        this.router.navigate(['/admin/dashboard']);
        return;
      }

      await this.authService.login({ email: this.email, password: this.password });
      this.loading.set(false);
      this.toast.success('Welcome back!');
      this.router.navigate([this.authService.redirectUrl || '/']);
      this.authService.redirectUrl = null;
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async register() {
    this.error.set('');
    if (!this.fullName || !this.email || !this.mobile || !this.password) {
      this.error.set('Please fill in all fields'); return;
    }
    if (this.password.length < 6) { this.error.set('Password must be at least 6 characters'); return; }
    if (!/^\d{10}$/.test(this.mobile)) { this.error.set('Enter a valid 10-digit mobile number'); return; }
    this.loading.set(true);
    try {
      await this.authService.register({
        full_name: this.fullName,
        email: this.email,
        mobile: this.mobile,
        password: this.password
      });
      this.loading.set(false);
      this.toast.success('Account created! Welcome to Crochus');
      this.router.navigate(['/']);
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  }

  async verifyOtp() {
    this.error.set('');
    const otp = this.otpDigits.join('');
    if (otp.length < 6) { this.error.set('Enter the 6-digit OTP'); return; }
    this.loading.set(true);
    try {
      await this.authService.verifyOtp(this.email, otp);
      this.loading.set(false);
      this.toast.success('Account created! Welcome to Crochus 🌿');
      this.router.navigate(['/']);
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
    }
  }

  async sendForgotOtp() {
    this.error.set('');
    if (!this.email) { this.error.set('Enter your email'); return; }
    this.loading.set(true);
    try {
      const response = await this.authService.sendForgotPasswordOtp(this.email);
      this.loading.set(false);
      this.toast.info(response.dev_otp ? `Dev OTP: ${response.dev_otp}` : 'OTP sent to your email');
      this.mode.set('reset');
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Could not send OTP');
    }
  }

  async resetPassword() {
    this.error.set('');
    const otp = this.otpDigits.join('');
    if (otp.length < 6) { this.error.set('Enter the 6-digit OTP'); return; }
    if (this.password.length < 6) { this.error.set('Password must be at least 6 characters'); return; }
    this.loading.set(true);
    try {
      await this.authService.resetPassword(this.email, otp, this.password);
      this.loading.set(false);
      this.toast.success('Password updated!');
      this.mode.set('login');
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
    }
  }

  onOtpInput(event: Event, index: number) {
    const val = (event.target as HTMLInputElement).value;
    this.otpDigits[index] = val.slice(-1);
    if (val && index < 5) {
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    }
  }
}
