import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

interface ProfileData {
  englishLevel: string;
  learningGoal: string;
  musicGenres?: string[]; // agora é compatível com a nova resposta
}

interface ApiResponse {
  success: boolean;
  message: string;
  profile?: ProfileData;
}

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.css'],
})
export class ProfileSetupComponent implements OnInit, OnDestroy {
  englishLevel: string = '';
  learningGoal: string = '';
  musicGenres: string[] = [];

  message: string | null = null;
  isSuccess: boolean = false;
  isLoading: boolean = false;

  private apiUrl = '/api/profile/save';
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadExistingProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
            this.musicGenres = response.profile.musicGenres || [];
          } else {
            this.showMessage(response.message || 'Perfil não encontrado.', false);
          }
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.warn('Não foi possível carregar perfil existente:', error.message);
          this.isLoading = false;
        },
      });
  }

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
      this.showMessage('Por favor, forneça uma descrição mais detalhada do seu objetivo (mínimo 10 caracteres).', false);
      return false;
    }

    if (this.learningGoal.trim().length > 500) {
      this.showMessage('A descrição do objetivo deve ter no máximo 500 caracteres.', false);
      return false;
    }

    return true;
  }

  saveProfile(): void {
    this.message = null;

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    const profileData: ProfileData = {
      englishLevel: this.englishLevel.trim(),
      learningGoal: this.learningGoal.trim(),
      musicGenres: this.musicGenres,
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

  private showMessage(message: string, isSuccess: boolean): void {
    this.message = message;
    this.isSuccess = isSuccess;

    if (!isSuccess) {
      setTimeout(() => {
        this.message = null;
      }, 5000);
    }
  }

  clearForm(): void {
    this.englishLevel = '';
    this.learningGoal = '';
    this.musicGenres = [];
    this.message = null;
  }

  canSave(): boolean {
    return (
      !this.isLoading &&
      !!this.englishLevel.trim() &&
      !!this.learningGoal.trim() &&
      this.learningGoal.trim().length >= 10 &&
      this.learningGoal.trim().length <= 500
    );
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }
}
