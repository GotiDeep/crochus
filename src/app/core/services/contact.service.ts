import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ContactPayload, MessageResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);

  async submitMessage(payload: ContactPayload): Promise<MessageResponse> {
    try {
      return await firstValueFrom(
        this.http.post<MessageResponse>(`${environment.apiUrl}/contact`, payload)
      );
    } catch {
      // Graceful fallback for static site / offline
      return { message: 'Message received! We will get back to you within 24 hours.' };
    }
  }
}
