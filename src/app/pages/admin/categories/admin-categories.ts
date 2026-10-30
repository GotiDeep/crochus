import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss'
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
  currentPage = signal(1);
  limit = 10;

  totalPages = () => Math.ceil(this.categories().length / this.limit);
  pageNumbers = () => Array.from({ length: this.totalPages() }, (_, i) => i + 1);

  paginatedCategories = () => {
    const start = (this.currentPage() - 1) * this.limit;
    return this.categories().slice(start, start + this.limit);
  };

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
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(error instanceof Error ? error.message : 'Could not load categories');
      }
    });
  }

  goToPage(p: number) {
    this.currentPage.set(p);
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
