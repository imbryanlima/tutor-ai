import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../auth.service';

// Interface para os dados do perfil
interface ProfileData {
  englishLevel: string;
  learningGoal: string;
}

// Interface para a resposta da API
interface ApiResponse {
  message: string;
  profile?: any;
  success: boolean;
}

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.css'],
})
export class ProfileSetupComponent implements OnInit, OnDestroy {
  englishLevel: string = '';
  learningGoal: string = '';

  message: string | null = null;
  isSuccess: boolean = false;
  isLoading: boolean = false;

  private apiUrl = '/api/profile/save';
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    // Verifica autenticação ao inicializar
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Carrega perfil existente se disponível
    this.loadExistingProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega o perfil existente do usuário
   */
  private loadExistingProfile(): void {
    this.isLoading = true;

    this.http
      .get<ApiResponse>('/api/profile/get')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.profile) {
            this.englishLevel = response.profile.englishLevel || '';
            this.learningGoal = response.profile.learningGoal || '';
          }
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.warn('Não foi possível carregar perfil existente:', error.message);
          this.isLoading = false;
          // Não mostra erro para o usuário, pois pode ser o primeiro acesso
        },
      });
  }

  /**
   * Valida se o formulário está preenchido corretamente
   */
  private validateForm(): boolean {
    if (!this.englishLevel.trim()) {
      this.showMessage('Por favor, selecione seu nível de inglês.', false);
      return false;
    }

    if (!this.learningGoal.trim()) {
      this.showMessage('Por favor, descreva seu objetivo de aprendizado.', false);
      return false;
    }

    if (this.learningGoal.trim().length < 10) {
      this.showMessage(
        'Por favor, forneça uma descrição mais detalhada do seu objetivo (mínimo 10 caracteres).',
        false
      );
      return false;
    }

    if (this.learningGoal.trim().length > 500) {
      this.showMessage('A descrição do objetivo deve ter no máximo 500 caracteres.', false);
      return false;
    }

    return true;
  }

  /**
   * Salva o perfil do usuário
   */
  saveProfile(): void {
    // Limpa mensagens anteriores
    this.message = null;

    // Valida o formulário
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    const profileData: ProfileData = {
      englishLevel: this.englishLevel.trim(),
      learningGoal: this.learningGoal.trim(),
    };

    this.http
      .post<ApiResponse>(this.apiUrl, profileData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          this.isLoading = false;
          this.showMessage(
            response.message || 'Perfil atualizado com sucesso! Você está pronto para conversar!',
            true
          );

          // Redireciona para o chat após 2 segundos
          setTimeout(() => {
            this.router.navigate(['/chat']);
          }, 2000);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.handleError(error);
        },
      });
  }

  /**
   * Trata erros da requisição HTTP
   */
  private handleError(error: HttpErrorResponse): void {
    console.error('Erro ao salvar perfil:', error);

    switch (error.status) {
      case 0:
        this.showMessage('Erro de conexão. Verifique sua internet e tente novamente.', false);
        break;
      case 400:
        this.showMessage('Dados inválidos. Verifique as informações do formulário.', false);
        break;
      case 401:
      case 403:
        this.showMessage('Sessão expirada. Por favor, faça login novamente.', false);
        this.authService.logout();
        setTimeout(() => this.router.navigate(['/login']), 2000);
        break;
      case 500:
        this.showMessage('Erro interno do servidor. Tente novamente em alguns instantes.', false);
        break;
      default:
        this.showMessage('Erro inesperado. Por favor, tente novamente.', false);
    }
  }

  /**
   * Exibe mensagem para o usuário
   */
  private showMessage(message: string, isSuccess: boolean): void {
    this.message = message;
    this.isSuccess = isSuccess;

    // Remove a mensagem após 5 segundos (exceto para sucesso com redirecionamento)
    if (!isSuccess) {
      setTimeout(() => {
        this.message = null;
      }, 5000);
    }
  }

  /**
   * Limpa o formulário
   */
  clearForm(): void {
    this.englishLevel = '';
    this.learningGoal = '';
    this.message = null;
  }

  /**
   * Verifica se o botão de salvar deve estar habilitado
   */
  canSave(): boolean {
    return (
      !this.isLoading &&
      !!this.englishLevel.trim() &&
      !!this.learningGoal.trim() &&
      this.learningGoal.trim().length >= 10 &&
      this.learningGoal.trim().length <= 500
    );
  }

  /**
   * Logout do usuário
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Navega para a página do chat
   */
  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }
}
