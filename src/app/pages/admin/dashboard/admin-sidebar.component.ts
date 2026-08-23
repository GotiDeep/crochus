import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <a routerLink="/" class="admin-logo">
          <img src="assets/logo.svg" alt="Crochus" class="sidebar-logo-img" />
        </a>
        <span class="admin-badge">Admin</span>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
          <span>📊</span> Dashboard
        </a>
        <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
          <span>🧶</span> Products
        </a>
        <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
          <span>🏷</span> Categories
        </a>
        <a routerLink="/admin/orders" routerLinkActive="active" class="nav-item">
          <span>📦</span> Orders
        </a>
        <a routerLink="/admin/settings" routerLinkActive="active" class="nav-item">
          <span>⚙️</span> Settings
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" (click)="admin.logout()">🚪 Logout</button>
        <a routerLink="/shop" class="view-store">↗ View Store</a>
      </div>
    </aside>
  `,
  styles: [`
    .admin-sidebar {
      width: 260px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      height: 100vh;
      position: fixed;
      top: 0; left: 0;
      display: flex;
      flex-direction: column;
      z-index: 700;

      @media (max-width: 900px) { display: none; }
    }

    .sidebar-header {
      padding: 24px 20px 20px;
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

      .sidebar-logo-img {
        height: 56px;
        width: auto;
        transform: scale(1.18);
        transform-origin: left center;
        filter: var(--logo-filter, none);
      }
    }

    .admin-badge {
      background: var(--primary);
      color: white;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;

      &:hover { background: var(--bg); color: var(--text-primary); }
      &.active { background: rgba(74,92,47,0.12); color: var(--primary); font-weight: 500; }
    }

    .sidebar-footer {
      padding: 16px 12px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .logout-btn, .view-store {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;

      &:hover { background: var(--bg); color: var(--text-primary); }
    }

    .logout-btn { color: var(--error-text); &:hover { color: var(--error-text); } }
  `]
})
export class AdminSidebarComponent {
  admin = inject(AdminService);
}
