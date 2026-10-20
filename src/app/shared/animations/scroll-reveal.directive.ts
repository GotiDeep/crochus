import { Directive, ElementRef, Input, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() revealDelay = 0;
  @Input() revealThreshold = 0.12;

  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = this.el.nativeElement as HTMLElement;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      target.classList.add('revealed');
      return;
    }

    target.classList.add('reveal-item');
    if (this.revealDelay > 0) {
      target.style.transitionDelay = `${this.revealDelay}ms`;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          target.classList.add('revealed');
          this.observer?.unobserve(target);
        }
      });
    }, {
      threshold: this.revealThreshold,
      rootMargin: '0px 0px -40px 0px'
    });

    this.observer.observe(target);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
