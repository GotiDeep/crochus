import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  HostListener,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BannerService, DEFAULT_BANNERS } from '../../../core/services/banner.service';
import { Banner } from '../../../core/models';

@Component({
  selector: 'app-hero-banner-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section
      class="hero-banner-slider"
      #sliderContainer
      (mouseenter)="pauseAutoSlide()"
      (mouseleave)="resumeAutoSlide()"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
      (mousedown)="onMouseDown($event)"
      (mousemove)="onMouseMove($event)"
      (mouseup)="onMouseUp()"
      aria-roledescription="carousel"
      aria-label="Handmade Hero Banners"
    >
      <!-- Slides Wrapper -->
      <div
        class="slider-track"
        [style.transform]="trackTransform()"
        [style.transition]="isDragging() ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'"
      >
        @for (banner of banners(); track banner.id; let idx = $index) {
          <div
            class="slider-slide"
            [class.active]="currentSlide() === idx"
            [attr.aria-hidden]="currentSlide() !== idx"
          >
            <!-- Banner Background Image -->
            <div class="slide-img-wrap" (click)="onBannerClick(banner)">
              <img
                [src]="banner.image_url"
                [alt]="banner.title || banner.name"
                class="slide-img"
                [attr.fetchpriority]="idx === 0 ? 'high' : 'auto'"
                [attr.loading]="idx === 0 ? 'eager' : 'lazy'"
                draggable="false"
              />
              <div class="slide-overlay"></div>
            </div>

            <!-- Slide Content / Text Overlay -->
            <div class="slide-content-container container">
              <div class="slide-content" (click)="$event.stopPropagation()">
                <span class="slide-badge">🧶 Handmade with Love · CROCHUS</span>
                @if (banner.title) {
                  <h2 class="slide-title">{{ banner.title }}</h2>
                }
                @if (banner.subtitle) {
                  <p class="slide-subtitle">{{ banner.subtitle }}</p>
                }
                <div class="slide-actions">
                  <a
                    [routerLink]="banner.link_url || '/shop'"
                    class="btn btn-primary btn-slide"
                  >
                    {{ banner.button_text || 'Explore Collection' }}
                    <span class="btn-arrow" aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Arrow Controls -->
      @if (banners().length > 1) {
        <button
          class="nav-btn prev-btn"
          (click)="prevSlide($event)"
          aria-label="Previous slide"
          title="Previous Banner"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button
          class="nav-btn next-btn"
          (click)="nextSlide($event)"
          aria-label="Next slide"
          title="Next Banner"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      }

      <!-- Pagination Indicators / Dots -->
      @if (banners().length > 1) {
        <div class="slider-dots" role="tablist">
          @for (banner of banners(); track banner.id; let idx = $index) {
            <button
              class="dot-btn"
              [class.active]="currentSlide() === idx"
              (click)="goToSlide(idx, $event)"
              [attr.aria-label]="'Go to slide ' + (idx + 1)"
              role="tab"
              [attr.aria-selected]="currentSlide() === idx"
            >
              <span class="dot-inner"></span>
            </button>
          }
        </div>
      }

      <!-- Bottom Trust Ribbon -->
      <div class="slider-bottom-strip">
        <div class="container strip-content">
          <div class="strip-item">
            <span class="s-icon">🧶</span>
            <span>100% Handcrafted</span>
          </div>
          <div class="strip-item">
            <span class="s-icon">🌸</span>
            <span>Everlasting Bouquets</span>
          </div>
          <div class="strip-item">
            <span class="s-icon">✨</span>
            <span>Custom Orders on WhatsApp</span>
          </div>
          <div class="strip-item">
            <span class="s-icon">🚚</span>
            <span>Pan-India Delivery</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .hero-banner-slider {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: var(--c-bg, #F5F0E0);
      user-select: none;
      touch-action: pan-y;
      margin: 0;
      padding: 0;
    }

    .slider-track {
      display: flex;
      width: 100%;
      will-change: transform;
    }

    .slider-slide {
      position: relative;
      flex: 0 0 100%;
      width: 100%;
      min-height: 520px;
      height: clamp(480px, 58vw, 620px);
      display: flex;
      align-items: center;
      overflow: hidden;

      @media (max-width: 900px) {
        min-height: 400px;
        height: 50vw;
      }
      @media (max-width: 600px) {
        min-height: 320px;
        height: 82vw;
      }
      @media (max-width: 420px) {
        min-height: 290px;
        height: 88vw;
      }
    }

    .slide-img-wrap {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    .slide-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 38%;
      transition: transform 6s ease-out;
      display: block;
    }

    .slider-slide.active .slide-img {
      transform: scale(1.03);
    }

    /* Gradient overlay for text legibility and rich atmosphere */
    .slide-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(30, 42, 17, 0.88) 0%,
        rgba(30, 42, 17, 0.65) 45%,
        rgba(30, 42, 17, 0.25) 80%,
        rgba(30, 42, 17, 0.45) 100%
      );

      @media (max-width: 600px) {
        background: linear-gradient(
          180deg,
          rgba(30, 42, 17, 0.35) 0%,
          rgba(30, 42, 17, 0.72) 50%,
          rgba(30, 42, 17, 0.88) 100%
        );
      }
    }

    .slide-content-container {
      position: relative;
      z-index: 2;
      width: 100%;
      pointer-events: none;
    }

    .slide-content {
      max-width: 580px;
      color: #FFFFFF;
      pointer-events: auto;
      padding: 24px 0 36px;
      animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

      @media (max-width: 600px) {
        max-width: 100%;
        padding: 16px 0 28px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
    }

    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .slide-badge {
      display: inline-block;
      font-size: 0.76rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #D4C98A;
      background: rgba(44, 58, 26, 0.6);
      backdrop-filter: blur(8px);
      padding: 5px 12px;
      border-radius: 20px;
      border: 1px solid rgba(212, 201, 138, 0.35);
      margin-bottom: 14px;

      @media (max-width: 600px) {
        font-size: 0.68rem;
        padding: 4px 10px;
        margin-bottom: 8px;
      }
    }

    .slide-title {
      font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
      font-size: clamp(1.85rem, 4.4vw, 3.4rem);
      line-height: 1.12;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0 0 12px;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);

      @media (max-width: 600px) {
        font-size: 1.55rem;
        line-height: 1.18;
        margin-bottom: 8px;
      }
    }

    .slide-subtitle {
      font-size: clamp(0.88rem, 1.4vw, 1.05rem);
      line-height: 1.55;
      color: #F5F0E0;
      margin: 0 0 22px;
      opacity: 0.95;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);

      @media (max-width: 600px) {
        font-size: 0.82rem;
        line-height: 1.4;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .slide-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-slide {
      background: #4A5C2F;
      color: #FFFFFF;
      border: 1px solid #D4C98A;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 26px;
      font-size: 0.94rem;
      font-weight: 600;
      border-radius: 30px;
      text-decoration: none;
      transition: all 0.25s ease;

      &:hover {
        background: #2C3A1A;
        border-color: #FFFFFF;
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
        color: #FFFFFF;
      }

      .btn-arrow {
        transition: transform 0.2s ease;
      }
      &:hover .btn-arrow {
        transform: translateX(4px);
      }

      @media (max-width: 600px) {
        padding: 9px 18px;
        font-size: 0.84rem;
      }
    }

    /* ── Arrow Navigation Buttons ── */
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      color: #2C3A1A;
      border: 1px solid rgba(212, 201, 138, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
      transition: all 0.25s ease;

      &:hover {
        background: #4A5C2F;
        color: #FFFFFF;
        border-color: #4A5C2F;
        transform: translateY(-50%) scale(1.08);
      }

      &.prev-btn {
        left: 20px;
      }
      &.next-btn {
        right: 20px;
      }

      @media (max-width: 768px) {
        width: 38px;
        height: 38px;
        &.prev-btn { left: 10px; }
        &.next-btn { right: 10px; }
      }
      @media (max-width: 480px) {
        width: 34px;
        height: 34px;
        background: rgba(255, 255, 255, 0.75);
      }
    }

    /* ── Pagination Dots ── */
    .slider-dots {
      position: absolute;
      bottom: 50px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      z-index: 10;
      pointer-events: auto;

      @media (max-width: 600px) {
        bottom: 40px;
        gap: 8px;
      }
    }

    .dot-btn {
      background: transparent;
      border: none;
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      .dot-inner {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.55);
        border: 1px solid rgba(44, 58, 26, 0.4);
        transition: all 0.3s ease;
      }

      &.active .dot-inner {
        width: 28px;
        border-radius: 12px;
        background: #D4C98A;
        border-color: #FFFFFF;
        box-shadow: 0 0 10px rgba(212, 201, 138, 0.8);
      }

      &:hover:not(.active) .dot-inner {
        background: rgba(255, 255, 255, 0.9);
      }
    }

    /* ── Bottom Trust Strip ── */
    .slider-bottom-strip {
      background: #2C3A1A;
      color: #F5F0E0;
      border-top: 1px solid rgba(212, 201, 138, 0.25);
      padding: 10px 0;
      font-size: 0.82rem;
      letter-spacing: 0.04em;

      .strip-content {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px 20px;
      }

      .strip-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        white-space: nowrap;

        .s-icon {
          font-size: 0.95rem;
        }
      }

      @media (max-width: 600px) {
        font-size: 0.72rem;
        padding: 8px 0;
        .strip-content {
          justify-content: center;
          gap: 6px 14px;
        }
      }
    }
  `]
})
export class HeroBannerSliderComponent implements OnInit, OnDestroy {
  private bannerService = inject(BannerService);
  private router = inject(Router);

  @ViewChild('sliderContainer', { static: true }) sliderContainer!: ElementRef<HTMLElement>;

  banners = signal<Banner[]>(DEFAULT_BANNERS);
  currentSlide = signal(0);
  isDragging = signal(false);

  private autoSlideTimer: any = null;
  private autoSlideIntervalMs = 4500; // 4.5 seconds

  // Touch / Drag swipe variables
  private startX = 0;
  private currentX = 0;
  private dragDelta = 0;
  private isSwiping = false;

  trackTransform = computed(() => {
    const baseTranslate = -(this.currentSlide() * 100);
    if (this.isDragging() && this.sliderContainer?.nativeElement) {
      const containerWidth = this.sliderContainer.nativeElement.clientWidth || 1;
      const deltaPercent = (this.dragDelta / containerWidth) * 100;
      return `translateX(${baseTranslate + deltaPercent}%)`;
    }
    return `translateX(${baseTranslate}%)`;
  });

  ngOnInit() {
    this.bannerService.getPublicBanners().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.banners.set(data);
        }
      },
      error: () => {
        // Fallback already set
      }
    });

    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.clearAutoSlide();
  }

  startAutoSlide() {
    this.clearAutoSlide();
    this.autoSlideTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideIntervalMs);
  }

  clearAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  pauseAutoSlide() {
    this.clearAutoSlide();
  }

  resumeAutoSlide() {
    this.startAutoSlide();
  }

  nextSlide(event?: Event) {
    if (event) event.stopPropagation();
    const total = this.banners().length;
    if (total <= 1) return;
    this.currentSlide.update((curr) => (curr + 1) % total);
  }

  prevSlide(event?: Event) {
    if (event) event.stopPropagation();
    const total = this.banners().length;
    if (total <= 1) return;
    this.currentSlide.update((curr) => (curr - 1 + total) % total);
  }

  goToSlide(index: number, event?: Event) {
    if (event) event.stopPropagation();
    this.currentSlide.set(index);
    this.startAutoSlide(); // reset timer
  }

  onBannerClick(banner: Banner) {
    if (Math.abs(this.dragDelta) > 10) return; // Ignore if user was swiping
    const link = banner.link_url || '/shop';
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank');
    } else {
      this.router.navigateByUrl(link);
    }
  }

  // ── Touch Handling (Mobile / Tablet Swipe) ──
  onTouchStart(e: TouchEvent) {
    if (this.banners().length <= 1) return;
    this.pauseAutoSlide();
    this.startX = e.touches[0].clientX;
    this.currentX = this.startX;
    this.dragDelta = 0;
    this.isSwiping = true;
    this.isDragging.set(true);
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isSwiping) return;
    this.currentX = e.touches[0].clientX;
    this.dragDelta = this.currentX - this.startX;
  }

  onTouchEnd() {
    if (!this.isSwiping) return;
    this.finishSwipe();
  }

  // ── Mouse Drag Handling (Desktop Swipe) ──
  onMouseDown(e: MouseEvent) {
    if (this.banners().length <= 1) return;
    if ((e.target as HTMLElement).closest('button, a')) return;
    this.pauseAutoSlide();
    this.startX = e.clientX;
    this.currentX = this.startX;
    this.dragDelta = 0;
    this.isSwiping = true;
    this.isDragging.set(true);
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isSwiping) return;
    this.currentX = e.clientX;
    this.dragDelta = this.currentX - this.startX;
  }

  onMouseUp() {
    if (!this.isSwiping) return;
    this.finishSwipe();
  }

  @HostListener('window:mouseup')
  onWindowMouseUp() {
    if (this.isSwiping) {
      this.finishSwipe();
    }
  }

  private finishSwipe() {
    this.isSwiping = false;
    this.isDragging.set(false);
    const threshold = 45; // min px to trigger slide change

    if (this.dragDelta < -threshold) {
      this.nextSlide();
    } else if (this.dragDelta > threshold) {
      this.prevSlide();
    }

    this.dragDelta = 0;
    this.resumeAutoSlide();
  }
}
