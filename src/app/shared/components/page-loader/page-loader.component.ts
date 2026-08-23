import { Component, inject } from '@angular/core';
import { PageLoaderService } from '../../../core/services/page-loader.service';

@Component({
  selector: 'app-page-loader', standalone: true,
  template: `@if (loader.loading()) { <div class="page-loader" role="status" aria-label="Loading"><div class="loader-ring"><img src="assets/loader-logo.png" alt="Loading" /></div></div> }`,
  styles: [`
    .page-loader { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; background:rgba(245,240,224,0.7); backdrop-filter:blur(3px); pointer-events:all; }
    .loader-ring { width:80px; height:80px; display:grid; place-items:center; border:2.5px solid rgba(74,92,47,.18); border-top-color:var(--primary); border-radius:50%; animation:spin .75s linear infinite; background:var(--bg); box-shadow:var(--shadow); }
    img { width:50px; height:50px; object-fit:contain; animation:counter-spin .75s linear infinite; border-radius:50%; }
    @keyframes spin { to { transform:rotate(360deg); } } @keyframes counter-spin { to { transform:rotate(-360deg); } }
  `]
})
export class PageLoaderComponent { readonly loader = inject(PageLoaderService); }
