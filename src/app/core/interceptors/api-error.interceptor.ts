import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

function extractMessage(error: HttpErrorResponse): string {
  if (typeof error.error?.message === 'string' && error.error.message.trim()) {
    return error.error.message;
  }

  return error.message || 'Request failed';
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) =>
      throwError(() => new Error(extractMessage(error)))
    )
  );

