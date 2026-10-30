import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-before-login-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './before-login-header.html',
  styleUrl: './before-login-header.scss'
})
export class BeforeLoginHeaderComponent {
  cart = inject(CartService);
  auth = inject(AuthService);

  @Output() openMenu = new EventEmitter<void>();

  scrolled = signal(false);
  showUserMenu = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 20);
      }, { passive: true });
    }
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
  }

  logout() {
    this.auth.logout();
    this.showUserMenu.set(false);
  }
}
