import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pisos {
  id_piso?: number;
  numero: number;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class PisosService {
  private baseUrl = 'http://localhost:8080/cerro-verde/recepcion';

  constructor(private http: HttpClient) { }

  getPisos(): Observable<Pisos[]> {
    return this.http.get<Pisos[]>(`${this.baseUrl}/pisos`);
  }

  getPiso(id: number): Observable<Pisos> {
    return this.http.get<Pisos>(`${this.baseUrl}/pisos/${id}`);
  }

  createPiso(piso: Pisos): Observable<Pisos> {
    return this.http.post<Pisos>(`${this.baseUrl}/pisos`, piso);
  }

  deletePiso(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/pisos/eliminar/${id}`);
  }

  
}