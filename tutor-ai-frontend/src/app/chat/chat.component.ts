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
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  userAwayFromBottom = false;
  private scrollListener?: (ev: Event) => void;
  public isSpeaking: boolean = false;
  public currentUtterance?: SpeechSynthesisUtterance;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.validateAccess()) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const cache = localStorage.getItem('chat.history');
    if (cache) {
      try {
        this.mensagens = JSON.parse(cache) as Mensagem[];
      } catch {
        this.mensagens = [];
      }
    }

    this.estaCarregandoHistorico = this.mensagens.length === 0;
    this.cdr.markForCheck();

    this.chatService.getHistorico(token).subscribe({
      next: (historico: any[]) => {
        this.mensagens = this.normalizeHistorico(historico);
        this.persistCache();
        this.estaCarregandoHistorico = false;
        this.cdr.markForCheck();
        setTimeout(() => this.scrollToBottom(true), 0);
      },
      error: (erro) => {
        console.error('Erro ao buscar histórico:', erro);
        this.estaCarregandoHistorico = false;
        this.cdr.markForCheck();
      },
    });
  }

  private validateAccess(): boolean {
    const token = localStorage.getItem('auth_token');
    const userProfile = localStorage.getItem('userProfile');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!userProfile) {
      this.router.navigate(['/profile-setup']);
      return false;
    }

    return true;
  }

  private normalizeHistorico(historico: any[]): Mensagem[] {
    if (!Array.isArray(historico)) {
      return [];
    }

    if (historico.length === 0) {
      return [];
    }

    const mensagensNormalizadas: Mensagem[] = [];

    for (const item of historico) {
      try {
        if (item && typeof item === 'object' && item.autor && item.texto) {
          mensagensNormalizadas.push({
            autor: item.autor === 'user' ? 'user' : 'ia',
            texto: String(item.texto),
          });
          continue;
        }

        if (item && typeof item === 'object') {
          const autor = this.extractAutor(item);
          const texto = this.extractTexto(item);

          if (texto) {
            mensagensNormalizadas.push({ autor, texto });
          }
          continue;
        }

        if (typeof item === 'string') {
          const mensagemString = this.parseStringMessage(item);
          if (mensagemString) {
            mensagensNormalizadas.push(mensagemString);
          }
          continue;
        }

        if (item != null) {
          mensagensNormalizadas.push({
            autor: 'ia',
            texto: String(item),
          });
        }
      } catch (error) {
        console.warn('Erro ao normalizar item do histórico:', item, error);
      }
    }

    return mensagensNormalizadas;
  }

  private extractAutor(item: any): Autor {
    const autorValue = item.autor || item.sender || item.role || item.type || 'ia';

    if (autorValue === 'user' || autorValue === 'usuário' || autorValue === 'usuario') {
      return 'user';
    }

    return 'ia';
  }

  private extractTexto(item: any): string {
    return String(
      item.texto || item.content || item.message || item.text || item.body || ''
    ).trim();
  }

  private parseStringMessage(text: string): Mensagem | null {
    if (!text || typeof text !== 'string') return null;

    const textLower = text.toLowerCase().trim();

    if (textLower.startsWith('usuário:') || textLower.startsWith('usuario:')) {
      return {
        autor: 'user',
        texto: text.substring(text.indexOf(':') + 1).trim(),
      };
    }

    if (
      textLower.startsWith('ia:') ||
      textLower.startsWith('assistente:') ||
      textLower.startsWith('bot:')
    ) {
      return {
        autor: 'ia',
        texto: text.substring(text.indexOf(':') + 1).trim(),
      };
    }

    return {
      autor: 'ia',
      texto: text.trim(),
    };
  }

  ngAfterViewInit(): void {
    const el = this.messageListWrapper?.nativeElement;
    if (!el) return;

    this.scrollListener = () => {
      const threshold = 80;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
      this.userAwayFromBottom = !atBottom;
      this.cdr.markForCheck();
    };

    el.addEventListener('scroll', this.scrollListener, { passive: true });
    setTimeout(() => this.scrollToBottom(true), 0);
  }

  ngOnDestroy(): void {
    const el = this.messageListWrapper?.nativeElement;
    if (el && this.scrollListener) {
      el.removeEventListener('scroll', this.scrollListener);
    }
  }

  public renderMarkdown(text: string): SafeHtml {
    if (!text) return '';

    const result = marked.parse(text);
    const html = typeof result === 'string' ? result : '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  public falar(text: string) {
    if (!text || !('speechSynthesis' in window)) return;

    text = text
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF])/g,
        ''
      )
      .replace(/[*_`#>]/g, '');

    if (this.isSpeaking && this.currentUtterance) {
      window.speechSynthesis.cancel();
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

      this.isSpeaking = true;
      this.currentUtterance = utterance;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = undefined;
      };

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      const handleVoices = () => {
        setVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
      window.speechSynthesis.onvoiceschanged = handleVoices;
    } else {
      setVoice();
    }
  }

  enviarMensagem(): void {
    const texto = this.novaMensagem?.trim();
    if (!texto) return;

    this.mensagens.push({ autor: 'user', texto });
    this.persistCache();
    this.novaMensagem = '';
    this.estaCarregandoResposta = true;
    this.cdr.markForCheck();
    this.scrollToBottom(true);

    this.chatService.sendMessage(texto).subscribe({
      next: (respostaDaIA: string) => {
        this.mensagens.push({ autor: 'ia', texto: respostaDaIA });
        this.estaCarregandoResposta = false;
        this.persistCache();
        this.cdr.markForCheck();
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
}