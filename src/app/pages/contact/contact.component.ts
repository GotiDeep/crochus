import { Component, inject, signal, OnInit } from '@angular/core';
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
            <span class="section-label">Customer Support</span>
            <h1>Get in Touch with Us</h1>
            <p>Have questions about a handmade product, want to request a custom color or size, or need gift ideas? We are here to help!</p>
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
                <p class="social-label">Follow & Chat with Us</p>
                <div class="social-row">
                  @if (whatsappUrl()) {
                    <a [href]="whatsappUrl()" target="_blank" rel="noopener" class="social-pill wa">
                      💬 Chat on WhatsApp
                    </a>
                  }
                  @if (instagramUrl()) {
                    <a [href]="instagramUrl()" target="_blank" rel="noopener" class="social-pill">
                      📸 Instagram
                    </a>
                  }
                  @if (facebookUrl()) {
                    <a [href]="facebookUrl()" target="_blank" rel="noopener" class="social-pill fb">
                      🌐 Facebook
                    </a>
                  }
                </div>
              </div>
            </div>

            <div class="contact-form card">
              @if (!sent()) {
                <h3>Send Us a Message</h3>
                <div class="divider"></div>

                <div class="form-group floating-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" [class.error]="error() && !form.name" [(ngModel)]="form.name" placeholder="Your full name" />
                </div>
                <div class="form-group floating-group">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-control" [class.error]="error() && !form.email" [(ngModel)]="form.email" placeholder="you@example.com" />
                </div>
                <div class="form-group floating-group">
                  <label class="form-label">Subject</label>
                  <input type="text" class="form-control" [(ngModel)]="form.subject" placeholder="Custom color, gift order, bouquet inquiry…" />
                </div>
                <div class="form-group floating-group">
                  <label class="form-label">Your Message *</label>
                  <textarea class="form-control" [class.error]="error() && !form.message" [(ngModel)]="form.message" rows="5" placeholder="Tell us how we can help you…"></textarea>
                </div>

                @if (error()) { <div class="auth-error error-shake">{{ error() }}</div> }

                <button class="btn btn-primary btn-full submit-btn" [disabled]="sending()" (click)="send()">
                  @if (sending()) {
                    <span class="btn-spinner"></span>
                    <span>Sending Message…</span>
                  } @else {
                    <span>Send Message →</span>
                  }
                </button>
              } @else {
                <div class="success-msg fade-in">
                  <span style="font-size:2.8rem; color: var(--c-accent)">✦</span>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out to CROCHUS. Our team will review your message and reply within 24 hours.</p>
                  <button class="btn btn-outline" (click)="sent.set(false)">Send Another Message</button>
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

    .social-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      @media (max-width: 600px) {
        flex-direction: column;
        gap: 10px;
      }
    }

    .social-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      padding: 10px 22px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 24px;
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-primary);
      box-shadow: var(--shadow-card);
      transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

      &:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); box-shadow: var(--shadow-hover); }
      &.wa:hover { border-color: #25D366; color: #25D366; }
      &.fb:hover { border-color: #1877F2; color: #1877F2; }

      @media (max-width: 600px) {
        width: 100%;
        justify-content: center;
        min-height: 48px;
        font-size: 0.95rem;
        font-weight: 600;

        &.wa {
          background: #25D366;
          color: #ffffff;
          border-color: #25D366;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
        }
      }
    }

    .contact-form {
      padding: 32px;
      border-radius: 14px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      h3 { margin-bottom: 16px; font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; }

      @media (max-width: 600px) {
        padding: 20px 14px;
      }
    }

    .floating-group {
      position: relative;
      margin-bottom: 22px;

      .form-label {
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-secondary);
        transition: color 0.2s ease;
      }

      &:focus-within .form-label {
        color: var(--primary);
      }
    }

    .auth-error {
      background: var(--error-bg);
      color: var(--error-text);
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 0.88rem;
      margin-bottom: 16px;
      border: 1px solid color-mix(in srgb, var(--error-text) 20%, transparent);

      &.error-shake {
        animation: errorShake 0.4s ease-in-out;
      }
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 48px;
      font-size: 0.95rem;
    }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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
export class ContactComponent implements OnInit {
  private contactService = inject(ContactService);
  private settings = inject(SettingsService);

  menuOpen = signal(false);
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
