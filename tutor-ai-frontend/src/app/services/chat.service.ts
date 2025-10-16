// Em: src/app/services/chat.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // Usando o proxy, a URL para a API é relativa
  private apiUrl = '/api/ai/message';

  constructor(private http: HttpClient, private authService: AuthService) { }

  sendMessage(message: string): Observable<string> {
    const token = this.authService.getToken(); // Pega o token salvo pelo AuthService

    if (!token) {
      // Em um app real, aqui você poderia redirecionar para o login
      throw new Error('Token de autenticação não encontrado!');
    }

    // Monta o cabeçalho com o token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Monta o corpo da requisição
    const body = { message: message };

    // Faz a chamada POST e espera uma resposta em formato de texto
    return this.http.post(this.apiUrl, body, { headers, responseType: 'text' });
  }
}
