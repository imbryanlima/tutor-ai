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

  // <<< MUDANÇA CRÍTICA AQUI: O MÉTODO QUE FALTAVA FOI ADICIONADO >>>
  /**
   * Verifica se o usuário está autenticado checando a existência de um token.
   * @returns `true` se o token existir, `false` caso contrário.
   */
  public isLoggedIn(): boolean {
    const token = this.getToken();
    // A dupla negação (!!) transforma a string do token (ou null) em um booleano puro (true/false).
    return !!token;
  }

  public logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
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