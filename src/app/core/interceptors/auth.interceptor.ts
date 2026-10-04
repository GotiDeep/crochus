import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

const USER_TOKEN_KEY = 'crochus_token';
const ADMIN_TOKEN_KEY = 'crochus_admin_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const adminService = inject(AdminService);

  const isAdminRequest = req.url.includes('/admin/');
  const tokenKey = isAdminRequest ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY;
  const token = sessionStorage.getItem(tokenKey);

  const forwardReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(forwardReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // If the request was authenticated and returned 401 (e.g. JWT expired)
        if (isAdminRequest) {
          adminService.logout();
        } else if (token) {
          authService.handleSessionExpired();
        }
      }
      return throwError(() => error);
    })
  );
};

