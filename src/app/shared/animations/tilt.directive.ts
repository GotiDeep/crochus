import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appTilt]', standalone: true,
  host: { '(pointermove)': 'move($event)', '(pointerleave)': 'reset()' }
})
export class TiltDirective {
  @Input() tiltMax = 8; // degrees
  constructor(private el: ElementRef<HTMLElement>) {
    const s = el.nativeElement.style;
    s.transition = 'transform .15s ease-out'; s.willChange = 'transform';
  }
  move(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    const el = this.el.nativeElement, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(900px) rotateY(${x * this.tiltMax * 2}deg) rotateX(${-y * this.tiltMax * 2}deg) scale(1.02)`;
  }
  reset() { this.el.nativeElement.style.transform = ''; }
}
