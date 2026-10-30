import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../core/services/settings.service';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-before-login-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './before-login-footer.html',
  styleUrl: './before-login-footer.scss'
})
export class BeforeLoginFooterComponent implements OnInit, OnDestroy {
  private settings = inject(SettingsService);
  private productService = inject(ProductService);
  year = new Date().getFullYear();
  categories = signal<Category[]>([]);
  showBackToTop = signal(false);

  private onScroll = () => {
    if (typeof window !== 'undefined') {
      this.showBackToTop.set(window.scrollY > 350);
    }
  };

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats || []),
      error: () => this.categories.set([])
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll, { passive: true });
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  instagramUrl() {
    return this.settings.settings().instagram_url || 'https://instagram.com/crochus';
  }

  facebookUrl() {
    return this.settings.settings().facebook_url || 'https://facebook.com/crochus';
  }

  whatsappUrl() {
    return `https://wa.me/${this.settings.whatsappNumber()}`;
  }

  formatCategoryName(name: string): string {
    if (!name) return 'Handmade';
    const lower = name.toLowerCase().trim();
    if (lower === 'handmade purse' || lower === 'bags & totes') return 'Handmade Bags';
    if (lower === 'booquets') return 'Flower Bouquets';
    if (lower === 'children wear') return 'Kidswear';
    if (lower === 'key chains' || lower === 'key chain') return 'Keychains';
    return name;
  }
}
