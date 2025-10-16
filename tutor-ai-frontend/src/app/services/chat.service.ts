// Em: src/app/services/chat.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiBase = '/api/ai/';

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

    const body = { message };

    return this.http.post<string>(`${this.apiBase}message`, body, { headers, responseType: 'text' as 'json' });
  }

  getHistorico(token: string): Observable<{ autor: 'user' | 'ia', texto: string }[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{ autor: 'user' | 'ia', texto: string }[]>(`${this.apiBase}history`, { headers });
  }
}
