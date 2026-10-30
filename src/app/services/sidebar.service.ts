import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  readonly isCollapsed = signal<boolean>(false);
  readonly mobileOpen = signal<boolean>(false);

  toggle(): void {
    this.isCollapsed.update(val => !val);
  }

  toggleMobile(): void {
    this.mobileOpen.update(val => !val);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
