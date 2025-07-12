import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = signal(0);
  
  // Public readonly signal
  isLoading = this.loadingCount.asReadonly();

  show(): void {
    this.loadingCount.update(count => count + 1);
  }

  hide(): void {
    this.loadingCount.update(count => Math.max(0, count - 1));
  }

  hideAll(): void {
    this.loadingCount.set(0);
  }
}
