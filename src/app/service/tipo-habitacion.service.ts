import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoHabitacion {
  id_tipo_habitacion?: number;
  nombre: string;
  precio: number;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class TipoHabitacionService {
  private baseUrl = 'http://localhost:8080/cerro-verde/recepcion';

  constructor(private http: HttpClient) { }

  getTiposHabitacion(): Observable<TipoHabitacion[]> {
    return this.http.get<TipoHabitacion[]>(`${this.baseUrl}/habitaciones/tipo`);
  }

  getTipoHabitacion(id: number): Observable<TipoHabitacion> {
    return this.http.get<TipoHabitacion>(`${this.baseUrl}/habitaciones/tipo/${id}`);
  }

  createTipoHabitacion(tipo: TipoHabitacion): Observable<TipoHabitacion> {
    return this.http.post<TipoHabitacion>(`${this.baseUrl}/habitaciones/tipo`, tipo);
  }

  updateTipoHabitacion(tipo: TipoHabitacion): Observable<TipoHabitacion> {
    return this.http.put<TipoHabitacion>(`${this.baseUrl}/habitaciones/tipo/${tipo.id_tipo_habitacion}`, tipo);
  }

  deleteTipoHabitacion(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/habitaciones/tipo/' + id, { responseType: 'text' });
  }
}