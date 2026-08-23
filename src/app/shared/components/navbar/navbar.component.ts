import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()">
      <div class="nav-inner container">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <img src="assets/logo.svg" alt="Crochus" class="logo-img" />
        </a>

        <!-- Desktop Nav Links -->
        <ul class="nav-links hide-mobile">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/shop" routerLinkActive="active">Shop</a></li>
          <li><a routerLink="/about" routerLinkActive="active">About</a></li>
          <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
        </ul>

        <!-- Right Actions -->
        <div class="nav-actions">
          <!-- Wishlist -->
          <a routerLink="/wishlist" class="icon-btn wishlist-nav-btn" title="Wishlist">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </a>

          <!-- Cart -->
          <a routerLink="/cart" class="icon-btn cart-btn" title="Cart">
            <span>🛍</span>
            @if (cart.totalItems() > 0) {
              <span class="cart-badge">{{ cart.totalItems() }}</span>
            }
          </a>

          <!-- Auth -->
          @if (auth.isLoggedIn()) {
            <div class="user-menu">
              <button class="user-btn" (click)="toggleUserMenu()">
                <span class="user-avatar">{{ auth.currentUser()?.full_name?.charAt(0) }}</span>
              </button>
              @if (showUserMenu()) {
                <div class="dropdown">
                  <a routerLink="/profile" (click)="showUserMenu.set(false)">My Profile</a>
                  <button (click)="logout()">Logout</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-sm hide-mobile">Sign In</a>
          }

          <!-- Hamburger -->
          <button class="hamburger hide-desktop" (click)="openMenu.emit()" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 72px;
      background: var(--navbar-bg);
      border-bottom: 1px solid transparent;
      z-index: 800;
      transition: all 0.3s ease;

      &.scrolled {
        border-bottom-color: var(--border);
        box-shadow: var(--shadow);
      }
    }

    .nav-inner {
      height: 100%;
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
      overflow: visible;

      .logo-img {
        height: 66px;
        width: auto;
        display: block;
        transform: scale(1.18);
        transform-origin: left center;
        filter: var(--logo-filter, none);
      }
    }

    .nav-links {
      display: flex;
      list-style: none;
      gap: 32px;
      flex: 1;

      a {
        font-size: 0.85rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-secondary);
        position: relative;
        transition: color 0.2s;
        padding: 4px 0;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1.5px;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        &:hover, &.active {
          color: var(--text-primary);
          &::after { width: 100%; }
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }

    .icon-btn {
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      background: transparent;
      border: none;
      border-radius: 50%;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
      color: var(--text-primary);
      text-decoration: none;

      &:hover { background: var(--bg); }
    }

    .cart-badge {
      position: absolute;
      top: 4px; right: 4px;
      width: 16px; height: 16px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }

    .user-menu { position: relative; }

    .user-btn { background: transparent; border: none; cursor: pointer; }

    .user-avatar {
      width: 36px; height: 36px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 600;
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 8px); right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow-hover);
      min-width: 160px;
      overflow: hidden;
      animation: fadeIn 0.2s ease;

      a, button {
        display: block; width: 100%;
        padding: 12px 16px;
        text-align: left;
        background: none; border: none;
        font-size: 0.9rem;
        color: var(--text-primary);
        cursor: pointer;
        transition: background 0.2s;
        &:hover { background: var(--bg); }
      }
    }

    .hamburger {
      width: 40px; height: 40px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 5px;
      background: transparent; border: none;
      cursor: pointer;

      span {
        display: block;
        width: 22px; height: 2px;
        background: var(--text-primary);
        border-radius: 2px;
        transition: all 0.3s;
      }
    }
  `]
})
export class NavbarComponent {
  cart = inject(CartService);
  auth = inject(AuthService);

  @Output() openMenu = new EventEmitter<void>();

  scrolled = signal(false);
  showUserMenu = signal(false);

  constructor() {
    window.addEventListener('scroll', () => {
      this.scrolled.set(window.scrollY > 20);
    });
  }

  toggleUserMenu() { this.showUserMenu.update(v => !v); }

  logout() {
    this.auth.logout();
    this.showUserMenu.set(false);
  }
}
