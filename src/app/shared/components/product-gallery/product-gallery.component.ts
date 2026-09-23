import { Component, Input, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

type MediaItem = { type: 'image'; url: string } | { type: 'video'; url: string };

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gallery" (touchstart)="onTouchStart($event)" (touchend)="onTouchEnd($event)">

      <!-- Main Display Area -->
      <div class="main-display">
        @if (activeItem()?.type === 'video') {
          <video
            [src]="activeItem()!.url"
            autoplay muted loop playsinline
            controls
            class="main-video"
          ></video>
        } @else if (activeItem()?.type === 'image') {
          <img
            [src]="activeItem()!.url"
            alt="Product photo"
            class="main-image"
            [class.fade]="fading()"
          />
        }

        <!-- Left / Right arrows on main image (only for images) -->
        @if (mediaItems().length > 1 && activeItem()?.type === 'image') {
          <button class="main-arrow left" (click)="prevMain()">&#8249;</button>
          <button class="main-arrow right" (click)="nextMain()">&#8250;</button>
        }

        <!-- Media type indicator for video -->
        @if (activeItem() && activeItem()!.type === 'video') {
          <span class="video-badge">▶ Video</span>
        }
      </div>

      <!-- Thumbnail Strip -->
      @if (mediaItems().length > 1) {
        <div class="thumb-row">
          <button
            class="nav-arrow"
            [disabled]="thumbOffset() === 0"
            (click)="shiftThumbs(-1)"
          >&#8249;</button>

          <div class="thumbs-viewport">
            <div class="thumbs-track" [style.transform]="'translateX(-' + thumbOffset() * thumbSize + 'px)'">
              @for (item of mediaItems(); track $index) {
                <button
                  class="thumb"
                  [class.active]="$index === activeIndex()"
                  (click)="setActive($index)"
                >
                  @if (item.type === 'image') {
                    <img [src]="item.url" alt="Thumbnail {{ $index + 1 }}" />
                  } @else {
                    <div class="video-thumb">
                      <span class="play-icon">▶</span>
                    </div>
                  }
                </button>
              }
            </div>
          </div>

          <button
            class="nav-arrow"
            [disabled]="thumbOffset() >= maxThumbOffset()"
            (click)="shiftThumbs(1)"
          >&#8250;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .gallery {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* ── Main Display ── */
    .main-display {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg);
      border: 1px solid var(--border);
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 0.25s ease;

      &.fade { opacity: 0; }
    }

    .main-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* ── Arrows on main image ── */
    .main-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px; height: 40px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 50%;
      font-size: 1.4rem;
      color: var(--text-primary);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      box-shadow: var(--shadow);
      padding: 0;

      &:hover { background: var(--primary); color: white; border-color: var(--primary); }
      &.left { left: 12px; }
      &.right { right: 12px; }
    }

    /* ── Video badge ── */
    .video-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      padding: 4px 10px;
      border-radius: 20px;
    }

    /* ── Thumbnail Row ── */
    .thumb-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .thumbs-viewport {
      flex: 1;
      overflow: hidden;
    }

    .thumbs-track {
      display: flex;
      gap: 8px;
      transition: transform 0.3s ease;
    }

    /* ── Nav Arrows (thumbnail strip) ── */
    .nav-arrow {
      flex-shrink: 0;
      width: 32px; height: 32px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 50%;
      font-size: 1.2rem;
      color: var(--text-primary);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      padding: 0;

      &:hover:not(:disabled) {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }

      &:disabled { opacity: 0.3; cursor: not-allowed; }
    }

    /* ── Individual Thumbnail ── */
    .thumb {
      flex-shrink: 0;
      width: 72px; height: 72px;
      border-radius: 6px;
      overflow: hidden;
      border: 2px solid var(--border);
      cursor: pointer;
      padding: 0;
      background: none;
      transition: border-color 0.2s, transform 0.2s;

      img { width: 100%; height: 100%; object-fit: cover; display: block; }

      &.active {
        border-color: var(--primary);
        transform: scale(1.04);
      }

      &:hover:not(.active) { border-color: var(--accent); }
    }

    /* ── Video Thumbnail Placeholder ── */
    .video-thumb {
      width: 100%; height: 100%;
      background: var(--text-primary);
      display: flex; align-items: center; justify-content: center;
    }

    .play-icon {
      color: var(--bg);
      font-size: 1.4rem;
      opacity: 0.85;
    }
  `]
})
export class ProductGalleryComponent implements OnChanges {
  @Input() images: string[] = [];
  @Input() videoUrl?: string | null;

  mediaItems = signal<MediaItem[]>([]);
  activeIndex = signal(0);
  fading = signal(false);
  thumbOffset = signal(0);

  /** Width of one thumb + gap (72px thumb + 8px gap) */
  readonly thumbSize = 80;
  /** How many thumbnails visible at once (approximate — CSS flex handles overflow) */
  readonly visibleThumbs = 4;

  activeItem = computed<MediaItem | null>(() => this.mediaItems()[this.activeIndex()] ?? null);

  maxThumbOffset = computed(() =>
    Math.max(0, this.mediaItems().length - this.visibleThumbs)
  );

  private touchStartX = 0;

  ngOnChanges(changes: SimpleChanges): void {
    const imgs: MediaItem[] = (this.images ?? []).map(url => ({ type: 'image', url }));
    const vid: MediaItem[] = this.videoUrl ? [{ type: 'video', url: this.videoUrl }] : [];
    this.mediaItems.set([...imgs, ...vid]);
    this.activeIndex.set(0);
    this.thumbOffset.set(0);
  }

  setActive(index: number): void {
    if (index === this.activeIndex()) return;
    this.fading.set(true);
    setTimeout(() => {
      this.activeIndex.set(index);
      this.fading.set(false);
      // Auto-scroll thumbnail strip to keep active thumb visible
      if (index >= this.thumbOffset() + this.visibleThumbs) {
        this.thumbOffset.set(Math.min(index - this.visibleThumbs + 1, this.maxThumbOffset()));
      } else if (index < this.thumbOffset()) {
        this.thumbOffset.set(index);
      }
    }, 150);
  }

  nextMain(): void {
    const next = (this.activeIndex() + 1) % this.mediaItems().length;
    this.setActive(next);
  }

  prevMain(): void {
    const prev = (this.activeIndex() - 1 + this.mediaItems().length) % this.mediaItems().length;
    this.setActive(prev);
  }

  shiftThumbs(dir: 1 | -1): void {
    this.thumbOffset.update(o => Math.max(0, Math.min(o + dir, this.maxThumbOffset())));
  }

  onTouchStart(e: TouchEvent): void { this.touchStartX = e.changedTouches[0].screenX; }
  onTouchEnd(e: TouchEvent): void {
    const diff = this.touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? this.nextMain() : this.prevMain(); }
  }
}
