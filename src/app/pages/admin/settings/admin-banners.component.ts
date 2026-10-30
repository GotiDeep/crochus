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
  template: `
    <section class="banners-admin-container">
      <!-- Section Header -->
      <div class="banners-header">
        <div>
          <h3>Hero Banners Management</h3>
          <p>Banners appear in the homepage auto-switching slider. Customers can swipe between them on mobile and desktop.</p>
        </div>
        <button class="btn btn-primary add-banner-btn" (click)="openAddModal()">
          <span class="plus-icon">+</span> Add Banner
        </button>
      </div>

      <!-- Dimension Guidance Notice Card -->
      <div class="dimension-card">
        <div class="dim-icon-wrap">📐</div>
        <div class="dim-body">
          <div class="dim-heading">
            <strong>Standard Hero Banner Specifications</strong>
            <span class="dim-badge">Recommended: 1920 × 650 px</span>
          </div>
          <p class="dim-desc">
            For best visual appeal, upload landscape images of <strong>1920 × 650 px</strong> (aspect ratio ~16:6).
            Supported formats: <strong>JPG, PNG, WebP</strong> (up to 5MB). Keep key visuals and text centered so they look great on both mobile and wide screens.
          </p>
        </div>
      </div>

      <!-- Banners Table (Matching reference layout) -->
      <div class="table-card card">
        @if (loading()) {
          <div class="table-loading">
            <span class="spinner"></span> Loading banners…
          </div>
        } @else if (banners().length === 0) {
          <div class="table-empty">
            <div class="empty-icon">🖼️</div>
            <h4>No Banners Added Yet</h4>
            <p>Add your first hero banner to showcase featured handmade collections on the homepage.</p>
            <button class="btn btn-primary" (click)="openAddModal()">+ Add Banner</button>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="banners-table">
              <thead>
                <tr>
                  <th class="th-action">Action</th>
                  <th class="th-status">Status</th>
                  <th>Banner Name <span class="th-filter">▼</span></th>
                  <th>Banner Title <span class="th-filter">▼</span></th>
                  <th>Display On <span class="th-filter">▼</span></th>
                  <th class="th-img">Banner Image</th>
                  <th>Order</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (banner of banners(); track banner.id) {
                  <tr>
                    <!-- Action Column (Edit / Delete) -->
                    <td class="td-actions">
                      <button
                        class="icon-btn edit-btn"
                        (click)="openEditModal(banner)"
                        title="Edit Banner"
                        aria-label="Edit Banner"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        class="icon-btn delete-btn"
                        (click)="confirmDelete(banner)"
                        title="Delete Banner"
                        aria-label="Delete Banner"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </td>

                    <!-- Status Pill (Active / Inactive clickable) -->
                    <td class="td-status">
                      <button
                        class="status-pill"
                        [class.active]="banner.is_active"
                        (click)="toggleStatus(banner)"
                        title="Click to toggle status"
                      >
                        {{ banner.is_active ? 'Active' : 'Inactive' }}
                      </button>
                    </td>

                    <!-- Banner Name -->
                    <td class="td-name">
                      <strong>{{ banner.name }}</strong>
                    </td>

                    <!-- Banner Title -->
                    <td class="td-title">
                      <span>{{ banner.title || '—' }}</span>
                    </td>

                    <!-- Display On -->
                    <td class="td-display">
                      <span class="display-badge">{{ banner.display_on || 'App, Web' }}</span>
                    </td>

                    <!-- Banner Image Thumbnail -->
                    <td class="td-image">
                      <div class="thumb-wrap" (click)="previewImage(banner.image_url)">
                        <img [src]="banner.image_url" [alt]="banner.name" class="banner-thumb" />
                      </div>
                    </td>

                    <!-- Sort Order -->
                    <td class="td-order">
                      <span class="order-badge">#{{ banner.sort_order }}</span>
                    </td>

                    <!-- Date -->
                    <td class="td-date">
                      <span>{{ (banner.created_at | date:'dd-MM-yyyy') || '—' }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Add / Edit Modal -->
      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h4>{{ isEditing() ? 'Edit Hero Banner' : 'Add New Hero Banner' }}</h4>
              <button class="modal-close-btn" (click)="closeModal()">✕</button>
            </div>

            <div class="modal-body">
              <!-- Banner Dimension Highlight Box inside Modal -->
              <div class="modal-dimension-box">
                <div class="mdb-header">
                  <span class="mdb-icon">📐</span>
                  <strong>Required / Recommended Banner Dimensions</strong>
                </div>
                <div class="mdb-tags">
                  <div class="mdb-tag">
                    <span class="tag-title">Desktop Width × Height:</span>
                    <strong class="tag-val">1920 × 650 px</strong>
                  </div>
                  <div class="mdb-tag">
                    <span class="tag-title">Aspect Ratio:</span>
                    <strong class="tag-val">~16:6 (or 2.5:1)</strong>
                  </div>
                  <div class="mdb-tag">
                    <span class="tag-title">File Types:</span>
                    <strong class="tag-val">JPG, PNG, WebP (Max 5MB)</strong>
                  </div>
                </div>
                <div class="mdb-note">
                  ℹ️ <em>Please keep focal subjects and text centered. The slider will auto-scale gracefully across mobile (320px–430px) and wide screens.</em>
                </div>
              </div>

              <!-- Image Upload & Preview Section -->
              <div class="form-group">
                <label class="form-label">Banner Image *</label>
                
                <div class="upload-dropzone" [class.has-image]="imagePreview()">
                  @if (imagePreview()) {
                    <div class="preview-container">
                      <img [src]="imagePreview()" alt="Banner Preview" class="upload-preview-img" />
                      <div class="preview-overlay">
                        <button type="button" class="btn btn-sm btn-light" (click)="fileInput.click()">
                          🔄 Change Image
                        </button>
                        <button type="button" class="btn btn-sm btn-danger" (click)="removeImage()">
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="dropzone-empty" (click)="fileInput.click()">
                      <div class="upload-cloud-icon">☁️</div>
                      <strong>Click to upload banner photo</strong>
                      <span>Recommended: 1920 × 650 px landscape image</span>
                    </div>
                  }
                  <input
                    #fileInput
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style="display: none"
                    (change)="onFileSelected($event)"
                  />
                </div>

                <div class="or-separator">
                  <span>OR provide direct image link</span>
                </div>

                <input
                  type="url"
                  class="form-control"
                  [(ngModel)]="currentForm.image_url"
                  (input)="onUrlInput()"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <!-- Banner Name -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Banner Name *</label>
                  <input
                    class="form-control"
                    [(ngModel)]="currentForm.name"
                    placeholder="e.g. Summer Crochet Bouquets"
                    required
                  />
                  <span class="hint-text">Internal reference name for this banner.</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Display On</label>
                  <select class="form-control" [(ngModel)]="currentForm.display_on">
                    <option value="App, Web">App, Web</option>
                    <option value="Web Only">Web Only</option>
                    <option value="App Only">App Only</option>
                  </select>
                </div>
              </div>

              <!-- Banner Title & Subtitle Overlays -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Headline / Banner Title</label>
                  <input
                    class="form-control"
                    [(ngModel)]="currentForm.title"
                    placeholder="e.g. Little Things, Handmade with Love"
                  />
                  <span class="hint-text">Shown in bold font on the banner slide.</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Button Text</label>
                  <input
                    class="form-control"
                    [(ngModel)]="currentForm.button_text"
                    placeholder="e.g. Explore Collection"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Short Description / Subtitle</label>
                <textarea
                  class="form-control"
                  rows="2"
                  [(ngModel)]="currentForm.subtitle"
                  placeholder="e.g. Handcrafted crochet bags, bouquets, rakhis & gifts made with love."
                ></textarea>
              </div>

              <!-- Destination Link & Sort Order -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Destination Link (URL)</label>
                  <input
                    class="form-control"
                    [(ngModel)]="currentForm.link_url"
                    placeholder="e.g. /shop, /shop?category_id=1, or /contact"
                  />
                  <span class="hint-text">Where user goes when clicking the banner or button.</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    class="form-control"
                    [(ngModel)]="currentForm.sort_order"
                    placeholder="1"
                  />
                  <span class="hint-text">Slide position (1 = first banner).</span>
                </div>
              </div>

              <!-- Status Checkbox -->
              <div class="status-checkbox-row">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="currentForm.is_active"
                  />
                  <span>Active on Homepage (Include in Auto-switching slider)</span>
                </label>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button class="btn btn-ghost" type="button" (click)="closeModal()">
                Cancel
              </button>
              <button
                class="btn btn-primary"
                type="button"
                [disabled]="saving()"
                (click)="saveBanner()"
              >
                {{ saving() ? 'Saving…' : (isEditing() ? 'Update Banner' : 'Create Banner') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="deleteTarget.set(null)">
          <div class="modal-dialog modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h4>Delete Banner</h4>
              <button class="modal-close-btn" (click)="deleteTarget.set(null)">✕</button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete banner <strong>"{{ deleteTarget()?.name }}"</strong>? This cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn btn-danger" [disabled]="deleting()" (click)="executeDelete()">
                {{ deleting() ? 'Deleting…' : 'Delete Banner' }}
              </button>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .banners-admin-container {
      max-width: 100%;
    }

    .banners-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;

      h3 {
        margin: 0 0 6px;
        font-size: 1.25rem;
        color: var(--text, #111827);
      }
      p {
        margin: 0;
        color: var(--text-secondary, #6B7280);
        font-size: 0.88rem;
      }

      @media (max-width: 640px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .add-banner-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      padding: 10px 18px;
      font-weight: 600;
      border-radius: 6px;

      .plus-icon {
        font-size: 1.15rem;
        font-weight: bold;
      }
    }

    /* ── Specifications Banner ── */
    .dimension-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: linear-gradient(135deg, rgba(74, 92, 47, 0.08) 0%, rgba(212, 201, 138, 0.15) 100%);
      border: 1px solid rgba(74, 92, 47, 0.25);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;

      .dim-icon-wrap {
        font-size: 1.8rem;
        line-height: 1;
      }

      .dim-body {
        flex: 1;
      }

      .dim-heading {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 6px;

        strong {
          color: #2C3A1A;
          font-size: 0.98rem;
        }

        .dim-badge {
          background: #4A5C2F;
          color: #FFFFFF;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 12px;
          letter-spacing: 0.04em;
        }
      }

      .dim-desc {
        margin: 0;
        font-size: 0.86rem;
        color: #374151;
        line-height: 1.5;
      }
    }

    /* ── Table Card ── */
    .table-card {
      background: #FFFFFF;
      border: 1px solid var(--border, #E5E7EB);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .banners-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;

      thead th {
        background: #F9FAFB;
        color: #4B5563;
        font-weight: 600;
        padding: 12px 14px;
        border-bottom: 1px solid var(--border, #E5E7EB);
        white-space: nowrap;

        .th-filter {
          font-size: 0.65rem;
          color: #9CA3AF;
          margin-left: 4px;
        }
      }

      tbody td {
        padding: 12px 14px;
        border-bottom: 1px solid #F3F4F6;
        vertical-align: middle;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      tbody tr:hover {
        background: #FAFAF7;
      }
    }

    .td-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid var(--border, #E5E7EB);
      background: #FFFFFF;
      color: #4B5563;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #F3F4F6;
      }
      &.edit-btn:hover {
        color: #4A5C2F;
        border-color: #4A5C2F;
        background: rgba(74, 92, 47, 0.08);
      }
      &.delete-btn:hover {
        color: #DC2626;
        border-color: #DC2626;
        background: #FEF2F2;
      }
    }

    .status-pill {
      border: none;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      background: #E5E7EB;
      color: #6B7280;
      transition: all 0.2s ease;

      &.active {
        background: #DEF7EC;
        color: #03543F;
      }

      &:hover {
        opacity: 0.85;
      }
    }

    .display-badge {
      font-size: 0.78rem;
      color: #4B5563;
      background: #F3F4F6;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .order-badge {
      font-weight: 600;
      color: #4A5C2F;
    }

    .thumb-wrap {
      width: 60px;
      height: 36px;
      border-radius: 4px;
      overflow: hidden;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      cursor: pointer;

      .banner-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .table-loading, .table-empty {
      padding: 48px 24px;
      text-align: center;
      color: #6B7280;

      .spinner {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 2px solid #E5E7EB;
        border-top-color: #4A5C2F;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        vertical-align: middle;
        margin-right: 8px;
      }

      .empty-icon {
        font-size: 2.8rem;
        margin-bottom: 12px;
      }
      h4 { margin: 0 0 6px; color: #111827; }
      p { margin: 0 0 16px; font-size: 0.88rem; }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Modal Dialog ── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow-y: auto;
    }

    .modal-dialog {
      background: #FFFFFF;
      border-radius: 12px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25);
      animation: modalIn 0.25s ease-out;

      &.modal-sm {
        max-width: 440px;
      }
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 1.15rem;
        color: #111827;
      }

      .modal-close-btn {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        color: #9CA3AF;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        &:hover { color: #111827; }
      }
    }

    .modal-body {
      padding: 20px 24px;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #E5E7EB;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: #F9FAFB;
      border-radius: 0 0 12px 12px;
    }

    /* ── Modal Dimension Highlight Box ── */
    .modal-dimension-box {
      background: #F0FDF4;
      border: 1px solid #86EFAC;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 20px;

      .mdb-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #14532D;
        font-size: 0.92rem;
        margin-bottom: 10px;
      }

      .mdb-tags {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px;
        margin-bottom: 8px;
      }

      .mdb-tag {
        background: #FFFFFF;
        border: 1px solid #BBF7D0;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 0.8rem;
        display: flex;
        flex-direction: column;

        .tag-title {
          color: #4B5563;
          font-size: 0.72rem;
        }
        .tag-val {
          color: #15803D;
          font-weight: 700;
        }
      }

      .mdb-note {
        font-size: 0.78rem;
        color: #166534;
        line-height: 1.4;
      }
    }

    /* ── Upload Dropzone ── */
    .upload-dropzone {
      border: 2px dashed #D1D5DB;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      background: #FAFAFA;
      transition: all 0.2s ease;

      &:hover {
        border-color: #4A5C2F;
        background: #F9FAF5;
      }
    }

    .dropzone-empty {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 16px;

      .upload-cloud-icon {
        font-size: 2rem;
      }
      strong {
        color: #374151;
        font-size: 0.92rem;
      }
      span {
        color: #6B7280;
        font-size: 0.78rem;
      }
    }

    .preview-container {
      position: relative;
      width: 100%;
      height: 180px;
      border-radius: 6px;
      overflow: hidden;

      .upload-preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .preview-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      &:hover .preview-overlay {
        opacity: 1;
      }
    }

    .or-separator {
      text-align: center;
      margin: 10px 0;
      position: relative;

      span {
        background: #FFFFFF;
        padding: 0 10px;
        font-size: 0.76rem;
        color: #9CA3AF;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        border-top: 1px solid #E5E7EB;
        z-index: -1;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    .form-group {
      margin-bottom: 14px;
    }

    .form-label {
      display: block;
      font-size: 0.84rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
    }

    .form-control {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      font-size: 0.88rem;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #4A5C2F;
        box-shadow: 0 0 0 3px rgba(74, 92, 47, 0.15);
      }
    }

    .hint-text {
      display: block;
      font-size: 0.75rem;
      color: #6B7280;
      margin-top: 4px;
    }

    .status-checkbox-row {
      margin-top: 10px;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      cursor: pointer;
      color: #374151;
      font-weight: 500;
    }

    .btn-light {
      background: #FFFFFF;
      color: #111827;
      border: 1px solid #D1D5DB;
    }

    .btn-danger {
      background: #DC2626;
      color: #FFFFFF;
      border: 1px solid #DC2626;
      &:hover { background: #B91C1C; }
    }
  `]
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
