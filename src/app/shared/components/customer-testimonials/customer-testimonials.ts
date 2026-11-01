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
import { TestimonialService } from '../../../core/services/testimonial.service';
import { Testimonial } from '../../../core/models';

@Component({
  selector: 'app-customer-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-testimonials.html',
  styleUrl: './customer-testimonials.scss'
})
export class CustomerTestimonialsComponent implements OnInit, OnDestroy {
  private testimonialService = inject(TestimonialService);

  @ViewChild('sliderTrackRef') sliderTrackRef?: ElementRef<HTMLElement>;

  testimonials = signal<Testimonial[]>(this.testimonialService.testimonials());
  sliderItems = signal<Testimonial[]>([]);
  currentIndex = signal(0);
  noTransition = signal(false);
  isDragging = signal(false);
  visibleCount = signal(5);

  previewImage = signal<string | null>(null);

  private autoSlideTimer: any = null;
  private autoSlideIntervalMs = 2800; // 2.8 seconds
  private baseCount = 0;
  private cloneCount = 5;

  // Touch / Drag variables
  private startX = 0;
  private currentX = 0;
  dragDelta = signal(0);
  private wasDragging = false;

  trackTransform = computed(() => {
    const vis = this.visibleCount();
    const itemPercent = 100 / vis;
    const baseTranslate = -(this.currentIndex() * itemPercent);

    if (this.isDragging() && this.sliderTrackRef?.nativeElement) {
      const containerWidth = this.sliderTrackRef.nativeElement.clientWidth || 1;
      const deltaPercent = (this.dragDelta() / containerWidth) * 100;
      return `translateX(${baseTranslate + deltaPercent}%)`;
    }

    return `translateX(${baseTranslate}%)`;
  });

  dotsList = computed(() => {
    const count = Math.min(Math.max(this.baseCount, 1), 5);
    return new Array(count).fill(0);
  });

  activeDot = computed(() => {
    if (this.baseCount === 0) return 0;
    const rel = (this.currentIndex() - this.cloneCount) % this.baseCount;
    const normalized = (rel + this.baseCount) % this.baseCount;
    const dotCount = this.dotsList().length;
    return normalized % dotCount;
  });

  ngOnInit() {
    this.updateVisibleCount();

    this.testimonialService.getPublicTestimonials().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.testimonials.set(data);
          this.setupSlider(data);
        }
      },
      error: () => {
        this.setupSlider(this.testimonials());
      }
    });

    if (this.testimonials().length > 0) {
      this.setupSlider(this.testimonials());
    }
  }

  ngOnDestroy() {
    this.clearAutoSlide();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateVisibleCount();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.closeLightbox();
  }

  private updateVisibleCount() {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    const count = w <= 380 ? 1.6 : w <= 560 ? 2.2 : w <= 800 ? 3.2 : w <= 1100 ? 4.2 : 5.2;
    if (this.visibleCount() !== count) {
      this.visibleCount.set(count);
    }
  }

  setupSlider(items: Testimonial[]) {
    if (!items || items.length === 0) return;

    if (items.length === 1) {
      this.baseCount = 1;
      this.sliderItems.set(items);
      return;
    }

    // Expand items if fewer than 10 so it loops seamlessly
    let expanded = [...items];
    while (expanded.length < 10) {
      expanded = [...expanded, ...items];
    }

    this.baseCount = expanded.length;
    this.cloneCount = 5;

    const cloned = [
      ...expanded.slice(-this.cloneCount),
      ...expanded,
      ...expanded.slice(0, this.cloneCount)
    ];

    this.sliderItems.set(cloned);
    this.currentIndex.set(this.cloneCount);
    this.noTransition.set(true);

    setTimeout(() => {
      this.noTransition.set(false);
      this.startAutoSlide();
    }, 60);
  }

  startAutoSlide() {
    this.clearAutoSlide();
    if (this.baseCount < 2) return;

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
    if (!this.isDragging() && !this.previewImage()) {
      this.startAutoSlide();
    }
  }

  nextSlide(event?: Event) {
    if (event) event.stopPropagation();
    if (this.baseCount === 0) return;
    this.noTransition.set(false);
    const next = this.currentIndex() + 1;
    this.currentIndex.set(next);

    // If reaching the end clone boundary, smoothly snap to base
    if (next >= this.cloneCount + this.baseCount) {
      setTimeout(() => {
        this.noTransition.set(true);
        this.currentIndex.set(this.cloneCount);
        setTimeout(() => this.noTransition.set(false), 50);
      }, 500);
    }
  }

  prevSlide(event?: Event) {
    if (event) event.stopPropagation();
    if (this.baseCount === 0) return;
    this.noTransition.set(false);
    const prev = this.currentIndex() - 1;
    this.currentIndex.set(prev);

    // If reaching the start clone boundary, smoothly snap to end
    if (prev < this.cloneCount) {
      setTimeout(() => {
        this.noTransition.set(true);
        this.currentIndex.set(this.cloneCount + this.baseCount - 1);
        setTimeout(() => this.noTransition.set(false), 50);
      }, 500);
    }
  }

  goToDot(dotIndex: number, event?: Event) {
    if (event) event.stopPropagation();
    this.noTransition.set(false);
    this.currentIndex.set(this.cloneCount + dotIndex);
    this.resumeAutoSlide();
  }

  onCardClick(item: Testimonial) {
    if (this.wasDragging) return;
    this.openLightbox(item.image_url);
  }

  openLightbox(imageUrl: string) {
    this.pauseAutoSlide();
    this.previewImage.set(imageUrl);
  }

  closeLightbox() {
    this.previewImage.set(null);
    this.resumeAutoSlide();
  }

  // ── Touch Handling (Mobile / Tablet Swipe) ──
  onTouchStart(e: TouchEvent) {
    if (this.sliderItems().length < 2) return;
    this.pauseAutoSlide();
    this.startX = e.touches[0].clientX;
    this.currentX = this.startX;
    this.dragDelta.set(0);
    this.isDragging.set(true);
    this.wasDragging = false;
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isDragging()) return;
    this.currentX = e.touches[0].clientX;
    const diff = this.currentX - this.startX;
    this.dragDelta.set(diff);
    if (Math.abs(diff) > 8) {
      this.wasDragging = true;
    }
  }

  onTouchEnd() {
    if (!this.isDragging()) return;
    this.finishSwipe();
  }

  // ── Mouse Drag Handling (Desktop Swipe) ──
  onMouseDown(e: MouseEvent) {
    if (this.sliderItems().length < 2) return;
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    this.pauseAutoSlide();
    this.startX = e.clientX;
    this.currentX = this.startX;
    this.dragDelta.set(0);
    this.isDragging.set(true);
    this.wasDragging = false;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging()) return;
    this.currentX = e.clientX;
    const diff = this.currentX - this.startX;
    this.dragDelta.set(diff);
    if (Math.abs(diff) > 8) {
      this.wasDragging = true;
    }
  }

  onMouseUp() {
    if (!this.isDragging()) return;
    this.finishSwipe();
  }

  @HostListener('window:mouseup')
  onWindowMouseUp() {
    if (this.isDragging()) {
      this.finishSwipe();
    }
  }

  private finishSwipe() {
    this.isDragging.set(false);
    const threshold = 35; // minimum px to advance
    const delta = this.dragDelta();

    if (delta < -threshold) {
      this.nextSlide();
    } else if (delta > threshold) {
      this.prevSlide();
    }

    this.dragDelta.set(0);
    setTimeout(() => {
      this.wasDragging = false;
      this.resumeAutoSlide();
    }, 50);
  }
}
