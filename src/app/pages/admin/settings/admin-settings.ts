import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminBannersComponent } from './admin-banners.component';
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
  imports: [CommonModule, FormsModule, AdminBannersComponent],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss'
})
export class AdminSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  activeTab = signal<'banners' | 'general' | 'email'>('banners');
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
    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'general') {
        this.activeTab.set('general');
      } else if (params['tab'] === 'email') {
        this.activeTab.set('email');
      } else if (params['tab'] === 'banners' || params['tab'] === 'banner') {
        this.activeTab.set('banners');
      }
    });

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

