import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HabitacionReserva } from './habitaciones.service';
import { Cliente } from './clientes.service';

export interface Huespedes {
  idHuesped?: number;
  habres: HabitacionReserva;
  cliente: Cliente;
  estado: number;
}

export interface HabitacionReservaConHuespedes extends HabitacionReserva {
  huespedes: Huespedes[];
}

@Injectable({
  providedIn: 'root'
})
export class HuespedService {
  private apiUrl = 'http://localhost:8080/cerro-verde/recepcion';

  constructor(private http: HttpClient) { }

  getHuespedes(): Observable<Huespedes[]> {
    return this.http.get<Huespedes[]>(`${this.apiUrl}/huespedes`);
  }

  getHuespedById(id: number): Observable<Huespedes> {
    return this.http.get<Huespedes>(`${this.apiUrl}/huespedes/${id}`);
  }

  createHuesped(huesped: Huespedes): Observable<Huespedes> {
    return this.http.post<Huespedes>(`${this.apiUrl}/huespedes`, huesped);
  }

  updateHuesped(id: number, huesped: Huespedes): Observable<Huespedes> {
    return this.http.put<Huespedes>(`${this.apiUrl}/huespedes/${id}`, huesped);
  }

  deleteHuesped(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/huespedes/${id}`);
  }
}
