import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const USER_TOKEN_KEY = 'crochus_token';
const ADMIN_TOKEN_KEY = 'crochus_admin_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const isAdminRequest = req.url.includes('/admin/');
  const tokenKey = isAdminRequest ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY;
  const token = localStorage.getItem(tokenKey);

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};

