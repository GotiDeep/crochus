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
      <!-- Left Panel: Visual & Brand Story -->
      <aside class="auth-visual">
        <div class="av-overlay"></div>
        <div class="av-inner">
          <a routerLink="/" class="auth-logo" aria-label="Crochus Home">
            <img src="assets/logo.svg" alt="Crochus" class="auth-logo-img" />
          </a>

          <div class="av-quote">
            <blockquote>"Every stitch carries patience, intention, and a piece of the maker's soul."</blockquote>
            <p class="av-attribution">— The Crochus Artisan Studio</p>
          </div>

          <div class="av-badges">
            <div class="av-badge"><span>🌿</span> 100% Hand-Crocheted</div>
            <div class="av-badge"><span>✨</span> Small-Batch Pieces</div>
            <div class="av-badge"><span>💬</span> WhatsApp Order Help</div>
          </div>
        </div>
      </aside>

      <!-- Right Panel: Form -->
      <main class="auth-form-panel">
        <div class="auth-form-inner fade-in">
          <header class="mobile-brand">
            <a routerLink="/" class="auth-logo mobile-logo" aria-label="Crochus Home">
              <img src="assets/logo.svg" alt="Crochus" class="auth-logo-img" />
            </a>
          </header>

          <a routerLink="/" class="back-home-link">← Back to Boutique</a>

          <!-- LOGIN -->
          @if (mode() === 'login') {
            <div class="form-title-group">
              <span class="section-label">Account Access</span>
              <h2>Welcome Back</h2>
              <p class="auth-sub">Sign in to view your orders, save favorites, and track custom pieces.</p>
            </div>

            <form (ngSubmit)="login()" novalidate>
              <div class="form-group">
                <label class="form-label" for="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  class="form-control"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="form-group">
                <div class="label-with-action">
                  <label class="form-label" for="login-pass">Password</label>
                  <button type="button" class="forgot-link-inline" (click)="mode.set('forgot')">Forgot password?</button>
                </div>
                <div class="pass-wrap">
                  <input
                    id="login-pass"
                    [type]="showPass() ? 'text' : 'password'"
                    class="form-control"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="Your account password"
                    autocomplete="current-password"
                    required
                  />
                  <button
                    class="pass-toggle"
                    type="button"
                    (click)="togglePassword()"
                    [attr.aria-label]="showPass() ? 'Hide password' : 'Show password'"
                  >
                    {{ showPass() ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>

              @if (error()) {
                <div class="auth-error" role="alert">{{ error() }}</div>
              }

              <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading()">
                {{ loading() ? 'Signing in…' : 'Sign In' }}
              </button>
            </form>

            <p class="auth-switch">
              Don't have an account yet?
              <button type="button" (click)="mode.set('register')">Create an account</button>
            </p>
          }

          <!-- REGISTER -->
          @if (mode() === 'register') {
            <div class="form-title-group">
              <span class="section-label">New Collector</span>
              <h2>Create Your Account</h2>
              <p class="auth-sub">Join the Crochus circle to curate wishlists and order handmade pieces.</p>
            </div>

            <form (ngSubmit)="register()" novalidate>
              <div class="form-group">
                <label class="form-label" for="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  class="form-control"
                  [(ngModel)]="fullName"
                  name="fullName"
                  placeholder="Your full name"
                  autocomplete="name"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  class="form-control"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-mobile">WhatsApp Mobile Number</label>
                <input
                  id="reg-mobile"
                  type="tel"
                  class="form-control"
                  [(ngModel)]="mobile"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  maxlength="10"
                  autocomplete="tel"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-pass">Password</label>
                <div class="pass-wrap">
                  <input
                    id="reg-pass"
                    [type]="showPass() ? 'text' : 'password'"
                    class="form-control"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="Min. 6 characters"
                    autocomplete="new-password"
                    required
                  />
                  <button
                    class="pass-toggle"
                    type="button"
                    (click)="togglePassword()"
                    [attr.aria-label]="showPass() ? 'Hide password' : 'Show password'"
                  >
                    {{ showPass() ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>

              @if (error()) {
                <div class="auth-error" role="alert">{{ error() }}</div>
              }

              <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading()">
                {{ loading() ? 'Creating account…' : 'Create Account' }}
              </button>
            </form>

            <p class="auth-switch">
              Already have an account?
              <button type="button" (click)="mode.set('login')">Sign In</button>
            </p>
          }

          <!-- OTP VERIFY -->
          @if (mode() === 'verify') {
            <div class="form-title-group">
              <span class="section-label">Verification</span>
              <h2>Verify Your Email</h2>
              <p class="auth-sub">Enter the 6-digit code sent to <strong>{{ email }}</strong></p>
            </div>

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
                  aria-label="OTP digit"
                />
              }
            </div>

            @if (error()) {
              <div class="auth-error" role="alert">{{ error() }}</div>
            }

            <button type="button" class="btn btn-primary btn-full btn-lg" [disabled]="loading()" (click)="verifyOtp()">
              {{ loading() ? 'Verifying…' : 'Verify Code' }}
            </button>

            <button type="button" class="btn-text-link" (click)="mode.set('login')">
              ← Return to Sign In
            </button>
          }

          <!-- FORGOT PASSWORD -->
          @if (mode() === 'forgot') {
            <div class="form-title-group">
              <span class="section-label">Password Recovery</span>
              <h2>Reset Password</h2>
              <p class="auth-sub">Enter your account email and we'll send a code to reset your password.</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="forgot-email">Account Email</label>
              <input
                id="forgot-email"
                type="email"
                class="form-control"
                [(ngModel)]="email"
                placeholder="you@example.com"
                required
              />
            </div>

            @if (error()) {
              <div class="auth-error" role="alert">{{ error() }}</div>
            }

            <button type="button" class="btn btn-primary btn-full btn-lg" [disabled]="loading()" (click)="sendForgotOtp()">
              {{ loading() ? 'Sending OTP…' : 'Send Reset Code' }}
            </button>

            <button type="button" class="btn-text-link" (click)="mode.set('login')">
              ← Return to Sign In
            </button>
          }

          <!-- RESET PASSWORD -->
          @if (mode() === 'reset') {
            <div class="form-title-group">
              <span class="section-label">New Credentials</span>
              <h2>Set New Password</h2>
              <p class="auth-sub">Enter the code sent to <strong>{{ email }}</strong> along with your new password.</p>
            </div>

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
                  aria-label="OTP digit"
                />
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="reset-pass">New Password</label>
              <div class="pass-wrap">
                <input
                  id="reset-pass"
                  [type]="showPass() ? 'text' : 'password'"
                  class="form-control"
                  [(ngModel)]="password"
                  placeholder="Min. 6 characters"
                  required
                />
                <button
                  class="pass-toggle"
                  type="button"
                  (click)="togglePassword()"
                  [attr.aria-label]="showPass() ? 'Hide password' : 'Show password'"
                >
                  {{ showPass() ? '🙈' : '👁' }}
                </button>
              </div>
            </div>

            @if (error()) {
              <div class="auth-error" role="alert">{{ error() }}</div>
            }

            <button type="button" class="btn btn-primary btn-full btn-lg" [disabled]="loading()" (click)="resetPassword()">
              {{ loading() ? 'Updating Password…' : 'Save New Password' }}
            </button>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .auth-page {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      min-height: 100vh;
      background: var(--bg);

      @media (max-width: 860px) {
        grid-template-columns: 1fr;
      }
    }

    .auth-visual {
      background: linear-gradient(135deg, #2C3A1A 0%, #4A5C2F 60%, #5E723D 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      @media (max-width: 860px) {
        display: none;
      }
    }

    .av-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.15), transparent 70%);
      pointer-events: none;
    }

    .av-inner {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: clamp(32px, 5vw, 64px);
      z-index: 2;
      color: #FFFFFF;
    }

    .auth-logo {
      display: inline-flex;
      align-items: center;
      text-decoration: none;

      .auth-logo-img {
        height: var(--logo-height-auth, 48px);
        width: auto;
        filter: brightness(0) invert(1);
      }
    }

    .av-quote {
      margin-top: auto;
      margin-bottom: 32px;

      blockquote {
        font-family: var(--font-heading);
        font-size: clamp(1.4rem, 2.2vw, 1.85rem);
        font-style: italic;
        color: rgba(255, 255, 255, 0.96);
        line-height: 1.4;
        border: none;
        padding: 0;
        margin: 0 0 10px;
      }

      .av-attribution {
        font-size: 0.88rem;
        color: rgba(255, 255, 255, 0.75);
        letter-spacing: 0.05em;
        margin: 0;
      }
    }

    .av-badges {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .av-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        padding: 6px 14px;
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        font-weight: 500;
        color: #FFFFFF;
      }
    }

    .auth-form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      padding: clamp(24px, 4vw, 48px) clamp(20px, 4vw, 48px);
      min-height: 100vh;
    }

    .auth-form-inner {
      width: 100%;
      max-width: 420px;
    }

    .mobile-brand {
      display: none;
      margin-bottom: 24px;

      @media (max-width: 860px) {
        display: flex;
      }

      .mobile-logo .auth-logo-img {
        height: 42px;
        width: auto;
        filter: var(--logo-filter, none);
      }
    }

    .back-home-link {
      display: inline-block;
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-decoration: none;
      margin-bottom: 24px;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--primary);
      }
    }

    .form-title-group {
      margin-bottom: 28px;

      h2 {
        font-size: clamp(1.8rem, 3vw, 2.3rem);
        margin: 6px 0 8px;
        line-height: 1.2;
      }

      .auth-sub {
        font-size: 0.92rem;
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
      }
    }

    .label-with-action {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;

      .form-label {
        margin-bottom: 0;
      }
    }

    .forgot-link-inline {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.82rem;
      cursor: pointer;
      padding: 0;

      &:hover {
        text-decoration: underline;
      }
    }

    .pass-wrap {
      position: relative;

      .form-control {
        padding-right: 48px;
        width: 100%;
      }

      .pass-toggle {
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        cursor: pointer;
        opacity: 0.65;
        border-radius: var(--radius-sm);
        transition: opacity var(--transition-fast);

        &:hover {
          opacity: 1;
        }
      }
    }

    .auth-error {
      background: var(--error-bg);
      color: var(--error-text);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      font-size: 0.88rem;
      margin-bottom: 16px;
      border: 1px solid rgba(138, 47, 47, 0.2);
    }

    .auth-switch {
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 24px;

      button {
        background: none;
        border: none;
        color: var(--primary);
        font-weight: 600;
        cursor: pointer;
        font-size: inherit;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .btn-text-link {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.9rem;
      cursor: pointer;
      display: block;
      margin: 16px auto 0;
      text-align: center;

      &:hover {
        text-decoration: underline;
      }
    }

    .otp-inputs {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 24px;
    }

    .otp-box {
      width: clamp(40px, 12vw, 48px);
      height: 56px;
      text-align: center;
      font-size: 1.4rem;
      font-weight: 600;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      outline: none;
      transition: all var(--transition-fast);

      &:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(74, 92, 47, 0.15);
      }
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
    if (!this.email || !this.password) {
      this.error.set('Please fill in both email and password');
      return;
    }
    this.loading.set(true);
    try {
      if (this.email.trim().toLowerCase() === 'admin@crochus.com') {
        await this.adminService.login(this.password);
        this.loading.set(false);
        this.toast.success('Welcome back, Admin!');
        this.router.navigate(['/admin/dashboard']);
        return;
      }

      await this.authService.login({ email: this.email, password: this.password });
      this.loading.set(false);
      this.toast.success('Welcome back to Crochus!');
      this.router.navigate([this.authService.redirectUrl || '/']);
      this.authService.redirectUrl = null;
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Login failed. Please check credentials.');
    }
  }

  async register() {
    this.error.set('');
    if (!this.fullName || !this.email || !this.mobile || !this.password) {
      this.error.set('Please fill in all required fields');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    if (!/^\d{10}$/.test(this.mobile)) {
      this.error.set('Enter a valid 10-digit mobile number');
      return;
    }
    this.loading.set(true);
    try {
      await this.authService.register({
        full_name: this.fullName,
        email: this.email,
        mobile: this.mobile,
        password: this.password
      });
      this.loading.set(false);
      this.toast.success('Account created! Welcome to Crochus 🌿');
      this.router.navigate(['/']);
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  }

  async verifyOtp() {
    this.error.set('');
    const otp = this.otpDigits.join('');
    if (otp.length < 6) {
      this.error.set('Please enter the full 6-digit verification code');
      return;
    }
    this.loading.set(true);
    try {
      await this.authService.verifyOtp(this.email, otp);
      this.loading.set(false);
      this.toast.success('Email verified! Welcome to Crochus 🌿');
      this.router.navigate(['/']);
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Invalid verification code. Please try again.');
    }
  }

  async sendForgotOtp() {
    this.error.set('');
    if (!this.email) {
      this.error.set('Please enter your account email');
      return;
    }
    this.loading.set(true);
    try {
      const response = await this.authService.sendForgotPasswordOtp(this.email);
      this.loading.set(false);
      this.toast.info(response.dev_otp ? `Dev OTP: ${response.dev_otp}` : 'Reset code sent to your email');
      this.mode.set('reset');
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Could not send reset code');
    }
  }

  async resetPassword() {
    this.error.set('');
    const otp = this.otpDigits.join('');
    if (otp.length < 6) {
      this.error.set('Please enter the 6-digit code');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    this.loading.set(true);
    try {
      await this.authService.resetPassword(this.email, otp, this.password);
      this.loading.set(false);
      this.toast.success('Password updated successfully!');
      this.mode.set('login');
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Invalid code or expired session.');
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
