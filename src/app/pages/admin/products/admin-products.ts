import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category, Product } from '../../../core/models';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

import { ProductGalleryComponent } from '../../../shared/components/product-gallery/product-gallery.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

interface ProductFormData {
  name: string;
  product_code: string;
  price: number;
  description: string;
  materials: string;
  category_id: number;
  badge: string;
  in_stock: boolean;
  video_url: string;
  home_display: 'none' | 'hero' | 'last_section';
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent, ProductGalleryComponent, BadgeComponent],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss'
})
export class AdminProductsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  @ViewChild('customAlert') customAlert!: CustomAlertComponent;
  private pendingDeleteId = signal<number | null>(null);

  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  showPreview = signal(false);
  previewProduct = signal<Product | null>(null);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedPhotoNames = signal<string[]>([]);
  selectedVideoName = signal('');
  currentPage = signal(1);
  limit = 10;

  totalPages = () => Math.ceil(this.products().length / this.limit);
  pageNumbers = () => Array.from({ length: this.totalPages() }, (_, i) => i + 1);

  paginatedProducts = () => {
    const start = (this.currentPage() - 1) * this.limit;
    return this.products().slice(start, start + this.limit);
  };

  formData: ProductFormData = this.emptyForm();
  photoUrlsInput = '';
  selectedPhotoFiles: File[] = [];
  selectedVideoFile: File | null = null;

  ngOnInit() {
    this.refreshProducts();
    this.adminService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => {
        this.toast.error(error instanceof Error ? error.message : 'Could not load categories');
      },
    });
  }

  emptyForm(): ProductFormData {
    return {
      name: '',
      product_code: '',
      price: 0,
      description: '',
      materials: '',
      category_id: 1,
      badge: '',
      in_stock: true,
      video_url: '',
      home_display: 'none'
    };
  }

  openPreview(product: Product) {
    this.previewProduct.set(product);
    this.showPreview.set(true);
  }

  closePreview() {
    this.showPreview.set(false);
    this.previewProduct.set(null);
  }

  editFromPreview() {
    const product = this.previewProduct();
    this.closePreview();
    if (product) {
      this.editProduct(product);
    }
  }

  refreshProducts() {
    this.loading.set(true);
    this.adminService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(error instanceof Error ? error.message : 'Could not load products');
      },
    });
  }

  goToPage(p: number) {
    this.currentPage.set(p);
  }

  openForm() {
    this.editingId.set(null);
    this.formData = this.emptyForm();
    this.photoUrlsInput = '';
    this.selectedPhotoFiles = [];
    this.selectedVideoFile = null;
    this.selectedPhotoNames.set([]);
    this.selectedVideoName.set('');
    this.showForm.set(true);
  }

  editProduct(product: Product) {
    this.editingId.set(product.id);
    this.formData = {
      name: product.name,
      product_code: product.product_code || '',
      price: product.price,
      description: product.description,
      materials: product.materials || '',
      category_id: product.category_id,
      badge: product.badge || '',
      in_stock: product.in_stock,
      video_url: product.video_url || '',
      home_display: product.home_display || 'none'
    };
    this.photoUrlsInput = product.photos.join(', ');
    this.selectedPhotoFiles = [];
    this.selectedVideoFile = null;
    this.selectedPhotoNames.set([]);
    this.selectedVideoName.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  onPhotoFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedPhotoFiles = Array.from(input.files || []);
    this.selectedPhotoNames.set(this.selectedPhotoFiles.map((file) => file.name));
  }

  onVideoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedVideoFile = input.files?.[0] || null;
    this.selectedVideoName.set(this.selectedVideoFile?.name || '');
  }

  hideBrokenImage(event: Event) {
    const image = event.target as HTMLImageElement;
    image.style.visibility = 'hidden';
  }

  buildFormData(): FormData {
    const formData = new FormData();
    const photoUrls = this.photoUrlsInput
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    formData.append('name', this.formData.name.trim());
    formData.append('product_code', this.formData.product_code.trim());
    formData.append('price', String(this.formData.price));
    formData.append('description', this.formData.description.trim());
    formData.append('materials', this.formData.materials.trim());
    formData.append('category_id', String(this.formData.category_id));
    formData.append('badge', this.formData.badge);
    formData.append('in_stock', String(this.formData.in_stock));
    formData.append('video_url', this.formData.video_url.trim());
    formData.append('photo_urls', JSON.stringify(photoUrls));
    formData.append('home_display', this.formData.home_display);

    this.selectedPhotoFiles.forEach((file) => formData.append('photos[]', file));
    if (this.selectedVideoFile) {
      formData.append('video', this.selectedVideoFile);
    }

    return formData;
  }

  saveProduct() {
    if (!this.formData.name.trim() || this.formData.price <= 0 || !this.formData.description.trim()) {
      this.toast.error('Name, price, and description are required');
      return;
    }

    if (!this.photoUrlsInput.trim() && this.selectedPhotoFiles.length === 0) {
      this.toast.error('Add at least one product photo');
      return;
    }

    this.saving.set(true);
    const payload = this.buildFormData();
    const isEdit = this.editingId() !== null;

    const handleSuccess = () => {
      this.saving.set(false);
      this.closeForm();
      this.refreshProducts();
      setTimeout(() => {
        this.customAlert.show({
          type: 'success',
          title: isEdit ? 'Product Updated!' : 'Product Added!',
          message: isEdit
            ? 'The product has been successfully updated.'
            : 'New product has been added to your store.',
          confirmText: 'Great!'
        });
      }, 100);
    };

    const request = isEdit
      ? this.adminService.updateProduct(this.editingId()!, payload)
      : this.adminService.addProduct(payload);

    request.subscribe({
      next: () => handleSuccess(),
      error: (error) => {
        this.saving.set(false);
        this.customAlert.show({
          type: 'error',
          title: 'Save Failed',
          message: error instanceof Error ? error.message : 'Could not save product. Please try again.',
          confirmText: 'OK'
        });
      }
    });
  }

  deleteProduct(id: number) {
    this.pendingDeleteId.set(id);
    this.customAlert.show({
      type: 'confirm',
      title: 'Delete Product?',
      message: 'This action cannot be undone. The product will be permanently removed from your store.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel'
    });
  }

  onAlertConfirmed() {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.pendingDeleteId.set(null);
    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.products.update((products) => products.filter((product) => product.id !== id));
        this.refreshProducts();
        this.customAlert.show({
          type: 'success',
          title: 'Product Deleted',
          message: 'The product has been permanently removed from your store.',
          confirmText: 'Done'
        });
      },
      error: (error) => {
        this.customAlert.show({
          type: 'error',
          title: 'Delete Failed',
          message: error instanceof Error ? error.message : 'Could not delete product. Please try again.',
          confirmText: 'OK'
        });
      }
    });
  }

  onAlertCancelled() {
    this.pendingDeleteId.set(null);
  }
}
