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
  templateUrl: './hero-banner-slider.html',
  styleUrl: './hero-banner-slider.scss'
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
