import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient, private router: Router) { }

  public saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public logout(): void {
    localStorage.removeItem('auth_token');
    // Leva o usuário de volta para a tela de login
    this.router.navigate(['/login']);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      // 'tap' permite executar uma ação sem modificar a resposta
      tap(response => {
        // Se a resposta contiver um token, salva ele
        if (response && response.token) {
          this.saveToken(response.token);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, userData).pipe(
      tap(response => {
        if (response && response.token) {
          this.saveToken(response.token);
        }
      })
    );
  }
}