import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  // CORREÇÃO: Padrão Standalone e imports de módulos essenciais
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.errorMessage = null;

    this.authService.register({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Cadastro bem-sucedido. Token:', response.token);
        alert(response.message);
        this.router.navigate(['/profile-setup']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao tentar cadastrar. Tente novamente.';
        console.error('Erro de Cadastro:', err);
      },
    });
  }
}