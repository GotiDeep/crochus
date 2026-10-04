import { Directive, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';

@Directive({ selector: '[scrollProgress]', standalone: true })
export class ScrollProgressDirective implements OnInit, OnDestroy {
  private raf = 0;
  private tick = () => {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => { this.raf = 0; this.update(); });
  };
  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.el.nativeElement.style.setProperty('--p', '1');
      return;
    }
    this.zone.runOutsideAngular(() => {
      addEventListener('scroll', this.tick, { passive: true });
      addEventListener('resize', this.tick);
    });
    this.update();
  }
  private update() {
    const e = this.el.nativeElement, r = e.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.9 + vh * 0.1)));
    e.style.setProperty('--p', p.toFixed(3));
  }
  ngOnDestroy() {
    removeEventListener('scroll', this.tick);
    removeEventListener('resize', this.tick);
    cancelAnimationFrame(this.raf);
  }
}
