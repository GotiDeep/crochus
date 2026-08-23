import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../dashboard/admin-sidebar.component';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

interface SmtpSettings {
  smtp_host: string; smtp_port: number; smtp_secure: boolean; smtp_user: string;
  smtp_from: string; contact_receiver_email: string; smtp_password: string; password_configured: boolean;
}

@Component({
  selector: 'app-admin-settings', standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout"><app-admin-sidebar /><main class="admin-main">
      <div class="admin-topbar"><h2>Settings</h2></div>
      <div class="settings-tabs" role="tablist">
        <button [class.active]="activeTab() === 'mobile'" (click)="activeTab.set('mobile')">Mobile Number</button>
        <button [class.active]="activeTab() === 'email'" (click)="activeTab.set('email')">Email / SMTP</button>
      </div>

      @if (activeTab() === 'mobile') {
        <section class="settings-card card compact-card">
          <h3>WhatsApp Mobile Number</h3>
          <p>Orders will be sent to this number. Include country code without +.</p>
          <div class="form-group"><label class="form-label">WhatsApp Number</label><input class="form-control" [(ngModel)]="waNumber" placeholder="919876543210" maxlength="15" /></div>
          <button class="btn btn-primary" [disabled]="savingWa()" (click)="saveWa()">{{ savingWa() ? 'Saving…' : 'Save Mobile Number' }}</button>
        </section>
      } @else {
        <section class="settings-card card smtp-card">
          <div class="section-head"><div><h3>Email / SMTP Settings</h3><p>Credentials are encrypted before being saved. The saved password is never displayed.</p></div><span class="status" [class.ready]="smtp.password_configured">{{ smtp.password_configured ? 'Password saved' : 'Not configured' }}</span></div>
          <div class="form-row"><div class="form-group"><label class="form-label">SMTP Host</label><input class="form-control" [(ngModel)]="smtp.smtp_host" placeholder="smtp.gmail.com" /></div><div class="form-group"><label class="form-label">SMTP Port</label><input type="number" class="form-control" [(ngModel)]="smtp.smtp_port" placeholder="587" /></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">SMTP Email / Username</label><input type="email" class="form-control" [(ngModel)]="smtp.smtp_user" placeholder="you@example.com" /></div><div class="form-group"><label class="form-label">SMTP Password</label><input type="password" class="form-control" [(ngModel)]="smtp.smtp_password" [placeholder]="smtp.password_configured ? 'Leave blank to keep saved password' : 'Enter SMTP password or app password'" /></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">From Email</label><input type="email" class="form-control" [(ngModel)]="smtp.smtp_from" placeholder="Crochus <you@example.com>" /></div><div class="form-group"><label class="form-label">Contact Receiver Email</label><input type="email" class="form-control" [(ngModel)]="smtp.contact_receiver_email" placeholder="you@example.com" /></div></div>
          <label class="checkbox"><input type="checkbox" [(ngModel)]="smtp.smtp_secure" /> Use SSL/TLS (normally port 465)</label>
          <div class="actions"><button class="btn btn-primary" [disabled]="savingSmtp()" (click)="saveSmtp()">{{ savingSmtp() ? 'Saving…' : 'Save Email Settings' }}</button></div>
          <div class="test-box"><div><strong>Send a test email</strong><p>Save settings first, then send a test email to verify your connection.</p></div><input type="email" class="form-control" [(ngModel)]="testEmail" placeholder="test@example.com" /><button class="btn btn-ghost" [disabled]="testingSmtp()" (click)="testSmtp()">{{ testingSmtp() ? 'Sending…' : 'Send Test' }}</button></div>
        </section>
      }
    </main></div>`,
  styles: [`
    .admin-topbar { margin-bottom: 24px; h2 { margin: 0; } }
    .settings-tabs { display:flex; gap:8px; border-bottom:1px solid var(--border); margin-bottom:24px; button { border:0; background:transparent; padding:12px 16px; cursor:pointer; color:var(--text-secondary); border-bottom:2px solid transparent; font:inherit; } button.active { color:var(--primary); border-color:var(--primary); font-weight:600; } }
    .settings-card { padding:28px; max-width:860px; h3 { margin:0 0 8px; } p { color:var(--text-secondary); font-size:.88rem; margin:0; line-height:1.55; } }
    .compact-card { max-width:540px; .form-group { margin:22px 0; } }
    .section-head { display:flex; justify-content:space-between; gap:16px; margin-bottom:24px; } .status { align-self:start; white-space:nowrap; background:var(--error-bg); color:var(--error-text); font-size:.76rem; padding:5px 9px; border-radius:12px; } .status.ready { background:var(--success-bg); color:var(--success-text); }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; } .form-group { margin-bottom:18px; } .checkbox { display:flex; align-items:center; gap:8px; font-size:.88rem; margin:4px 0 22px; } .actions { border-bottom:1px solid var(--border); padding-bottom:24px; }
    .test-box { margin-top:24px; display:grid; grid-template-columns:1fr 220px auto; align-items:end; gap:12px; strong { display:block; margin-bottom:6px; } }
    @media (max-width:640px) { .form-row,.test-box { grid-template-columns:1fr; } .section-head { flex-direction:column; } }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService); private toast = inject(ToastService);
  activeTab = signal<'mobile' | 'email'>('mobile'); savingWa = signal(false); savingSmtp = signal(false); testingSmtp = signal(false); waNumber = ''; testEmail = '';
  smtp: SmtpSettings = { smtp_host: '', smtp_port: 587, smtp_secure: false, smtp_user: '', smtp_from: '', contact_receiver_email: '', smtp_password: '', password_configured: false };
  ngOnInit() { this.settingsService.getWhatsappNumber().subscribe(n => this.waNumber = n); this.settingsService.getSmtpSettings().subscribe({ next: settings => this.smtp = { ...this.smtp, ...settings }, error: () => this.toast.error('Could not load email settings. Run the database migration first.') }); }
  saveWa() { if (!/^\d{10,15}$/.test(this.waNumber.trim())) return this.toast.error('Enter a valid number with country code'); this.savingWa.set(true); this.settingsService.updateWhatsappNumber(this.waNumber).subscribe({ next: () => { this.savingWa.set(false); this.toast.success('Mobile number updated'); }, error: () => this.savingWa.set(false) }); }
  saveSmtp() { this.savingSmtp.set(true); this.settingsService.updateSmtpSettings(this.smtp).subscribe({ next: settings => { this.smtp = { ...this.smtp, ...settings, smtp_password: '' }; this.savingSmtp.set(false); this.toast.success('Email settings saved'); }, error: () => this.savingSmtp.set(false) }); }
  testSmtp() { if (!this.testEmail.trim()) return this.toast.error('Enter a test email address'); this.testingSmtp.set(true); this.settingsService.testSmtpSettings(this.testEmail).subscribe({ next: () => { this.testingSmtp.set(false); this.toast.success('Test email sent'); }, error: () => this.testingSmtp.set(false) }); }
}
