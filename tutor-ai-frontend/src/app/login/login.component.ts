import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  onLogin(): void {
    this.errorMessage = null;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido. Token recebido:', response.accessToken);

        // VERIFICAR SE JÁ TEM PERFIL CONFIGURADO
        this.checkUserProfile();
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Erro ao fazer login. Verifique suas credenciais.';
        console.error('Erro de Login:', err);
      },
    });
  }

  private checkUserProfile(): void {
    this.http.get('/api/profile/get').subscribe({
      next: (profileResponse: any) => {
        if (profileResponse.success && profileResponse.profile) {
          localStorage.setItem('userProfile', JSON.stringify(profileResponse.profile));
          this.router.navigate(['/chat']);
        } else {
          this.router.navigate(['/profile-setup']);
        }
      },
      error: (error) => {
        console.error('Erro ao verificar perfil:', error);
        this.router.navigate(['/profile-setup']);
      },
    });
  }
}
