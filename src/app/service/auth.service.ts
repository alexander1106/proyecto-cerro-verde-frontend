// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = 'http://localhost:8080/cerro-verde';

  constructor(private http: HttpClient) {}

  registrar(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/usuarios/`, usuario);
  }

  generarToken(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/generar-token`, {
      username,
      password
    });
  }

  registrarConToken(usuario: any): Observable<string> {
    return this.registrar(usuario).pipe(
      switchMap(() =>
        this.generarToken(usuario.username, usuario.password).pipe(
          map((resp: any) => resp.token)
        )
      )
    );
  }
}
