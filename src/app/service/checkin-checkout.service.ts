import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from './reserva.service';

export interface CheckinCheckout {
  id_check?: number;
  fecha_checkin: Date | string;
  fecha_checkout: Date | string;
  reserva: Reserva;
  estado: number
}

@Injectable({
  providedIn: 'root'
})
export class CheckinCheckoutService {
  private baseUrl = 'http://localhost:8080/cerro-verde/recepcion/checks';

  constructor(private http: HttpClient) { }

  buscarTodos(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  guardar(check: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, check);
  }

  modificar(check: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${check.id_check}`, check);
  }

  buscarId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminar/${id}`);
  }
}