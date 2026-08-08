import { Component, inject, signal, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'confirm' | 'warning';

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-custom-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="alert-overlay" (click)="onOverlayClick()">
        <div class="alert-box" [class]="'alert-' + config().type" (click)="$event.stopPropagation()">

          <!-- Logo -->
          <div class="alert-logo-wrap">
            <img src="assets/logo.svg" alt="Crochus" class="alert-logo" />
          </div>

          <!-- Icon -->
          <div class="alert-icon-wrap">
            <span class="alert-icon">{{ getIcon() }}</span>
          </div>

          <!-- Content -->
          <div class="alert-content">
            <h3 class="alert-title">{{ config().title }}</h3>
            <p class="alert-message">{{ config().message }}</p>
          </div>

          <!-- Actions -->
          <div class="alert-actions" [class.single]="config().type !== 'confirm'">
            @if (config().type === 'confirm') {
              <button class="alert-btn cancel-btn" (click)="onCancel()">
                {{ config().cancelText || 'Cancel' }}
              </button>
            }
            <button
              class="alert-btn confirm-btn"
              [class]="'confirm-' + config().type"
              (click)="onConfirm()"
            >
              {{ config().confirmText || 'OK' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .alert-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: overlayIn 0.2s ease;
    }

    @keyframes overlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes boxIn {
      from { opacity: 0; transform: scale(0.85) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .alert-box {
      background: var(--surface);
      border-radius: 20px;
      padding: 32px 28px 28px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 24px 64px rgba(0,0,0,0.2);
      animation: boxIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
      border: 1px solid var(--border);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 4px;
        border-radius: 20px 20px 0 0;
      }

      &.alert-success::before { background: linear-gradient(90deg, #4a6741, #6b9e60); }
      &.alert-error::before { background: linear-gradient(90deg, #dc2626, #f87171); }
      &.alert-confirm::before { background: linear-gradient(90deg, #d97706, #fbbf24); }
      &.alert-warning::before { background: linear-gradient(90deg, #d97706, #fbbf24); }
    }

    .alert-logo-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .alert-logo {
      height: 56px;
      width: auto;
      opacity: 0.85;
      filter: var(--logo-filter, none);
    }

    .alert-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;

      .alert-success & { background: rgba(74,103,65,0.12); }
      .alert-error & { background: rgba(220,38,38,0.1); }
      .alert-confirm & { background: rgba(217,119,6,0.1); }
      .alert-warning & { background: rgba(217,119,6,0.1); }
    }

    .alert-icon {
      font-size: 2rem;
    }

    .alert-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 8px;
    }

    .alert-message {
      font-size: 0.92rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 24px;
    }

    .alert-actions {
      display: flex;
      gap: 10px;
      justify-content: center;

      &.single { justify-content: center; }
    }

    .alert-btn {
      flex: 1;
      max-width: 160px;
      padding: 11px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      letter-spacing: 0.02em;
    }

    .cancel-btn {
      background: var(--bg);
      color: var(--text-secondary);
      border: 1px solid var(--border);
      &:hover { border-color: var(--primary); color: var(--primary); }
    }

    .confirm-btn {
      color: white;

      &.confirm-success { background: linear-gradient(135deg, #4a6741, #6b9e60); box-shadow: 0 4px 14px rgba(74,103,65,0.3); }
      &.confirm-success:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(74,103,65,0.4); }

      &.confirm-error { background: linear-gradient(135deg, #dc2626, #f87171); box-shadow: 0 4px 14px rgba(220,38,38,0.3); }
      &.confirm-error:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(220,38,38,0.4); }

      &.confirm-confirm { background: linear-gradient(135deg, #d97706, #fbbf24); box-shadow: 0 4px 14px rgba(217,119,6,0.3); }
      &.confirm-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(217,119,6,0.4); }

      &.confirm-warning { background: linear-gradient(135deg, #d97706, #fbbf24); box-shadow: 0 4px 14px rgba(217,119,6,0.3); }
      &.confirm-warning:hover { transform: translateY(-1px); }
    }
  `]
})
export class CustomAlertComponent {
  visible = signal(false);
  config = signal<AlertConfig>({
    type: 'success',
    title: '',
    message: '',
  });

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  show(cfg: AlertConfig) {
    this.config.set(cfg);
    this.visible.set(true);
  }

  hide() {
    this.visible.set(false);
  }

  getIcon(): string {
    const icons: Record<AlertType, string> = {
      success: '✅',
      error: '❌',
      confirm: '🗑️',
      warning: '⚠️'
    };
    return icons[this.config().type];
  }

  onConfirm() {
    this.hide();
    this.confirmed.emit();
  }

  onCancel() {
    this.hide();
    this.cancelled.emit();
  }

  onOverlayClick() {
    if (this.config().type !== 'confirm') {
      this.hide();
    }
  }
}
