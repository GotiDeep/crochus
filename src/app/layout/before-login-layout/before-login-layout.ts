import { Component, HostListener, signal, inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BeforeLoginHeaderComponent } from '../before-login-header/before-login-header';
import { BeforeLoginFooterComponent } from '../before-login-footer/before-login-footer';
import { HamburgerMenuComponent } from '../../shared/components/hamburger-menu/hamburger-menu.component';

@Component({
  selector: 'app-before-login-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BeforeLoginHeaderComponent,
    BeforeLoginFooterComponent,
    HamburgerMenuComponent
  ],
  templateUrl: './before-login-layout.html',
  styleUrl: './before-login-layout.scss'
})
export class BeforeLoginLayoutComponent implements OnInit, OnDestroy {
  public showScrollTop = signal<boolean>(false);
  public menuOpen = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);
  private scrollUnlisten: (() => void) | null = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScrollPosition();
      const handler = () => this.checkScrollPosition();
      window.addEventListener('scroll', handler, true);
      this.scrollUnlisten = () => window.removeEventListener('scroll', handler, true);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollUnlisten) {
      this.scrollUnlisten();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  private checkScrollPosition(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    this.showScrollTop.set(scrollPosition > 120);
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
