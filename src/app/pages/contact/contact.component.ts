import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';
import { ContactService } from '../../core/services/contact.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent, FooterComponent, HamburgerMenuComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar (openMenu)="menuOpen.set(true)" />
      <app-hamburger-menu [isOpen]="menuOpen()" (close)="menuOpen.set(false)" />

      <main class="main-content">
        <div class="container">
          <div class="page-header">
            <span class="section-label">Say Hello</span>
            <h1>Get in Touch</h1>
            <p>We'd love to hear from you — whether it's a question, a custom order, or just to share your love for handmade things.</p>
          </div>

          <div class="contact-layout">
            <div class="contact-info">
              @for (item of contactItems; track item.title) {
                <a [href]="item.href" target="_blank" class="contact-card card">
                  <span class="contact-icon">{{ item.icon }}</span>
                  <div>
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.detail }}</p>
                  </div>
                </a>
              }

              <div class="social-block">
                <p class="social-label">Follow us</p>
                <div class="social-row">
                  <a [href]="instagramUrl()" target="_blank" class="social-pill">ðŸ“¸ Instagram</a>
                  <a [href]="whatsappUrl()" target="_blank" class="social-pill wa">ðŸ’¬ WhatsApp</a>
                </div>
              </div>
            </div>

            <div class="contact-form card">
              @if (!sent()) {
                <h3>Send us a message</h3>
                <div class="divider"></div>

                <div class="form-group">
                  <label class="form-label">Your Name</label>
                  <input type="text" class="form-control" [(ngModel)]="form.name" placeholder="Full name" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" [(ngModel)]="form.email" placeholder="you@example.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Subject</label>
                  <input type="text" class="form-control" [(ngModel)]="form.subject" placeholder="What's it about?" />
                </div>
                <div class="form-group">
                  <label class="form-label">Message</label>
                  <textarea class="form-control" [(ngModel)]="form.message" rows="5" placeholder="Write your message here…"></textarea>
                </div>

                @if (error()) { <div class="auth-error">{{ error() }}</div> }

                <button class="btn btn-primary btn-full" [disabled]="sending()" (click)="send()">
                  {{ sending() ? 'Sending…' : 'Send Message' }}
                </button>
              } @else {
                <div class="success-msg fade-in">
                  <span style="font-size:3rem">ðŸ’Œ</span>
                  <h3>Message sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button class="btn btn-outline" (click)="sent.set(false)">Send another</button>
                </div>
              }
            </div>
          </div>
        </div>
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    .page-header { padding: 48px 0 48px; p { max-width: 520px; margin-top: 12px; font-size: 1rem; } }

    .contact-layout {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 40px;
      align-items: start;
      padding-bottom: 80px;

      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .contact-info { display: flex; flex-direction: column; gap: 16px; }

    .contact-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px 24px;
      text-decoration: none;
      transition: all 0.2s;

      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }

      .contact-icon { font-size: 1.6rem; flex-shrink: 0; }

      h4 { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
      p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
    }

    .social-block {
      padding: 20px 0 0;
      .social-label { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; font-weight: 500; }
    }

    .social-row { display: flex; gap: 10px; }
    .social-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 24px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-primary);
      transition: all 0.2s;

      &:hover { border-color: var(--primary); color: var(--primary); }
      &.wa:hover { border-color: #25D366; color: #25D366; }
    }

    .contact-form {
      padding: 32px;
      h3 { margin-bottom: 16px; }
    }

    .auth-error {
      background: var(--error-bg);
      color: var(--error-text);
      border-radius: 4px;
      padding: 10px 14px;
      font-size: 0.88rem;
      margin-bottom: 16px;
    }

    .success-msg {
      text-align: center;
      padding: 40px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      h3 { margin: 8px 0 4px; }
      p { max-width: 300px; font-size: 0.9rem; }
    }
  `]
})
export class ContactComponent {
  private contactService = inject(ContactService);
  private settings = inject(SettingsService);

  menuOpen = signal(false);
  sending = signal(false);
  sent = signal(false);
  error = signal('');

  form = { name: '', email: '', subject: '', message: '' };

  get contactItems() {
    const settings = this.settings.settings();

    return [
      {
        icon: 'ðŸ’¬',
        title: 'WhatsApp',
        detail: `+${this.settings.whatsappNumber()}`,
        href: this.whatsappUrl(),
      },
      {
        icon: 'ðŸ“§',
        title: 'Email',
        detail: settings.contact_email || 'hello@crochus.com',
        href: `mailto:${settings.contact_email || 'hello@crochus.com'}`,
      },
      {
        icon: 'ðŸ“',
        title: 'Studio',
        detail: 'Surat, Gujarat, India 395007',
        href: 'https://maps.google.com',
      },
    ];
  }

  instagramUrl() {
    return this.settings.settings().instagram_url || 'https://instagram.com/crochus';
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
