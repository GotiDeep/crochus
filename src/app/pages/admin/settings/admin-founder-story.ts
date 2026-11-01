import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FounderStoryService, DEFAULT_FOUNDER_STORY } from '../../../core/services/founder-story.service';
import { ToastService } from '../../../core/services/toast.service';
import { FounderStory } from '../../../core/models';

@Component({
  selector: 'app-admin-founder-story',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-founder-story.html',
  styleUrl: './admin-founder-story.scss'
})
export class AdminFounderStoryComponent implements OnInit {
  private founderService = inject(FounderStoryService);
  private toast = inject(ToastService);

  loading = signal(false);
  saving = signal(false);

  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);

  currentForm: FounderStory = {
    ...DEFAULT_FOUNDER_STORY
  };

  ngOnInit() {
    this.loadFounderStory();
  }

  loadFounderStory() {
    this.loading.set(true);
    this.founderService.getAdminFounderStory().subscribe({
      next: (data) => {
        if (data) {
          this.currentForm = {
            id: data.id,
            title: data.title || DEFAULT_FOUNDER_STORY.title,
            story_body: data.story_body || DEFAULT_FOUNDER_STORY.story_body,
            sub_message: data.sub_message || '',
            founder_name: data.founder_name || DEFAULT_FOUNDER_STORY.founder_name,
            image_url: data.image_url || DEFAULT_FOUNDER_STORY.image_url,
            is_active: data.is_active !== undefined ? data.is_active : true,
          };
          this.imagePreview.set(this.currentForm.image_url);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Failed to load founder story: ' + err.message);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.toast.error('Please upload a valid image (JPG, PNG, WebP)');
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
    this.imagePreview.set(this.currentForm.image_url || 'assets/founder.jpg');
  }

  onUrlInput() {
    if (!this.selectedFile) {
      this.imagePreview.set(this.currentForm.image_url);
    }
  }

  saveFounderStory() {
    if (!this.currentForm.title.trim()) {
      return this.toast.error('Section title is required');
    }
    if (!this.currentForm.story_body.trim()) {
      return this.toast.error('Founder story message is required');
    }
    if (!this.currentForm.founder_name?.trim()) {
      return this.toast.error('Founder name / designation is required');
    }

    this.saving.set(true);
    const formData = new FormData();
    formData.append('title', this.currentForm.title.trim());
    formData.append('story_body', this.currentForm.story_body.trim());
    formData.append('sub_message', (this.currentForm.sub_message || '').trim());
    formData.append('founder_name', (this.currentForm.founder_name || '').trim());
    formData.append('is_active', String(this.currentForm.is_active));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.currentForm.image_url) {
      formData.append('image_url', this.currentForm.image_url.trim());
    }

    this.founderService.updateFounderStory(formData).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.toast.success('Founder story updated successfully!');
        if (res) {
          this.currentForm = { ...res };
          this.selectedFile = null;
          this.imagePreview.set(res.image_url);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error('Failed to update founder story: ' + (err.error?.message || err.message));
      }
    });
  }
}
