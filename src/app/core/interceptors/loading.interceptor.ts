import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private loadingService = inject(LoadingService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Don't show loading for certain requests (like image uploads)
    if (req.url.includes('/images') || req.headers.has('X-Skip-Loading')) {
      return next.handle(req);
    }

    this.loadingService.show();

    return next.handle(req).pipe(finalize(() => this.loadingService.hide()));
  }
}
