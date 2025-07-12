import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, delayWhen } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable()
export class ApiHttpInterceptor implements HttpInterceptor {
  private messageService = inject(MessageService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add common headers
    const apiReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    return next.handle(apiReq).pipe(
      // Retry failed requests with exponential backoff
      retry({
        count: 2,
        delay: (error, retryIndex) => {
          if (error.status >= 500) {
            // Retry server errors with exponential backoff
            return timer(Math.pow(2, retryIndex) * 1000);
          }
          // Don't retry client errors
          return throwError(() => error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleHttpError(error);
        return throwError(() => error);
      })
    );
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let message = 'An unexpected error occurred';
    let severity: 'success' | 'info' | 'warn' | 'error' = 'error';

    switch (error.status) {
      case 0:
        message = 'Unable to connect to the server. Please check your internet connection.';
        break;
      case 400:
        message = 'Invalid request. Please check your input.';
        break;
      case 401:
        message = 'You are not authorized to perform this action.';
        break;
      case 403:
        message = 'Access denied.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 429:
        message = 'Too many requests. Please wait a moment and try again.';
        severity = 'warn';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      case 503:
        message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        if (error.error?.message) {
          message = error.error.message;
        }
    }

    // Show toast notification for errors
    if (error.status !== 404) { // Don't show toast for 404 errors (handled by components)
      this.messageService.add({
        severity,
        summary: 'Error',
        detail: message,
        life: 5000
      });
    }
  }
}