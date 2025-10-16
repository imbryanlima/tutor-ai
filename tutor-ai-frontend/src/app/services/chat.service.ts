// Em: src/app/services/chat.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = '/api/ai/message';

  constructor(private http: HttpClient, private authService: AuthService) { }

  sendMessage(message: string): Observable<string> {
    const token = this.authService.getToken();

    if (!token) {
      throw new Error('Token de autenticação não encontrado!');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = { message: message };

    return this.http.post(this.apiUrl, body, { headers, responseType: 'text' });
  }
}
