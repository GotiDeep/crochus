import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type" (click)="toastService.remove(toast.id)">
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      max-width: 340px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 4px solid var(--primary);
      border-radius: 6px;
      padding: 14px 18px;
      box-shadow: var(--shadow-hover);
      animation: slideIn 0.3s ease;
      cursor: pointer;
      font-size: 0.9rem;
      color: var(--text-primary);

      &.toast-error { border-left-color: var(--error-text); }
      &.toast-info { border-left-color: var(--accent); }
    }

    .toast-icon { font-size: 1rem; }

    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
  icons: Record<string, string> = { success: '✓', error: '✕', info: 'ℹ' };
}
