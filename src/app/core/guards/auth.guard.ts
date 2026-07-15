import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  auth.redirectUrl = state.url;
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const admin = inject(AdminService);
  const router = inject(Router);

  if (admin.isAdminLoggedIn()) return true;
  router.navigate(['/admin']);
  return false;
};
