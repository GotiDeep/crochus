import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (auth.isSessionExpired()) {
      <div class="session-overlay" (click)="onOverlayClick()">
        <div class="session-box" (click)="$event.stopPropagation()">

          <!-- Crochus Brand Logo -->
          <div class="session-logo-wrap">
            <img src="assets/logo.svg" alt="Crochus" class="session-logo" />
          </div>

          <!-- Timeout Icon -->
          <div class="session-icon-wrap">
            <span class="session-icon">⏳</span>
          </div>

          <!-- Content -->
          <div class="session-content">
            <h3 class="session-title">Session Expired</h3>
            <p class="session-message">
              Please login again, your session has been expired.
            </p>
          </div>

          <!-- Actions -->
          <div class="session-actions">
            <button class="session-btn login-btn" (click)="onLoginAgain()">
              Login Again
            </button>
            <button class="session-btn dismiss-btn" (click)="onDismiss()">
              Close
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .session-overlay {
      position: fixed;
      inset: 0;
      background: rgba(28, 26, 23, 0.65);
      backdrop-filter: blur(6px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: sessionOverlayFade 0.25s ease-out;
    }

    @keyframes sessionOverlayFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes sessionBoxPop {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(24px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .session-box {
      background: #FAF6EF;
      border: 1px solid #E8E2D5;
      border-radius: 24px;
      padding: 34px 28px 28px;
      width: 100%;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 24px 64px rgba(28, 26, 23, 0.22);
      animation: sessionBoxPop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(90deg, #B45B3E, #D4C98A, #6F8F80);
      }
    }

    .session-logo-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 14px;
      user-select: none;
    }

    .session-logo {
      height: 38px;
      width: auto;
      opacity: 0.9;
      user-select: none;
      -webkit-user-select: none;
      -webkit-user-drag: none;
      pointer-events: none;
    }

    .session-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(180, 91, 62, 0.12);
      border: 1px solid rgba(180, 91, 62, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      animation: pulseSession 2s infinite ease-in-out;
    }

    @keyframes pulseSession {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }

    .session-icon {
      font-size: 1.85rem;
      line-height: 1;
    }

    .session-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: #1C1A17;
      margin: 0 0 8px;
      letter-spacing: 0.01em;
    }

    .session-message {
      font-size: 0.94rem;
      color: #5C5850;
      line-height: 1.6;
      margin: 0 0 24px;
    }

    .session-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .session-btn {
      flex: 1;
      padding: 12px 20px;
      border-radius: 30px;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .login-btn {
      background: #B45B3E;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(180, 91, 62, 0.28);

      &:hover {
        background: #9A4A30;
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(180, 91, 62, 0.38);
      }
    }

    .dismiss-btn {
      background: transparent;
      color: #5C5850;
      border: 1px solid #E8E2D5;

      &:hover {
        background: rgba(28, 26, 23, 0.04);
        color: #1C1A17;
        border-color: #1C1A17;
      }
    }
  `]
})
export class SessionModalComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  onLoginAgain() {
    this.auth.dismissSessionExpired();
    this.router.navigate(['/login']);
  }

  onDismiss() {
    this.auth.dismissSessionExpired();
  }

  onOverlayClick() {
    this.onDismiss();
  }
}
