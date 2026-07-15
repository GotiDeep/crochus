import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slider" (touchstart)="onTouchStart($event)" (touchend)="onTouchEnd($event)">
      <!-- Main Image -->
      <div class="main-img">
        <img [src]="photos()[current()]" alt="Product photo" />
        @if (photos().length > 1) {
          <button class="arrow left" (click)="prev()">‹</button>
          <button class="arrow right" (click)="next()">›</button>
        }
      </div>

      <!-- Dots -->
      @if (photos().length > 1) {
        <div class="dots">
          @for (photo of photos(); track $index) {
            <button class="dot" [class.active]="$index === current()" (click)="current.set($index)"></button>
          }
        </div>
      }

      <!-- Thumbnails -->
      @if (photos().length > 1) {
        <div class="thumbs">
          @for (photo of photos(); track $index) {
            <button class="thumb" [class.active]="$index === current()" (click)="current.set($index)">
              <img [src]="photo" alt="Thumbnail" />
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .slider { display: flex; flex-direction: column; gap: 12px; }

    .main-img {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: 8px;
      background: var(--bg);
      border: 1px solid var(--border);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.3s ease;
      }
    }

    .arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px; height: 40px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 50%;
      font-size: 1.3rem;
      color: var(--text-primary);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      box-shadow: var(--shadow);

      &:hover { background: var(--primary); color: white; border-color: var(--primary); }
      &.left { left: 12px; }
      &.right { right: 12px; }
    }

    .dots {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--border);
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;

      &.active { background: var(--primary); transform: scale(1.3); }
    }

    .thumbs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .thumb {
      flex-shrink: 0;
      width: 72px; height: 72px;
      border-radius: 4px;
      overflow: hidden;
      border: 2px solid var(--border);
      cursor: pointer;
      padding: 0;
      background: none;
      transition: border-color 0.2s;

      img { width: 100%; height: 100%; object-fit: cover; }
      &.active { border-color: var(--primary); }
    }
  `]
})
export class ImageSliderComponent {
  @Input() set images(v: string[]) { this.photos.set(v); this.current.set(0); }
  photos = signal<string[]>([]);
  current = signal(0);

  private touchStartX = 0;

  next() { this.current.update(c => (c + 1) % this.photos().length); }
  prev() { this.current.update(c => (c - 1 + this.photos().length) % this.photos().length); }

  onTouchStart(e: TouchEvent) { this.touchStartX = e.changedTouches[0].screenX; }
  onTouchEnd(e: TouchEvent) {
    const diff = this.touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? this.next() : this.prev(); }
  }
}
