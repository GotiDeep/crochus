import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../dashboard/admin-sidebar.component';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category, Product } from '../../../core/models';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

interface ProductFormData {
  name: string;
  price: number;
  description: string;
  materials: string;
  category_id: number;
  badge: string;
  in_stock: boolean;
  video_url: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, CustomAlertComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="admin-topbar">
          <h2>Products</h2>
          <button class="btn btn-primary" (click)="openForm()">+ Add Product</button>
        </div>

        <div class="table-wrap card">
          @if (loading()) {
            <div style="padding:40px; text-align:center; color:var(--text-secondary)">Loading productsâ€¦</div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Badge</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product.id) {
                  <tr>
                    <td>
                      <img [src]="product.photos[0]" [alt]="product.name" class="thumb-img" />
                    </td>
                    <td><span class="product-name-cell">{{ product.name }}</span></td>
                    <td>{{ product.category_name }}</td>
                    <td>â‚¹{{ product.price | number }}</td>
                    <td>
                      @if (product.badge) {
                        <span class="badge" [class]="'badge-' + product.badge">{{ product.badge }}</span>
                      } @else { â€” }
                    </td>
                    <td>
                      <span class="status-badge" [class]="product.in_stock ? 'status-confirmed' : 'status-new'">
                        {{ product.in_stock ? 'In Stock' : 'Out' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-btns">
                        <button class="btn btn-ghost btn-sm" (click)="editProduct(product)">Edit</button>
                        <button class="btn btn-sm delete-btn" (click)="deleteProduct(product.id)">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        @if (showForm()) {
          <div class="modal-overlay" (click)="closeForm()">
            <div class="modal" (click)="$event.stopPropagation()">
              <div class="modal-head">
                <h3>{{ editingId() ? 'Edit Product' : 'Add Product' }}</h3>
                <button class="close-btn" (click)="closeForm()">âœ•</button>
              </div>

              <div class="modal-body">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Product Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.name" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Price (â‚¹) *</label>
                    <input type="number" class="form-control" [(ngModel)]="formData.price" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Description *</label>
                  <textarea class="form-control" [(ngModel)]="formData.description" rows="3"></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-control" [(ngModel)]="formData.category_id">
                      @for (category of categories(); track category.id) {
                        <option [value]="category.id">{{ category.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Badge</label>
                    <select class="form-control" [(ngModel)]="formData.badge">
                      <option value="">None</option>
                      <option value="new">New</option>
                      <option value="bestseller">Bestseller</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Materials</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.materials" />
                </div>

                <div class="form-group">
                  <label class="form-label">Photo URLs</label>
                  <textarea
                    class="form-control"
                    [(ngModel)]="photoUrlsInput"
                    rows="2"
                    placeholder="https://image-one.jpg, https://image-two.jpg"
                  ></textarea>
                  <span class="hint-text">You can keep existing URLs or add new hosted image URLs.</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Upload Photos</label>
                  <input type="file" class="form-control" accept="image/*" multiple (change)="onPhotoFilesSelected($event)" />
                  @if (selectedPhotoNames().length > 0) {
                    <div class="file-chip-row">
                      @for (name of selectedPhotoNames(); track name) {
                        <span class="file-chip">{{ name }}</span>
                      }
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Video URL (optional)</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.video_url" />
                </div>

                <div class="form-group">
                  <label class="form-label">Upload Video (optional)</label>
                  <input type="file" class="form-control" accept="video/*" (change)="onVideoFileSelected($event)" />
                  @if (selectedVideoName()) {
                    <div class="file-chip-row">
                      <span class="file-chip">{{ selectedVideoName() }}</span>
                    </div>
                  }
                </div>

                <div class="form-check">
                  <input type="checkbox" id="inStock" [(ngModel)]="formData.in_stock" />
                  <label for="inStock">In Stock</label>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-ghost" (click)="closeForm()">Cancel</button>
                <button class="btn btn-primary" [disabled]="saving()" (click)="saveProduct()">
                  {{ saving() ? 'Savingâ€¦' : (editingId() ? 'Update Product' : 'Add Product') }}
                </button>
              </div>
            </div>
          </div>
        }
      </main>
    </div>

    <!-- Custom Alert Dialog -->
    <app-custom-alert
      #customAlert
      (confirmed)="onAlertConfirmed()"
      (cancelled)="onAlertCancelled()"
    />
  `,
  styles: [`
    .admin-topbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; h2 { margin: 0; }
    }
    .table-wrap { overflow: hidden; overflow-x: auto; margin-bottom: 32px; }
    .thumb-img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border); }
    .product-name-cell { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }
    .action-btns { display: flex; gap: 8px; }
    .delete-btn {
      background: var(--error-bg); color: var(--error-text);
      border: 1px solid var(--error-text); padding: 6px 12px; font-size: 0.78rem;
      &:hover { background: var(--error-text); color: white; }
    }
    .modal-overlay {
      position: fixed; inset: 0; background: var(--overlay);
      z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal {
      background: var(--surface); border-radius: 12px;
      width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto;
      box-shadow: var(--shadow-hover); animation: fadeIn 0.2s ease;
    }
    .modal-head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border); h3 { margin: 0; }
    }
    .close-btn {
      width: 32px; height: 32px; background: var(--bg); border: 1px solid var(--border);
      border-radius: 50%; cursor: pointer; font-size: 0.8rem; color: var(--text-secondary);
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
      &:hover { border-color: var(--primary); color: var(--primary); }
    }
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      @media (max-width: 560px) { grid-template-columns: 1fr; }
    }
    .form-check {
      display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
      font-size: 0.9rem; color: var(--text-primary);
      input { width: 16px; height: 16px; cursor: pointer; }
    }
    .hint-text {
      display: block;
      font-size: 0.76rem;
      color: var(--text-secondary);
      margin-top: 6px;
    }
    .file-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .file-chip {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: var(--bg);
      border: 1px solid var(--border);
      font-size: 0.75rem;
      color: var(--text-primary);
    }
  `]
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
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedPhotoNames = signal<string[]>([]);
  selectedVideoName = signal('');

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
      price: 0,
      description: '',
      materials: '',
      category_id: 1,
      badge: '',
      in_stock: true,
      video_url: ''
    };
  }

  refreshProducts() {
    this.loading.set(true);
    this.adminService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(error instanceof Error ? error.message : 'Could not load products');
      },
    });
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
      price: product.price,
      description: product.description,
      materials: product.materials || '',
      category_id: product.category_id,
      badge: product.badge || '',
      in_stock: product.in_stock,
      video_url: product.video_url || ''
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

  buildFormData(): FormData {
    const formData = new FormData();
    const photoUrls = this.photoUrlsInput
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    formData.append('name', this.formData.name.trim());
    formData.append('price', String(this.formData.price));
    formData.append('description', this.formData.description.trim());
    formData.append('materials', this.formData.materials.trim());
    formData.append('category_id', String(this.formData.category_id));
    formData.append('badge', this.formData.badge);
    formData.append('in_stock', String(this.formData.in_stock));
    formData.append('video_url', this.formData.video_url.trim());
    formData.append('photo_urls', JSON.stringify(photoUrls));

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
