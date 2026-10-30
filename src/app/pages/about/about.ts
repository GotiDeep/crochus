import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class AboutComponent {
  values = [
    { icon: '🧶', title: 'Made by Hand', desc: 'Each creation is made with care and attention to detail, using quality yarn and fabrics.' },
    { icon: '✿', title: 'Made to Be Special', desc: 'Find something different from everyday, mass-produced items — unique pieces with character.' },
    { icon: '✦', title: 'Made for Every Moment', desc: 'From birthdays and festivals to everyday surprises, find something worth gifting or keeping.' },
  ];
}
