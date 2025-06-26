import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from './reserva.service';

export interface Sucursal {
  id_sucursal?: number;
  nombre: string;
}

export interface Imagen {
  id_imagen?: number;
  nombre: string;
}

export interface Salones {
  id_salon?: number;
  nombre: string;
  estado_salon: string;
  estado: number;
  precio_hora: number;
  precio_diario: number;
  capacidad:number;
  sucursal?: Sucursal;
}

export interface SalonReserva {
  id_salon_reserv?: number;
  salon: Salones;
  reserva: Reserva;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalonesService {
  private apiUrl = 'http://localhost:8080/cerro-verde/recepcion';

  constructor(private http: HttpClient) { }

  // Salones
  getSalones(): Observable<Salones[]> {
    return this.http.get<Salones[]>(`${this.apiUrl}/salones`);
  }

  getSalon(id: number): Observable<Salones> {
    return this.http.get<Salones>(`${this.apiUrl}/salones/${id}`);
  }

  createSalon(salon: Salones): Observable<Salones> {
    return this.http.post<Salones>(`${this.apiUrl}/salones`, salon);
  }

  updateSalon(salon: Salones): Observable<Salones> {
    return this.http.put<Salones>(`${this.apiUrl}/salones/${salon.id_salon}`, salon);
  }

  deleteSalon(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/salones/eliminar/${id}`, { responseType: 'text' });
  }

  // Estados disponibles
  getEstadosSalon(): string[] {
    return ['Disponible', 'Ocupado', 'Reservado', 'Limpieza'];
  }

  // Salones X Reserva
  getSalonesReserva(): Observable<SalonReserva[]> {
    return this.http.get<SalonReserva[]>(`${this.apiUrl}/salonreservas`);
  }

  createSalonReserva(salonReserva: SalonReserva): Observable<SalonReserva> {
    return this.http.post<SalonReserva>(`${this.apiUrl}/salonreservas`, salonReserva);
  }

  updateSalonReserva(id: number, salonReserva: SalonReserva): Observable<SalonReserva> {
    return this.http.put<SalonReserva>(`${this.apiUrl}/salonreservas/${id}`, salonReserva);
  }

  deleteSalonReserva(id_salonreserva: number) {
    return this.http.delete(`${this.apiUrl}/salonreservas/eliminar/${id_salonreserva}`, { responseType: 'text' });
  }  

  deleteSalonesByReserva(id_reserva: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reserva/salon/${id_reserva}`);
  }
}
