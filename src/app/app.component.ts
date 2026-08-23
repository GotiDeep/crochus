import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { SettingsService } from './core/services/settings.service';
import { PageLoaderComponent } from './shared/components/page-loader/page-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, PageLoaderComponent],
  template: `
    <router-outlet />
    <app-toast-container />
    <app-page-loader />
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
