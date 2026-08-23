import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../dashboard/admin-sidebar.component';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, CustomAlertComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="admin-topbar">
          <h2>Categories</h2>
          <button class="btn btn-primary" (click)="showForm.set(true)">+ Add Category</button>
        </div>

        <!-- Add/Edit Form -->
        @if (showForm()) {
          <div class="add-form card fade-in">
            <h4>{{ editingId() ? 'Edit Category' : 'New Category' }}</h4>
            <div class="form-col">
              <input type="text" class="form-control" [(ngModel)]="newName" placeholder="Category name" />

              <!-- Image Upload -->
              <div class="image-upload-area" (click)="fileInput.click()">
                @if (imagePreview()) {
                  <img [src]="imagePreview()!" class="preview-img" alt="Preview" />
                  <span class="change-label">Click to change image</span>
                } @else {
                  <div class="upload-placeholder">
                    <span class="upload-icon">🖼️</span>
                    <span>Click to upload category image</span>
                  </div>
                }
              </div>
              <input #fileInput type="file" accept="image/*" class="hidden-input" (change)="onFileChange($event)" />

              <div class="form-actions">
                <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
                  {{ saving() ? 'Saving…' : 'Save' }}
                </button>
                <button class="btn btn-ghost" (click)="cancelEdit()">Cancel</button>
              </div>
            </div>
          </div>
        }

        <!-- Categories List -->
        <div class="cats-grid fade-in">
          @if (loading()) {
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="skeleton cat-skel"></div>
            }
          } @else {
            @for (cat of categories(); track cat.id) {
              <div class="cat-card card">
                @if (cat.image_url) {
                  <img [src]="cat.image_url" class="cat-img" [alt]="cat.name" />
                } @else {
                  <div class="cat-img-placeholder">🧶</div>
                }
                <div class="cat-info">
                  <h4 class="cat-name">{{ cat.name }}</h4>
                  <span class="cat-count">{{ cat.product_count }} products</span>
                </div>
                <div class="cat-actions">
                  <button class="btn btn-ghost btn-sm" (click)="startEdit(cat)">Edit</button>
                  <button class="delete-btn" (click)="deleteCategory(cat.id)">🗑</button>
                </div>
              </div>
            }
          }
        </div>
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

    .add-form {
      padding: 20px 24px;
      margin-bottom: 24px;
      h4 { margin-bottom: 16px; }
    }

    .form-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 400px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
    }

    .image-upload-area {
      border: 2px dashed var(--border);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      text-align: center;
      transition: border-color 0.2s;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      overflow: hidden;
      &:hover { border-color: var(--primary); }
    }

    .preview-img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 6px;
    }

    .change-label {
      font-size: 0.78rem;
      color: var(--text-secondary);
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 0.85rem;
      .upload-icon { font-size: 2rem; }
    }

    .hidden-input { display: none; }

    .cats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .cat-skel { height: 90px; border-radius: 8px; }

    .cat-card {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .cat-img {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .cat-img-placeholder {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }

    .cat-info {
      flex: 1;
      .cat-name { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
      .cat-count { font-size: 0.78rem; color: var(--text-secondary); }
    }

    .cat-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .delete-btn {
      background: none; border: none; font-size: 1rem;
      cursor: pointer; opacity: 0.5; transition: opacity 0.2s;
      padding: 4px;
      &:hover { opacity: 1; }
    }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  @ViewChild('customAlert') customAlert!: CustomAlertComponent;
  private pendingDeleteId = signal<number | null>(null);

  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  categories = signal<Category[]>([]);
  newName = '';
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;
  existingImageUrl: string | null = null;

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.adminService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(error instanceof Error ? error.message : 'Could not load categories');
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  startEdit(cat: Category) {
    this.editingId.set(cat.id);
    this.newName = cat.name;
    this.imagePreview.set(cat.image_url || null);
    this.existingImageUrl = cat.image_url || null;
    this.selectedFile = null;
    this.showForm.set(true);
  }

  cancelEdit() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.newName = '';
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.existingImageUrl = null;
  }

  save() {
    if (!this.newName.trim()) { this.toast.error('Enter a category name'); return; }
    this.saving.set(true);
    const isEdit = this.editingId() !== null;

    const formData = new FormData();
    formData.append('name', this.newName.trim());
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.existingImageUrl) {
      formData.append('existing_image_url', this.existingImageUrl);
    }

    const handleSuccess = () => {
      this.saving.set(false);
      this.cancelEdit();
      this.loadCategories();
      setTimeout(() => {
        this.customAlert.show({
          type: 'success',
          title: isEdit ? 'Category Updated!' : 'Category Added!',
          message: isEdit ? 'The category has been updated successfully.' : 'New category has been added.',
          confirmText: 'Great!'
        });
      }, 100);
    };

    if (isEdit) {
      this.adminService.updateCategory(this.editingId()!, formData).subscribe({
        next: () => handleSuccess(),
        error: (error) => {
          this.saving.set(false);
          this.toast.error(error instanceof Error ? error.message : 'Could not update category');
        }
      });
      return;
    }

    this.adminService.addCategory(formData).subscribe({
      next: () => handleSuccess(),
      error: (error) => {
        this.saving.set(false);
        this.toast.error(error instanceof Error ? error.message : 'Could not add category');
      }
    });
  }

  deleteCategory(id: number) {
    this.pendingDeleteId.set(id);
    this.customAlert.show({
      type: 'confirm',
      title: 'Delete Category?',
      message: 'This action cannot be undone. All products in this category may be affected.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel'
    });
  }

  onAlertConfirmed() {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.pendingDeleteId.set(null);
    this.adminService.deleteCategory(id).subscribe({
      next: () => {
        this.categories.update(c => c.filter(cat => cat.id !== id));
        this.customAlert.show({
          type: 'success',
          title: 'Category Deleted',
          message: 'The category has been permanently removed.',
          confirmText: 'Done'
        });
      },
      error: (error) => {
        this.customAlert.show({
          type: 'error',
          title: 'Delete Failed',
          message: error instanceof Error ? error.message : 'Could not delete category.',
          confirmText: 'OK'
        });
      }
    });
  }

  onAlertCancelled() {
    this.pendingDeleteId.set(null);
  }
}
