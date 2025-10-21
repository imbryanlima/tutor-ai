import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const publicRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/refresh'];
    const isPublicRoute = publicRoutes.some(route => request.url.includes(route));

    if (token && !isPublicRoute) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!isPublicRoute && (error.status === 401 || error.status === 403)) {
          console.error('Authentication error, logging out.', error);
          this.authService.logout();
        }
        return throwError(() => error);
      }) 
    );
  } 
} 