import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BannerService } from '../../../core/services/banner.service';
import { ToastService } from '../../../core/services/toast.service';
import { Banner } from '../../../core/models';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-banners.html',
  styleUrl: './admin-banners.scss'
})
export class AdminBannersComponent implements OnInit {
  private bannerService = inject(BannerService);
  private toast = inject(ToastService);

  banners = signal<Banner[]>([]);
  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);

  modalOpen = signal(false);
  isEditing = signal(false);
  deleteTarget = signal<Banner | null>(null);

  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);

  currentForm: {
    id?: number;
    name: string;
    title: string;
    subtitle: string;
    image_url: string;
    link_url: string;
    button_text: string;
    display_on: string;
    sort_order: number;
    is_active: boolean;
  } = {
    name: '',
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '/shop',
    button_text: 'Explore Collection',
    display_on: 'App, Web',
    sort_order: 1,
    is_active: true,
  };

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.loading.set(true);
    this.bannerService.getAdminBanners().subscribe({
      next: (res) => {
        this.banners.set(res || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Failed to load hero banners: ' + err.message);
      }
    });
  }

  openAddModal() {
    this.isEditing.set(false);
    this.selectedFile = null;
    this.imagePreview.set(null);
    this.currentForm = {
      name: '',
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '/shop',
      button_text: 'Explore Collection',
      display_on: 'App, Web',
      sort_order: (this.banners().length + 1),
      is_active: true,
    };
    this.modalOpen.set(true);
  }

  openEditModal(banner: Banner) {
    this.isEditing.set(true);
    this.selectedFile = null;
    this.imagePreview.set(banner.image_url);
    this.currentForm = {
      id: banner.id,
      name: banner.name,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '/shop',
      button_text: banner.button_text || 'Shop Now',
      display_on: banner.display_on || 'App, Web',
      sort_order: banner.sort_order || 1,
      is_active: banner.is_active,
    };
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('File exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onUrlInput() {
    if (this.currentForm.image_url) {
      this.imagePreview.set(this.currentForm.image_url);
      this.selectedFile = null;
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview.set(null);
    this.currentForm.image_url = '';
  }

  previewImage(url: string) {
    if (url) window.open(url, '_blank');
  }

  saveBanner() {
    if (!this.currentForm.name.trim()) {
      return this.toast.error('Banner name is required');
    }
    if (!this.selectedFile && !this.currentForm.image_url.trim()) {
      return this.toast.error('Please upload a banner image or provide an image URL');
    }

    const formData = new FormData();
    formData.append('name', this.currentForm.name.trim());
    formData.append('title', this.currentForm.title.trim());
    formData.append('subtitle', this.currentForm.subtitle.trim());
    formData.append('link_url', this.currentForm.link_url.trim());
    formData.append('button_text', this.currentForm.button_text.trim());
    formData.append('display_on', this.currentForm.display_on);
    formData.append('sort_order', String(this.currentForm.sort_order));
    formData.append('is_active', String(this.currentForm.is_active));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.currentForm.image_url) {
      formData.append('image_url', this.currentForm.image_url.trim());
    }

    this.saving.set(true);

    if (this.isEditing() && this.currentForm.id) {
      this.bannerService.updateBanner(this.currentForm.id, formData).subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.toast.success('Hero banner updated successfully!');
          this.closeModal();
          this.loadBanners();
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error('Failed to update banner: ' + err.message);
        }
      });
    } else {
      this.bannerService.createBanner(formData).subscribe({
        next: (created) => {
          this.saving.set(false);
          this.toast.success('Hero banner created successfully!');
          this.closeModal();
          this.loadBanners();
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error('Failed to create banner: ' + err.message);
        }
      });
    }
  }

  toggleStatus(banner: Banner) {
    const nextStatus = !banner.is_active;
    this.bannerService.toggleBannerStatus(banner.id, nextStatus).subscribe({
      next: (res) => {
        banner.is_active = res.is_active;
        this.toast.success(`Banner status updated to ${banner.is_active ? 'Active' : 'Inactive'}`);
      },
      error: (err) => {
        this.toast.error('Could not update status: ' + err.message);
      }
    });
  }

  confirmDelete(banner: Banner) {
    this.deleteTarget.set(banner);
  }

  executeDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.bannerService.deleteBanner(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Banner deleted');
        this.loadBanners();
      },
      error: (err) => {
        this.deleting.set(false);
        this.toast.error('Could not delete banner: ' + err.message);
      }
    });
  }
}
