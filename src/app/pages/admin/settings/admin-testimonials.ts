import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { ToastService } from '../../../core/services/toast.service';
import { Testimonial } from '../../../core/models';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-testimonials.html',
  styleUrl: './admin-testimonials.scss'
})
export class AdminTestimonialsComponent implements OnInit {
  private testimonialService = inject(TestimonialService);
  private toast = inject(ToastService);

  testimonials = signal<Testimonial[]>([]);
  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);

  modalOpen = signal(false);
  isEditing = signal(false);
  deleteTarget = signal<Testimonial | null>(null);

  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  previewModalUrl = signal<string | null>(null);

  currentForm: {
    id?: number;
    customer_name: string;
    customer_location: string;
    rating: number;
    review_text: string;
    image_url: string;
    sort_order: number;
    is_active: boolean;
  } = {
    customer_name: '',
    customer_location: '',
    rating: 5,
    review_text: '',
    image_url: '',
    sort_order: 1,
    is_active: true,
  };

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.loading.set(true);
    this.testimonialService.getAdminTestimonials().subscribe({
      next: (res) => {
        this.testimonials.set(res || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Failed to load testimonials: ' + err.message);
      }
    });
  }

  openAddModal() {
    this.isEditing.set(false);
    this.selectedFile = null;
    this.imagePreview.set(null);
    this.currentForm = {
      customer_name: '',
      customer_location: '',
      rating: 5,
      review_text: '',
      image_url: '',
      sort_order: (this.testimonials().length + 1),
      is_active: true,
    };
    this.modalOpen.set(true);
  }

  openEditModal(testimonial: Testimonial) {
    this.isEditing.set(true);
    this.selectedFile = null;
    this.imagePreview.set(testimonial.image_url);
    this.currentForm = {
      id: testimonial.id,
      customer_name: testimonial.customer_name,
      customer_location: testimonial.customer_location || '',
      rating: testimonial.rating || 5,
      review_text: testimonial.review_text || '',
      image_url: testimonial.image_url,
      sort_order: testimonial.sort_order || 1,
      is_active: testimonial.is_active,
    };
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.selectedFile = null;
    this.imagePreview.set(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.toast.error('Please upload an image file (JPG, PNG, WebP)');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        this.toast.error('Image size must be less than 8MB');
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

  removeSelectedFile() {
    this.selectedFile = null;
    this.imagePreview.set(this.currentForm.image_url || null);
  }

  submitting = computed(() => this.saving());

  closePreview() {
    this.previewModalUrl.set(null);
  }

  saveTestimonial() {
    if (!this.currentForm.customer_name.trim()) {
      this.currentForm.customer_name = 'Customer DM Review';
    }
    if (!this.selectedFile && !this.currentForm.image_url.trim()) {
      return this.toast.error('Please upload a customer DM screenshot or review image');
    }

    this.saving.set(true);
    const formData = new FormData();
    formData.append('customer_name', this.currentForm.customer_name.trim());
    formData.append('customer_location', this.currentForm.customer_location.trim() || 'Instagram DM');
    formData.append('rating', String(this.currentForm.rating || 5));
    formData.append('review_text', this.currentForm.review_text.trim());
    formData.append('sort_order', String(this.currentForm.sort_order || 0));
    formData.append('is_active', String(this.currentForm.is_active));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.currentForm.image_url) {
      formData.append('image_url', this.currentForm.image_url.trim());
    }

    if (this.isEditing() && this.currentForm.id) {
      this.testimonialService.updateTestimonial(this.currentForm.id, formData).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Customer testimonial updated successfully!');
          this.closeModal();
          this.loadTestimonials();
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error('Failed to update testimonial: ' + err.message);
        }
      });
    } else {
      this.testimonialService.createTestimonial(formData).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Customer testimonial created successfully!');
          this.closeModal();
          this.loadTestimonials();
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error('Failed to create testimonial: ' + err.message);
        }
      });
    }
  }

  toggleStatus(item: Testimonial) {
    const nextStatus = !item.is_active;
    this.testimonialService.toggleTestimonialStatus(item.id, nextStatus).subscribe({
      next: (res) => {
        item.is_active = res.is_active;
        this.toast.success(`Testimonial status updated to ${item.is_active ? 'Active' : 'Inactive'}`);
      },
      error: (err) => {
        this.toast.error('Could not update status: ' + err.message);
      }
    });
  }

  confirmDelete(item: Testimonial) {
    this.deleteTarget.set(item);
  }

  executeDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.testimonialService.deleteTestimonial(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Testimonial deleted successfully');
        this.loadTestimonials();
      },
      error: (err) => {
        this.deleting.set(false);
        this.toast.error('Could not delete testimonial: ' + err.message);
      }
    });
  }

  previewImage(url: string) {
    this.previewModalUrl.set(url);
  }
}
