import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent implements OnInit {
  private contactService = inject(ContactService);
  private settings = inject(SettingsService);

  sending = signal(false);
  sent = signal(false);
  error = signal('');

  form = { name: '', email: '', subject: '', message: '' };

  ngOnInit() {
    this.settings.refreshPublicSettings().subscribe();
  }

  get contactItems() {
    const settings = this.settings.settings();

    return [
      {
        icon: '💬',
        title: 'WhatsApp',
        detail: `+${this.settings.whatsappNumber()}`,
        href: this.whatsappUrl(),
      },
      {
        icon: '✉️',
        title: 'Email',
        detail: settings.contact_email || 'hello@crochus.com',
        href: `mailto:${settings.contact_email || 'hello@crochus.com'}`,
      },
      {
        icon: '📍',
        title: 'Studio',
        detail: settings.studio_address || 'Surat, Gujarat, India 395007',
        href: 'https://maps.google.com/?q=' + encodeURIComponent(settings.studio_address || 'Surat, Gujarat, India 395007'),
      },
    ];
  }

  instagramUrl() {
    return this.settings.settings().instagram_url || 'https://instagram.com/crochus';
  }

  facebookUrl() {
    return this.settings.settings().facebook_url || 'https://facebook.com/crochus';
  }

  whatsappUrl() {
    return `https://wa.me/${this.settings.whatsappNumber()}`;
  }

  send() {
    this.error.set('');
    if (!this.form.name || !this.form.email || !this.form.message) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.sending.set(true);
    this.contactService.submitMessage(this.form)
      .then(() => {
        this.sending.set(false);
        this.sent.set(true);
        this.form = { name: '', email: '', subject: '', message: '' };
      })
      .catch((error) => {
        this.sending.set(false);
        this.error.set(error instanceof Error ? error.message : 'Could not send your message');
      });
  }
}
