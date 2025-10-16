import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from '../services/chat.service';

// Imports que já tínhamos
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// (Se você voltar a usar o SafeHtmlPipe, o import estaria aqui)

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked { // <<< MUDANÇA 1: Implementa AfterViewChecked

  // <<< MUDANÇA 2: Pega o elemento HTML com a #tag 'messageListWrapper' >>>
  @ViewChild('messageListWrapper') private messageListWrapper!: ElementRef;

  mensagens: { autor: 'user' | 'ia', texto: string }[] = [];
  novaMensagem: string = '';
  estaCarregando: boolean = false;

  constructor(private chatService: ChatService) { }

  // <<< MUDANÇA 3: Este método é chamado toda vez que a tela é atualizada >>>
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  enviarMensagem(): void {
    if (this.novaMensagem.trim() === '') {
      return;
    }
    
    this.mensagens.push({ autor: 'user', texto: this.novaMensagem });
    
    const mensagemParaEnviar = this.novaMensagem;
    this.novaMensagem = '';
    this.estaCarregando = true;

    // Força a rolagem para a mensagem do usuário imediatamente
    this.scrollToBottom();

    this.chatService.sendMessage(mensagemParaEnviar).subscribe({
      next: (respostaDaIA) => {
        this.mensagens.push({ autor: 'ia', texto: respostaDaIA });
        this.estaCarregando = false;
      },
      error: (erro) => {
        this.mensagens.push({ autor: 'ia', texto: 'Desculpe, algo deu errado. Tente novamente.' });
        console.error(erro);
        this.estaCarregando = false;
      }
    });
  }

  // <<< MUDANÇA 4: A função que faz a mágica de rolar para baixo >>>
  private scrollToBottom(): void {
    try {
      // Pequeno timeout para garantir que o DOM foi atualizado antes de rolar
      setTimeout(() => {
        this.messageListWrapper.nativeElement.scrollTop = this.messageListWrapper.nativeElement.scrollHeight;
      }, 0);
    } catch(err) {
      console.error("Erro ao rolar o chat:", err);
    }
  }
}