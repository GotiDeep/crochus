import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { SettingsService } from './core/services/settings.service';
import { PageLoaderComponent } from './shared/components/page-loader/page-loader.component';
import { SessionModalComponent } from './shared/components/session-modal/session-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, PageLoaderComponent, SessionModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
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
