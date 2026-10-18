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
          <header class="contact-header">
            <span class="section-label">Say Hello & Custom Orders</span>
            <h1>Get in Touch with Our Studio</h1>
            <p>
              Whether you'd like a custom piece, have questions about yarns and care, or want to order
              for an event, we'd love to chat.
            </p>
          </header>

          <div class="contact-layout">
            <!-- Left: Info & WhatsApp -->
            <div class="contact-info">
              <!-- WhatsApp Priority Card -->
              <a [href]="whatsappUrl()" target="_blank" rel="noopener" class="contact-card card wa-highlight">
                <div class="card-icon-wrap wa-icon-wrap">💬</div>
                <div class="card-text">
                  <div class="card-title-row">
                    <h4>WhatsApp Direct</h4>
                    <span class="badge-wa">Fastest · 2-4 hrs</span>
                  </div>
                  <p class="card-detail">+{{ settings.whatsappNumber() }}</p>
                  <span class="card-action">Chat on WhatsApp →</span>
                </div>
              </a>

              <!-- Email Card -->
              <a [href]="emailUrl()" class="contact-card card">
                <div class="card-icon-wrap">✉️</div>
                <div class="card-text">
                  <h4>Email Us</h4>
                  <p class="card-detail">{{ settings.settings().contact_email || 'hello@crochus.com' }}</p>
                  <span class="card-action">Send an email →</span>
                </div>
              </a>

              <!-- Studio Card -->
              <a [href]="mapsUrl()" target="_blank" rel="noopener" class="contact-card card">
                <div class="card-icon-wrap">📍</div>
                <div class="card-text">
                  <h4>Artisan Studio</h4>
                  <p class="card-detail">{{ settings.settings().studio_address || 'Surat, Gujarat, India 395007' }}</p>
                  <span class="card-action">View on Google Maps →</span>
                </div>
              </a>

              <!-- Custom Commission Trust Card -->
              <div class="custom-note card">
                <div class="custom-badge">🌿 Custom Orders</div>
                <h4>Looking for a unique colorway or size?</h4>
                <p>
                  We hand-crochet custom flower bouquets, wearables, and home decor. Send us a photo
                  or palette reference on WhatsApp for a quick estimate!
                </p>
              </div>

              <!-- Social Links -->
              <div class="social-block">
                <p class="social-label">Follow Our Making Journey</p>
                <div class="social-row">
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
                  @if (whatsappUrl()) {
                    <a [href]="whatsappUrl()" target="_blank" rel="noopener" class="social-pill wa">
                      💬 WhatsApp
                    </a>
                  }
                </div>
              </div>
            </div>

            <!-- Right: Interactive Form -->
            <div class="contact-form card">
              @if (!sent()) {
                <div class="form-header">
                  <h3>Send Us a Note</h3>
                  <p>Leave a message and we'll reply to your inbox within 24 hours.</p>
                </div>
                <div class="divider"></div>

                <div class="form-group">
                  <label class="form-label" for="contact-name">Your Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    class="form-control"
                    [(ngModel)]="form.name"
                    placeholder="Full name"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    class="form-control"
                    [(ngModel)]="form.email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="contact-subject">Subject</label>
                  <input
                    id="contact-subject"
                    type="text"
                    class="form-control"
                    [(ngModel)]="form.subject"
                    placeholder="Custom order / Product query / General question"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    class="form-control"
                    [(ngModel)]="form.message"
                    rows="5"
                    placeholder="Tell us what you have in mind…"
                    required
                  ></textarea>
                </div>

                @if (error()) {
                  <div class="auth-error" role="alert">{{ error() }}</div>
                }

                <button
                  class="btn btn-primary btn-full btn-lg"
                  [disabled]="sending()"
                  (click)="send()"
                >
                  {{ sending() ? 'Sending your message…' : 'Send Message' }}
                </button>
              } @else {
                <div class="success-msg fade-in" role="status">
                  <div class="success-icon-badge">💌</div>
                  <h3>Message Sent with Love!</h3>
                  <p>
                    Thank you for reaching out, {{ form.name || 'friend' }}. We have received your note and will get
                    back to you within 24 hours.
                  </p>
                  <button class="btn btn-outline" (click)="resetForm()">Send Another Note</button>
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
    .contact-header {
      padding: clamp(32px, 5vw, 56px) 0 clamp(24px, 4vw, 36px);
      max-width: 680px;

      h1 {
        font-size: clamp(2rem, 3.5vw, 3rem);
        margin: 10px 0 14px;
        line-height: 1.15;
      }

      p {
        font-size: 1.05rem;
        color: var(--text-secondary);
        line-height: 1.65;
        margin: 0;
      }
    }

    .contact-layout {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: clamp(24px, 4vw, 48px);
      align-items: start;
      padding-bottom: clamp(48px, 6vw, 80px);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .contact-card {
      display: flex;
      align-items: flex-start;
      gap: 18px;
      padding: 22px 24px;
      text-decoration: none;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
      border-radius: var(--radius-md);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-hover);
        border-color: var(--primary);
      }

      &.wa-highlight {
        background: linear-gradient(135deg, rgba(37, 211, 102, 0.05), var(--surface));
        border-color: rgba(37, 211, 102, 0.35);

        &:hover {
          border-color: #25D366;
        }
      }

      .card-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-sm);
        background: var(--bg);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        flex-shrink: 0;

        &.wa-icon-wrap {
          background: rgba(37, 211, 102, 0.12);
          border-color: rgba(37, 211, 102, 0.25);
        }
      }

      .card-text {
        flex: 1;
        min-width: 0;

        .card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        h4 {
          font-size: 0.98rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .badge-wa {
          font-size: 0.72rem;
          font-weight: 600;
          color: #128C7E;
          background: rgba(37, 211, 102, 0.16);
          padding: 2px 8px;
          border-radius: 12px;
          letter-spacing: 0.02em;
        }

        .card-detail {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0 0 6px;
          word-break: break-word;
        }

        .card-action {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary);
          display: inline-block;
        }
      }
    }

    .custom-note {
      padding: 24px;
      border-radius: var(--radius-md);
      background: var(--surface-warm);
      border: 1px solid var(--border);

      .custom-badge {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--accent);
        margin-bottom: 8px;
      }

      h4 {
        font-size: 1.05rem;
        font-weight: 600;
        margin: 0 0 8px;
        color: var(--text-primary);
      }

      p {
        font-size: 0.88rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }

    .social-block {
      padding-top: 8px;

      .social-label {
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: 12px;
        font-weight: 600;
      }
    }

    .social-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .social-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      min-height: 44px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
        transform: translateY(-1px);
      }

      &.wa:hover {
        border-color: #25D366;
        color: #25D366;
      }

      &.fb:hover {
        border-color: #1877F2;
        color: #1877F2;
      }
    }

    .contact-form {
      padding: clamp(24px, 4vw, 36px);
      border-radius: var(--radius-md);

      .form-header {
        h3 {
          font-size: 1.35rem;
          margin: 0 0 6px;
        }

        p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }
      }
    }

    .auth-error {
      background: var(--error-bg);
      color: var(--error-text);
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      font-size: 0.9rem;
      margin-bottom: 16px;
      border: 1px solid rgba(138, 47, 47, 0.2);
    }

    .success-msg {
      text-align: center;
      padding: clamp(32px, 5vw, 48px) 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .success-icon-badge {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(74, 92, 47, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
      }

      h3 {
        font-size: 1.5rem;
        margin: 0;
        color: var(--text-primary);
      }

      p {
        max-width: 380px;
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  private contactService = inject(ContactService);
  settings = inject(SettingsService);

  menuOpen = signal(false);
  sending = signal(false);
  sent = signal(false);
  error = signal('');

  form = { name: '', email: '', subject: '', message: '' };

  ngOnInit() {
    this.settings.refreshPublicSettings().subscribe();
  }

  instagramUrl() {
    return this.settings.settings().instagram_url || 'https://instagram.com/crochus';
  }

  facebookUrl() {
    return this.settings.settings().facebook_url || 'https://facebook.com/crochus';
  }

  whatsappUrl() {
    const num = this.settings.whatsappNumber() || '918200502248';
    return `https://wa.me/${num}?text=${encodeURIComponent('Hello Crochus! I am interested in custom crochet pieces.')}`;
  }

  emailUrl() {
    const email = this.settings.settings().contact_email || 'hello@crochus.com';
    return `mailto:${email}?subject=${encodeURIComponent('Crochus Inquiry')}`;
  }

  mapsUrl() {
    const addr = this.settings.settings().studio_address || 'Surat, Gujarat, India 395007';
    return `https://maps.google.com/?q=${encodeURIComponent(addr)}`;
  }

  resetForm() {
    this.sent.set(false);
    this.form = { name: '', email: '', subject: '', message: '' };
  }

  send() {
    this.error.set('');
    if (!this.form.name.trim() || !this.form.email.trim() || !this.form.message.trim()) {
      this.error.set('Please fill in your name, email, and message.');
      return;
    }

    this.sending.set(true);
    this.contactService.submitMessage(this.form)
      .then(() => {
        this.sending.set(false);
        this.sent.set(true);
      })
      .catch((error) => {
        this.sending.set(false);
        this.error.set(error instanceof Error ? error.message : 'Could not send your message. Please reach us on WhatsApp!');
      });
  }
}
