import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Top Navigation Header -->
    <header class="admin-mobile-header">
      <div class="mobile-left">
        <button class="mobile-toggle-btn" (click)="mobileOpen.set(!mobileOpen())" aria-label="Toggle navigation menu">
          <span class="bar" [class.open]="mobileOpen()"></span>
          <span class="bar" [class.open]="mobileOpen()"></span>
          <span class="bar" [class.open]="mobileOpen()"></span>
        </button>
        <a routerLink="/" class="admin-mobile-logo">
          <img src="assets/logo.svg" alt="Crochus" class="sidebar-logo-img" />
        </a>
        <span class="admin-badge">Admin</span>
      </div>

      <div class="mobile-right">
        <a routerLink="/shop" class="mobile-store-link" title="View Store">
          <span>↗</span> Store
        </a>
        <button class="mobile-logout-btn" (click)="admin.logout()" title="Logout">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </header>

    <!-- Mobile Drawer Overlay -->
    @if (mobileOpen()) {
      <div class="admin-drawer-overlay" (click)="mobileOpen.set(false)"></div>
    }

    <!-- Sidebar Drawer (Desktop permanent, Mobile sliding drawer) -->
    <aside class="admin-sidebar" [class.mobile-open]="mobileOpen()">
      <div class="sidebar-header">
        <a routerLink="/" class="admin-logo" (click)="closeMobile()">
          <img src="assets/logo.svg" alt="Crochus" class="sidebar-logo-img" />
        </a>
        <span class="admin-badge">Admin</span>
        <button class="drawer-close-btn" (click)="mobileOpen.set(false)" aria-label="Close menu">✕</button>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item" (click)="closeMobile()">
          <span class="nav-icon">📊</span>
          <span>Dashboard</span>
        </a>
        <a routerLink="/admin/products" routerLinkActive="active" class="nav-item" (click)="closeMobile()">
          <span class="nav-icon">🧶</span>
          <span>Products</span>
        </a>
        <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item" (click)="closeMobile()">
          <span class="nav-icon">🏷</span>
          <span>Categories</span>
        </a>
        <a routerLink="/admin/orders" routerLinkActive="active" class="nav-item" (click)="closeMobile()">
          <span class="nav-icon">📦</span>
          <span>Orders</span>
        </a>
        <a routerLink="/admin/settings" [queryParams]="{ tab: 'banners' }" routerLinkActive="active" class="nav-item" (click)="closeMobile()">
          <span class="nav-icon">🖼️</span>
          <span>Banners</span>
        </a>
        <a routerLink="/admin/settings" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item" (click)="closeMobile()">
          <span class="nav-icon">⚙️</span>
          <span>Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" (click)="admin.logout()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
        <a routerLink="/shop" class="view-store" (click)="closeMobile()">↗ View Store</a>
      </div>
    </aside>
  `,
  styles: [`
    /* ── Mobile Top Header ── */
    .admin-mobile-header {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 62px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 0 12px;
      z-index: 850;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      @media (max-width: 900px) {
        display: flex;
      }
    }

    .mobile-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }

    .mobile-toggle-btn {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      flex-shrink: 0;

      .bar {
        width: 100%;
        height: 2px;
        background: var(--text-primary);
        border-radius: 2px;
        transition: all 0.25s ease;
      }

      &:hover {
        background: var(--bg);
      }
    }

    .admin-mobile-logo {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 1;
      min-width: 0;

      .sidebar-logo-img {
        height: 28px;
        max-width: 130px;
        width: auto;
        object-fit: contain;
        display: block;
      }
    }

    .admin-badge {
      background: var(--primary);
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 12px;
      flex-shrink: 0;
      line-height: 1.4;
    }

    .mobile-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .mobile-store-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
      padding: 6px 10px;
      background: var(--bg);
      border-radius: 6px;
      border: 1.5px solid var(--border);
      white-space: nowrap;
      transition: all 0.2s ease;

      span {
        font-size: 0.85rem;
      }

      &:hover {
        background: var(--primary);
        color: #ffffff;
        border-color: var(--primary);
      }
    }

    .mobile-logout-btn {
      width: 34px;
      height: 34px;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: 6px;
      color: var(--error-text);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;

      &:hover {
        background: var(--error-bg);
        border-color: var(--error-text);
      }
    }

    /* ── Mobile Drawer Overlay ── */
    .admin-drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(44, 58, 26, 0.45);
      backdrop-filter: blur(2px);
      z-index: 900;
      animation: fadeIn 0.2s ease;
    }

    /* ── Sidebar (Desktop & Mobile Drawer) ── */
    .admin-sidebar {
      width: 260px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      height: 100vh;
      position: fixed;
      top: 0; left: 0;
      display: flex;
      flex-direction: column;
      z-index: 950;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      @media (max-width: 900px) {
        transform: translateX(-100%);
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);

        &.mobile-open {
          transform: translateX(0);
        }
      }
    }

    .drawer-close-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1.2rem;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;

      @media (max-width: 900px) {
        display: block;
      }

      &:hover {
        color: var(--text-primary);
        background: var(--bg);
      }
    }

    .sidebar-header {
      padding: 20px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .admin-logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex: 1;
      user-select: none;

      .sidebar-logo-img {
        height: 32px;
        width: auto;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
        pointer-events: none;
        filter: var(--logo-filter, none);
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.92rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;

      .nav-icon {
        font-size: 1.1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      &:hover { background: var(--bg); color: var(--text-primary); }
      &.active { background: rgba(74,92,47,0.12); color: var(--primary); font-weight: 600; }
    }

    .sidebar-footer {
      padding: 16px 12px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .logout-btn, .view-store {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.88rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;

      &:hover { background: var(--bg); color: var(--text-primary); }
    }

    .logout-btn {
      color: var(--error-text);
      &:hover { color: var(--error-text); background: var(--error-bg); }
    }
  `]
})
export class AdminSidebarComponent {
  admin = inject(AdminService);
  mobileOpen = signal(false);

  closeMobile() {
    this.mobileOpen.set(false);
  }
}
