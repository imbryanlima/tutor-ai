import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileSetupComponent } from './profile-setup/profile-setup.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  { path: 'profile-setup', component: ProfileSetupComponent },
  
  { path: 'chat', component: ChatComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
