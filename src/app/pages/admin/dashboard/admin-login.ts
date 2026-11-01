import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLoginComponent {
  private admin = inject(AdminService);
  private router = inject(Router);

  email = 'admin@crochus.com';
  password = '';
  showPass = signal(false);
  loading = signal(false);
  error = signal('');

  constructor() {
    if (this.admin.isAdminLoggedIn()) this.router.navigate(['/admin/dashboard']);
  }

  togglePassword() {
    this.showPass.set(!this.showPass());
  }

  async login() {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Please provide both admin email and password');
      return;
    }
    this.loading.set(true);
    try {
      await this.admin.login(this.password, this.email);
      this.loading.set(false);
      this.router.navigate(['/admin/dashboard']);
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Invalid admin credentials');
    }
  }
}
