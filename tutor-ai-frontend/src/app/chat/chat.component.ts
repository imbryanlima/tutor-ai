import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';

// PrimeNG v20
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';

type Autor = 'user' | 'ia';
export interface Mensagem {
  autor: Autor;
  texto: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonModule, TextareaModule, SkeletonModule, RippleModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messageListWrapper') messageListWrapper?: ElementRef<HTMLDivElement>;

  mensagens: Mensagem[] = [];
  novaMensagem = '';
  estaCarregandoHistorico = false;
  estaCarregandoResposta = false;

  // Público para *ngIf no template
  userAwayFromBottom = false;

  private scrollListener?: (ev: Event) => void;

  public isSpeaking: boolean = false; // se está falando atualmente
  public currentUtterance?: SpeechSynthesisUtterance; // referência ao áudio atual

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // 1) Cache local (se houver)
    const cache = localStorage.getItem('chat.history');
    if (cache) {
      try {
        this.mensagens = JSON.parse(cache) as Mensagem[];
      } catch {
        this.mensagens = [];
      }
    }

    // 2) Estado de carregamento do histórico só se não houver cache
    this.estaCarregandoHistorico = this.mensagens.length === 0;
    this.cdr.markForCheck();

    // 3) Buscar histórico do backend
    this.chatService.getHistorico(token).subscribe({
      next: (historico: any[]) => {
        this.mensagens = this.normalizeHistorico(historico);
        this.persistCache();
        this.estaCarregandoHistorico = false;
        this.cdr.markForCheck();

        // rola ao final após renderizar
        setTimeout(() => this.scrollToBottom(true), 0);
      },
      error: (erro) => {
        console.error('Erro ao buscar histórico:', erro);
        this.estaCarregandoHistorico = false;
        this.cdr.markForCheck();
      },
    });
  }

  ngAfterViewInit(): void {
    const el = this.messageListWrapper?.nativeElement;
    if (!el) return;

    this.scrollListener = () => {
      const threshold = 80; // px
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
      this.userAwayFromBottom = !atBottom;
      this.cdr.markForCheck();
    };

    el.addEventListener('scroll', this.scrollListener, { passive: true });

    // Se já havia mensagens (cache), garanta posicionamento inicial
    setTimeout(() => this.scrollToBottom(true), 0);
  }

  ngOnDestroy(): void {
    const el = this.messageListWrapper?.nativeElement;
    if (el && this.scrollListener) {
      el.removeEventListener('scroll', this.scrollListener);
    }
  }

  public falar(text: string) {
    if (!text || !('speechSynthesis' in window)) return;

    // Se já está falando, pausamos/resumimos
    if (this.isSpeaking && this.currentUtterance) {
      window.speechSynthesis.cancel(); // ou pause/resume se quiser
      this.isSpeaking = false;
      this.currentUtterance = undefined;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.name.includes('Google US English')) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;

      // Atualiza o estado
      this.isSpeaking = true;
      this.currentUtterance = utterance;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = undefined;
      };

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  }

  enviarMensagem(): void {
    const texto = this.novaMensagem?.trim();
    if (!texto) return;

    // adiciona mensagem do usuário
    this.mensagens.push({ autor: 'user', texto });
    this.persistCache();
    this.novaMensagem = '';
    this.estaCarregandoResposta = true;
    this.cdr.markForCheck();

    // rola ao final (forçado porque foi o usuário que enviou)
    this.scrollToBottom(true);

    // chama backend
    this.chatService.sendMessage(texto).subscribe({
      next: (respostaDaIA: string) => {
        this.mensagens.push({ autor: 'ia', texto: respostaDaIA });
        this.estaCarregandoResposta = false;
        this.persistCache();
        this.cdr.markForCheck();

        // rola ao final somente se usuário estiver próximo do fim
        this.scrollToBottom(false);
      },
      error: (erro) => {
        console.error(erro);
        this.mensagens.push({ autor: 'ia', texto: 'Desculpe, algo deu errado. Tente novamente.' });
        this.estaCarregandoResposta = false;
        this.persistCache();
        this.cdr.markForCheck();

        this.scrollToBottom(false);
      },
    });
  }

  onEnterKey(event: KeyboardEvent | Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault?.();
      this.enviarMensagem();
    }
  }

  goToBottom() {
    this.scrollToBottom(true);
  }

  trackByIndex(i: number) {
    return i;
  }

  private scrollToBottom(force = false): void {
    const el = this.messageListWrapper?.nativeElement;
    if (!el) return;

    if (force || !this.userAwayFromBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }

  private persistCache() {
    try {
      localStorage.setItem('chat.history', JSON.stringify(this.mensagens));
    } catch {}
  }

  /** Normaliza qualquer formato do backend para {autor:'user'|'ia', texto:string} */
  private normalizeHistorico(historico: any[]): Mensagem[] {
    if (!Array.isArray(historico)) return [];

    return historico.map((mensagem: string): Mensagem => {
      if (typeof mensagem !== 'string') return { autor: 'ia', texto: '' };

      let autor: Autor = 'ia'; // padrão
      let texto = mensagem;

      if (mensagem.toLowerCase().startsWith('usuário:')) {
        autor = 'user';
        texto = mensagem.substring(8).trim();
      } else if (mensagem.toLowerCase().startsWith('ia:')) {
        autor = 'ia';
        texto = mensagem.substring(3).trim();
      }

      return { autor, texto };
    });
  }
}
