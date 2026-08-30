import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../dashboard/admin-sidebar.component';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { SiteSettings } from '../../../core/models';

interface SmtpSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_from: string;
  contact_receiver_email: string;
  smtp_password: string;
  password_configured: boolean;
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="admin-topbar">
          <h2>Website Settings</h2>
        </div>

        <div class="settings-tabs" role="tablist">
          <button [class.active]="activeTab() === 'general'" (click)="activeTab.set('general')">
            📱 Contact & Social Media
          </button>
          <button [class.active]="activeTab() === 'email'" (click)="activeTab.set('email')">
            ✉️ Email / SMTP
          </button>
        </div>

        @if (activeTab() === 'general') {
          <section class="settings-card card">
            <div class="section-head">
              <div>
                <h3>Contact & Social Media Info</h3>
                <p>These details will dynamically update across your entire website (Header, Footer, Contact Page, Chat Buttons, and Studio Info).</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">WhatsApp Number (with Country Code) *</label>
                <input
                  class="form-control"
                  [(ngModel)]="generalSettings.whatsapp_number"
                  placeholder="e.g. 918200502248"
                  maxlength="15"
                />
                <span class="hint-text">Customer orders and WhatsApp chat buttons will direct to this number. Do not include '+'.</span>
              </div>

              <div class="form-group">
                <label class="form-label">Contact / Support Email *</label>
                <input
                  type="email"
                  class="form-control"
                  [(ngModel)]="generalSettings.contact_email"
                  placeholder="hello@crochus.com"
                />
                <span class="hint-text">Shown on Contact page and Footer for customer inquiries.</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Instagram Profile URL</label>
                <input
                  type="url"
                  class="form-control"
                  [(ngModel)]="generalSettings.instagram_url"
                  placeholder="https://instagram.com/crochus"
                />
                <span class="hint-text">Instagram links on website will open this profile.</span>
              </div>

              <div class="form-group">
                <label class="form-label">Facebook Page URL</label>
                <input
                  type="url"
                  class="form-control"
                  [(ngModel)]="generalSettings.facebook_url"
                  placeholder="https://facebook.com/crochus"
                />
                <span class="hint-text">Facebook links on website will open this page.</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Studio / Store Address</label>
              <textarea
                class="form-control"
                rows="2"
                [(ngModel)]="generalSettings.studio_address"
                placeholder="Surat, Gujarat, India 395007"
              ></textarea>
              <span class="hint-text">Displayed in the Studio address card on Contact page.</span>
            </div>

            <div class="actions" style="margin-top: 24px;">
              <button
                class="btn btn-primary"
                [disabled]="savingGeneral()"
                (click)="saveGeneralSettings()"
              >
                {{ savingGeneral() ? 'Saving…' : 'Save Social & Contact Settings' }}
              </button>
            </div>
          </section>
        } @else {
          <section class="settings-card card smtp-card">
            <div class="section-head">
              <div>
                <h3>Email / SMTP Settings</h3>
                <p>Credentials are encrypted before being saved. The saved password is never displayed.</p>
              </div>
              <span class="status" [class.ready]="smtp.password_configured">
                {{ smtp.password_configured ? 'Password saved' : 'Not configured' }}
              </span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">SMTP Host</label>
                <input class="form-control" [(ngModel)]="smtp.smtp_host" placeholder="smtp.gmail.com" />
              </div>
              <div class="form-group">
                <label class="form-label">SMTP Port</label>
                <input type="number" class="form-control" [(ngModel)]="smtp.smtp_port" placeholder="587" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">SMTP Email / Username</label>
                <input type="email" class="form-control" [(ngModel)]="smtp.smtp_user" placeholder="you@example.com" />
              </div>
              <div class="form-group">
                <label class="form-label">SMTP Password</label>
                <input
                  type="password"
                  class="form-control"
                  [(ngModel)]="smtp.smtp_password"
                  [placeholder]="smtp.password_configured ? 'Leave blank to keep saved password' : 'Enter SMTP password or app password'"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">From Email</label>
                <input type="email" class="form-control" [(ngModel)]="smtp.smtp_from" placeholder="Crochus <you@example.com>" />
              </div>
              <div class="form-group">
                <label class="form-label">Contact Receiver Email</label>
                <input type="email" class="form-control" [(ngModel)]="smtp.contact_receiver_email" placeholder="you@example.com" />
              </div>
            </div>

            <label class="checkbox">
              <input type="checkbox" [(ngModel)]="smtp.smtp_secure" /> Use SSL/TLS (normally port 465)
            </label>

            <div class="actions">
              <button class="btn btn-primary" [disabled]="savingSmtp()" (click)="saveSmtp()">
                {{ savingSmtp() ? 'Saving…' : 'Save Email Settings' }}
              </button>
            </div>

            <div class="test-box">
              <div>
                <strong>Send a test email</strong>
                <p>Save settings first, then send a test email to verify your connection.</p>
              </div>
              <input type="email" class="form-control" [(ngModel)]="testEmail" placeholder="test@example.com" />
              <button class="btn btn-ghost" [disabled]="testingSmtp()" (click)="testSmtp()">
                {{ testingSmtp() ? 'Sending…' : 'Send Test' }}
              </button>
            </div>
          </section>
        }
      </main>
    </div>
  `,
  styles: [`
    .admin-topbar { margin-bottom: 24px; h2 { margin: 0; } }
    .settings-tabs {
      display: flex; gap: 8px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
      button {
        border: 0; background: transparent; padding: 12px 18px; cursor: pointer;
        color: var(--text-secondary); border-bottom: 2px solid transparent; font: inherit; font-size: 0.95rem;
      }
      button.active { color: var(--primary); border-color: var(--primary); font-weight: 600; }
    }
    .settings-card {
      padding: 28px; max-width: 860px;
      h3 { margin: 0 0 8px; }
      p { color: var(--text-secondary); font-size: .88rem; margin: 0; line-height: 1.55; }
    }
    .section-head {
      display: flex; justify-content: space-between; gap: 16px; margin-bottom: 24px;
    }
    .status {
      align-self: start; white-space: nowrap; background: var(--error-bg);
      color: var(--error-text); font-size: .76rem; padding: 5px 9px; border-radius: 12px;
    }
    .status.ready { background: var(--success-bg); color: var(--success-text); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 18px; }
    .hint-text { display: block; font-size: 0.76rem; color: var(--text-secondary); margin-top: 4px; }
    .checkbox { display: flex; align-items: center; gap: 8px; font-size: .88rem; margin: 4px 0 22px; }
    .actions { padding-top: 8px; }
    .test-box {
      margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);
      display: grid; grid-template-columns: 1fr 220px auto; align-items: end; gap: 12px;
      strong { display: block; margin-bottom: 6px; }
    }
    @media (max-width: 640px) {
      .form-row, .test-box { grid-template-columns: 1fr; }
      .section-head { flex-direction: column; }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);

  activeTab = signal<'general' | 'email'>('general');
  savingGeneral = signal(false);
  savingSmtp = signal(false);
  testingSmtp = signal(false);

  generalSettings: SiteSettings = {
    whatsapp_number: '',
    contact_email: '',
    instagram_url: '',
    facebook_url: '',
    studio_address: '',
  };

  testEmail = '';
  smtp: SmtpSettings = {
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_from: '',
    contact_receiver_email: '',
    smtp_password: '',
    password_configured: false,
  };

  ngOnInit() {
    this.settingsService.getGeneralSettings().subscribe({
      next: (settings) => {
        this.generalSettings = { ...this.generalSettings, ...settings };
      },
      error: () => {
        this.toast.error('Could not load website settings');
      }
    });

    this.settingsService.getSmtpSettings().subscribe({
      next: (settings) => (this.smtp = { ...this.smtp, ...settings }),
      error: () => this.toast.error('Could not load email settings.'),
    });
  }

  saveGeneralSettings() {
    if (this.generalSettings.whatsapp_number && !/^\d{10,15}$/.test(this.generalSettings.whatsapp_number.trim())) {
      return this.toast.error('Enter a valid WhatsApp number with country code (e.g. 918200502248)');
    }

    this.savingGeneral.set(true);
    this.settingsService.updateGeneralSettings(this.generalSettings).subscribe({
      next: (updated) => {
        this.generalSettings = { ...this.generalSettings, ...updated };
        this.savingGeneral.set(false);
        this.toast.success('Website & Social settings updated successfully!');
      },
      error: (err) => {
        this.savingGeneral.set(false);
        this.toast.error(err instanceof Error ? err.message : 'Could not save settings');
      }
    });
  }

  saveSmtp() {
    this.savingSmtp.set(true);
    this.settingsService.updateSmtpSettings(this.smtp).subscribe({
      next: (settings) => {
        this.smtp = { ...this.smtp, ...settings, smtp_password: '' };
        this.savingSmtp.set(false);
        this.toast.success('Email settings saved');
      },
      error: () => this.savingSmtp.set(false),
    });
  }

  testSmtp() {
    if (!this.testEmail.trim()) return this.toast.error('Enter a test email address');
    this.testingSmtp.set(true);
    this.settingsService.testSmtpSettings(this.testEmail).subscribe({
      next: () => {
        this.testingSmtp.set(false);
        this.toast.success('Test email sent');
      },
      error: () => this.testingSmtp.set(false),
    });
  }
}

