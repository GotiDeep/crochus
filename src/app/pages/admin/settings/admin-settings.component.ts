import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../dashboard/admin-sidebar.component';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="admin-topbar">
          <h2>Settings</h2>
        </div>

        <div class="settings-grid">
          <!-- WhatsApp Settings -->
          <div class="settings-card card">
            <div class="settings-icon">💬</div>
            <h3>WhatsApp Number</h3>
            <p>Orders will be sent to this WhatsApp number. Include country code without +.</p>
            <div class="form-group" style="margin-top:20px">
              <label class="form-label">WhatsApp Number</label>
              <input type="text" class="form-control" [(ngModel)]="waNumber" placeholder="919876543210" maxlength="15" />
              <span style="font-size:0.78rem; color:var(--text-secondary); margin-top:6px; display:block">
                Format: 91XXXXXXXXXX (country code + number)
              </span>
            </div>
            <button class="btn btn-primary" [disabled]="savingWa()" (click)="saveWa()">
              {{ savingWa() ? 'Saving…' : 'Save WhatsApp Number' }}
            </button>
          </div>

          <!-- Store Info (static display) -->
          <div class="settings-card card">
            <div class="settings-icon">🏪</div>
            <h3>Store Info</h3>
            <p>Crochus store information (managed in code).</p>
            <div class="info-list">
              <div class="info-row">
                <span class="info-key">Store Name</span>
                <span>Crochus</span>
              </div>
              <div class="info-row">
                <span class="info-key">Instagram</span>
                <span>&#64;crochus</span>
              </div>
              <div class="info-row">
                <span class="info-key">Email</span>
                <span>hello&#64;crochus.com</span>
              </div>
            </div>
          </div>

          <!-- Admin Security -->
          <div class="settings-card card">
            <div class="settings-icon">🔐</div>
            <h3>Admin Access</h3>
            <p>Admin panel is protected by a single password. Change it in the backend configuration.</p>
            <div class="security-note">
              <span>⚠️</span>
              <p>Password management is handled server-side via environment variables for security.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-topbar { margin-bottom: 28px; h2 { margin: 0; } }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .settings-card {
      padding: 28px;

      .settings-icon { font-size: 2rem; margin-bottom: 12px; display: block; }
      h3 { font-size: 1rem; margin-bottom: 8px; }
      p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
    }

    .info-list { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      &:last-child { border: none; padding: 0; }

      .info-key { color: var(--text-secondary); }
    }

    .security-note {
      display: flex;
      gap: 10px;
      background: rgba(212,201,138,0.12);
      border: 1px solid var(--accent);
      border-radius: 6px;
      padding: 14px;
      margin-top: 20px;
      font-size: 0.82rem;

      p { margin: 0; color: var(--text-secondary); font-size: 0.82rem; }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);

  savingWa = signal(false);
  waNumber = '';

  ngOnInit() {
    this.settingsService.getWhatsappNumber().subscribe(n => this.waNumber = n);
  }

  saveWa() {
    if (!this.waNumber.trim() || !/^\d{10,15}$/.test(this.waNumber)) {
      this.toast.error('Enter a valid number with country code');
      return;
    }
    this.savingWa.set(true);
    this.settingsService.updateWhatsappNumber(this.waNumber).subscribe(() => {
      this.savingWa.set(false);
      this.toast.success('WhatsApp number updated!');
    });
  }
}
