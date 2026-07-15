import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="admin-login-page">
      <div class="login-card">
        <a routerLink="/" class="back-link">← Back to Store</a>
        <div class="login-icon">🔐</div>
        <h1>Admin Login</h1>
        <p>Enter your admin password to access the dashboard</p>

        <div class="form-group" style="margin-top: 28px">
          <label class="form-label">Password</label>
          <div class="pass-wrap">
            <input
              [type]="showPass() ? 'text' : 'password'"
              class="form-control"
              [(ngModel)]="password"
              placeholder="Enter admin password"
              (keydown.enter)="login()"
            />
            <button class="pass-toggle" type="button" (click)="togglePassword()">{{ showPass() ? '🙈' : '👁' }}</button>
          </div>
        </div>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <button class="btn btn-primary btn-full" [disabled]="loading()" (click)="login()">
          {{ loading() ? 'Logging in…' : 'Login to Dashboard' }}
        </button>

        <p class="hint">Admin password is managed in backend configuration.</p>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }

    .login-card {
      width: 100%;
      max-width: 380px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px 36px;
      box-shadow: var(--shadow-hover);
      text-align: center;
    }

    .back-link {
      display: block;
      font-size: 0.82rem;
      color: var(--text-secondary);
      text-decoration: none;
      margin-bottom: 24px;
      text-align: left;
      &:hover { color: var(--primary); }
    }

    .login-icon { font-size: 2.5rem; margin-bottom: 16px; }
    h1 { font-size: 1.8rem; margin-bottom: 8px; }
    p { font-size: 0.9rem; color: var(--text-secondary); }

    .pass-wrap {
      position: relative;
      .form-control { padding-right: 48px; width: 100%; }
      .pass-toggle {
        position: absolute;
        right: 12px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none;
        font-size: 1rem; cursor: pointer; opacity: 0.6;
        &:hover { opacity: 1; }
      }
    }

    .auth-error {
      background: var(--error-bg);
      color: var(--error-text);
      border-radius: 4px;
      padding: 10px 14px;
      font-size: 0.88rem;
      margin-bottom: 16px;
      text-align: left;
    }

    .hint {
      margin-top: 20px;
      font-size: 0.78rem;
      color: var(--text-secondary);
      code {
        background: var(--bg);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
        color: var(--primary);
      }
    }
  `]
})
export class AdminLoginComponent {
  private admin = inject(AdminService);
  private router = inject(Router);

  password = '';
  showPass = signal(false);
  loading = signal(false);
  error = signal('');

  constructor() {
    if (this.admin.isAdminLoggedIn()) this.router.navigate(['/admin/dashboard']);
  }

  togglePassword() {
    this.showPass.set(!this.showPass());
  }

  async login() {
    this.error.set('');
    if (!this.password) { this.error.set('Enter your password'); return; }
    this.loading.set(true);
    try {
      await this.admin.login(this.password);
      this.loading.set(false);
      this.router.navigate(['/admin/dashboard']);
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Incorrect password');
    }
  }
}
