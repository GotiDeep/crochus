import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class AuthComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  mode = signal<Mode>('login');
  loading = signal(false);
  error = signal('');
  showPass = signal(false);

  email = '';
  password = '';
  fullName = '';
  mobile = '';
  otpDigits: string[] = ['', '', '', '', '', ''];

  ngOnInit() {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'register') this.mode.set('register');

    if (this.adminService.isAdminLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.authService.redirectUrl || '/']);
    }
  }

  togglePassword() {
    this.showPass.set(!this.showPass());
  }

  async login() {
    this.error.set('');
    if (!this.email || !this.password) { this.error.set('Please fill in all fields'); return; }
    this.loading.set(true);
    try {
      if (this.email.trim().toLowerCase() === 'admin@crochus.com') {
        await this.adminService.login(this.password);
        this.loading.set(false);
        this.toast.success('Welcome admin!');
        this.router.navigate(['/admin/dashboard']);
        return;
      }

      await this.authService.login({ email: this.email, password: this.password });
      this.loading.set(false);
      this.toast.success('Welcome back!');
      this.router.navigate([this.authService.redirectUrl || '/']);
      this.authService.redirectUrl = null;
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async register() {
    this.error.set('');
    if (!this.fullName || !this.email || !this.mobile || !this.password) {
      this.error.set('Please fill in all fields'); return;
    }
    if (this.password.length < 6) { this.error.set('Password must be at least 6 characters'); return; }
    if (!/^\d{10}$/.test(this.mobile)) { this.error.set('Enter a valid 10-digit mobile number'); return; }
    this.loading.set(true);
    try {
      await this.authService.register({
        full_name: this.fullName,
        email: this.email,
        mobile: this.mobile,
        password: this.password
      });
      this.loading.set(false);
      this.toast.success('Account created! Welcome to Crochus');
      this.router.navigate(['/']);
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  }

  async verifyOtp() {
    this.error.set('');
    const otp = this.otpDigits.join('');
    if (otp.length < 6) { this.error.set('Enter the 6-digit OTP'); return; }
    this.loading.set(true);
    try {
      await this.authService.verifyOtp(this.email, otp);
      this.loading.set(false);
      this.toast.success('Account created! Welcome to Crochus 🌿');
      this.router.navigate(['/']);
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
    }
  }

  async sendForgotOtp() {
    this.error.set('');
    if (!this.email) { this.error.set('Enter your email'); return; }
    this.loading.set(true);
    try {
      const response = await this.authService.sendForgotPasswordOtp(this.email);
      this.loading.set(false);
      this.toast.info(response.dev_otp ? `Dev OTP: ${response.dev_otp}` : 'OTP sent to your email');
      this.mode.set('reset');
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Could not send OTP');
    }
  }

  async resetPassword() {
    this.error.set('');
    const otp = this.otpDigits.join('');
    if (otp.length < 6) { this.error.set('Enter the 6-digit OTP'); return; }
    if (this.password.length < 6) { this.error.set('Password must be at least 6 characters'); return; }
    this.loading.set(true);
    try {
      await this.authService.resetPassword(this.email, otp, this.password);
      this.loading.set(false);
      this.toast.success('Password updated!');
      this.mode.set('login');
    } catch (error) {
      this.loading.set(false);
      this.error.set(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
    }
  }

  onOtpInput(event: Event, index: number) {
    const val = (event.target as HTMLInputElement).value;
    this.otpDigits[index] = val.slice(-1);
    if (val && index < 5) {
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    }
  }
}
