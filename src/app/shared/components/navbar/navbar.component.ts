import { Component, inject, signal, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
        <a routerLink="/" class="logo" aria-label="Crochus — Handmade with Love Home">
          <img src="assets/logo.svg" alt="Crochus" class="logo-img" />
        </a>

        <!-- Desktop Nav Links -->
        <ul class="nav-links hide-mobile">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/shop" routerLinkActive="active">Collection</a></li>
          <li><a routerLink="/about" routerLinkActive="active">Our Story</a></li>
          <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
        </ul>

        <!-- Right Actions -->
        <div class="nav-actions">
          <!-- Search trigger -->
          <a routerLink="/shop" class="icon-btn search-nav-btn" aria-label="Search products" title="Search catalogue">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </a>

          <!-- Wishlist -->
          <a routerLink="/wishlist" class="icon-btn wishlist-nav-btn" aria-label="Wishlist" title="Your saved pieces">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </a>

          <!-- Cart -->
          <a routerLink="/cart" class="icon-btn cart-btn" aria-label="Shopping Cart" title="Cart">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            @if (cart.totalItems() > 0) {
              <span class="cart-badge">{{ cart.totalItems() }}</span>
            }
          </a>

          <!-- Auth -->
          @if (auth.isLoggedIn()) {
            <div class="user-menu">
              <button class="user-btn" (click)="toggleUserMenu()" aria-label="User Account Menu">
                <span class="user-avatar">{{ auth.currentUser()?.full_name?.charAt(0) || 'U' }}</span>
              </button>
              @if (showUserMenu()) {
                <div class="dropdown">
                  <div class="user-dropdown-header">
                    <p class="user-display-name">{{ auth.currentUser()?.full_name }}</p>
                    <p class="user-display-email">{{ auth.currentUser()?.email }}</p>
                  </div>
                  <a routerLink="/profile" (click)="showUserMenu.set(false)">My Profile & Orders</a>
                  <button (click)="logout()">Sign Out</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-sm hide-mobile">Sign In</a>
          }

          <!-- Hamburger for Mobile -->
          <button class="hamburger hide-desktop" (click)="openMenu.emit()" aria-label="Open mobile navigation menu">
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
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(232, 224, 213, 0.6);
      z-index: 800;
      transition: all 0.25s ease;
      padding-top: env(safe-area-inset-top, 0px);

      &.scrolled {
        border-bottom-color: var(--border);
        box-shadow: 0 4px 20px rgba(36, 30, 28, 0.06);
        background: rgba(250, 247, 242, 0.96);
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
      user-select: none;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.02);
      }

      .logo-img {
        height: var(--logo-height-navbar, 42px);
        width: auto;
        display: block;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
        pointer-events: none;
        filter: var(--logo-filter, none);
      }
    }

    .nav-links {
      display: flex;
      list-style: none;
      gap: 32px;
      flex: 1;

      a {
        font-size: 0.86rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-secondary);
        position: relative;
        transition: color 0.2s ease;
        padding: 8px 0;
        display: inline-block;

        &::after {
          content: '';
          position: absolute;
          bottom: 2px; left: 0;
          width: 0; height: 2px;
          background: var(--primary);
          border-radius: 2px;
          transition: width 0.25s ease;
        }

        &:hover, &.active {
          color: var(--primary);
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
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 50%;
      color: var(--text-primary);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background: var(--surface);
        border-color: var(--border);
        color: var(--primary);
        transform: translateY(-1px);
      }
    }

    .cart-badge {
      position: absolute;
      top: 5px; right: 5px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      background: var(--primary);
      color: white;
      border-radius: var(--radius-pill);
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--surface);
      box-shadow: 0 2px 6px rgba(74, 92, 47, 0.4);
      animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes popIn {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .user-menu { position: relative; }

    .user-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .user-avatar {
      width: 36px; height: 36px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.92rem;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(74, 92, 47, 0.25);
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 8px); right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-hover);
      min-width: 200px;
      overflow: hidden;
      animation: fadeIn 0.2s ease;
      z-index: 1000;

      .user-dropdown-header {
        padding: 12px 16px;
        background: var(--bg);
        border-bottom: 1px solid var(--border-light);

        .user-display-name {
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--text-primary);
        }

        .user-display-email {
          font-size: 0.76rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      a, button {
        display: block; width: 100%;
        padding: 12px 16px;
        text-align: left;
        background: none; border: none;
        font-size: 0.88rem;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;

        &:hover {
          background: var(--bg);
          color: var(--primary);
        }
      }
    }

    .hamburger {
      width: 44px; height: 44px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 5px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: var(--surface);
        border-color: var(--border);
      }

      span {
        display: block;
        width: 22px; height: 2px;
        background: var(--text-primary);
        border-radius: 2px;
        transition: transform 0.25s, opacity 0.25s;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  cart = inject(CartService);
  auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  @Output() openMenu = new EventEmitter<void>();

  scrolled = signal(false);
  showUserMenu = signal(false);

  private scrollHandler = () => {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled.set(window.scrollY > 20);
    }
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  toggleUserMenu() { this.showUserMenu.update(v => !v); }

  logout() {
    this.auth.logout();
    this.showUserMenu.set(false);
  }
}
