import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  public saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
    console.log('[AuthService] Token salvo:', token);
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    const userProfile = this.getUserProfile();
    return !!token && !!userProfile;
  }

  public hasTokenButNoProfile(): boolean {
    return !!this.getToken() && !this.getUserProfile();
  }

  public logout(): void {
    localStorage.clear();
    console.log('[AuthService] Logout completo - localStorage limpo');
    this.router.navigate(['/login']);
  }

  public saveUserProfile(profile: any): void {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  public getUserProfile(): any {
    const profile = localStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
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
      tap((response) => {
        if (response && response.acessToken) {
          this.saveToken(response.acessToken);
        }
      })
    );
  }
}
