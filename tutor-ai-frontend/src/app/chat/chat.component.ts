import { Component } from '@angular/core';
import { ChatService } from '../services/chat.service';

// Imports necessários para as ferramentas do template
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  mensagens: { autor: 'user' | 'ia', texto: string }[] = [];
  novaMensagem: string = '';
  estaCarregando: boolean = false;

  constructor(private chatService: ChatService) { }

  enviarMensagem(): void {
    if (this.novaMensagem.trim() === '') {
      return;
    }
    
    this.mensagens.push({ autor: 'user', texto: this.novaMensagem });
    
    const mensagemParaEnviar = this.novaMensagem;
    this.novaMensagem = '';
    this.estaCarregando = true;

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
}