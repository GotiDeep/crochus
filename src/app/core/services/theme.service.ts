import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'crochus_theme';
  isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    this.setTheme(dark);
  }

  toggle() {
    this.setTheme(!this.isDark());
  }

  private setTheme(dark: boolean) {
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
  }
}
