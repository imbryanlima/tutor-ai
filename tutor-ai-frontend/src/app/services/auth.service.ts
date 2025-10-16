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
    console.log('[AuthService] Token salvo:', token);
  }


  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  public logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  login(credentials: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
    tap(response => {
      console.log('[AuthService] Resposta do login:', response);

      if (response && response.accessToken) {
        this.saveToken(response.accessToken);
      } else {
        console.warn('[AuthService] accessToken ausente!');
      }
    })
  );
}

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, userData).pipe(
      tap(response => {
        if (response && response.acessToken) {
          this.saveToken(response.acessToken);
        }
      })
    );
  }
}