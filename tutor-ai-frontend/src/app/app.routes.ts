import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileSetupComponent } from './profile-setup/profile-setup.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  { path: 'profile-setup', component: ProfileSetupComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
