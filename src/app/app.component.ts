import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: `
    <router-outlet />
    <app-toast-container />
  `
})
export class AppComponent {
  private settings = inject(SettingsService);

  constructor() {
    this.settings.refreshPublicSettings().subscribe({
      error: () => {
        // Keep storefront usable with fallback settings if API is not ready yet.
      }
    });
  }
}
