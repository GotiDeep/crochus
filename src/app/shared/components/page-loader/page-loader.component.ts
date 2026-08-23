import { Component, inject } from '@angular/core';
import { PageLoaderService } from '../../../core/services/page-loader.service';

@Component({
  selector: 'app-page-loader', standalone: true,
  template: `@if (loader.loading()) { <div class="page-loader" role="status" aria-label="Loading"><div class="loader-ring"><img src="assets/logo.svg" alt="" /></div></div> }`,
  styles: [`
    .page-loader { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; background:rgba(255,255,255,.5); backdrop-filter:blur(2px); pointer-events:all; }
    .loader-ring { width:64px; height:64px; display:grid; place-items:center; border:2px solid rgba(74,92,47,.18); border-top-color:var(--primary); border-radius:50%; animation:spin .75s linear infinite; background:var(--surface); box-shadow:var(--shadow); }
    img { width:44px; height:44px; object-fit:contain; animation:counter-spin .75s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } } @keyframes counter-spin { to { transform:rotate(-360deg); } }
  `]
})
export class PageLoaderComponent { readonly loader = inject(PageLoaderService); }
