import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Conductores {
  id_conductor?: number;
  nombre: string,
  dni: string;
  placa: string;
  modelo_vehiculo: string;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConductoresService {
  private baseUrl = 'http://localhost:8080/cerro-verde/recepcion';

  constructor(private http: HttpClient) { }

  getConductores(): Observable<Conductores[]> {
    return this.http.get<Conductores[]>(`${this.baseUrl}/conductores`);
  }

  getConductor(id: number): Observable<Conductores> {
    return this.http.get<Conductores>(`${this.baseUrl}/conductores/${id}`);
  }

  createConductor(conductor: Conductores): Observable<Conductores> {
    return this.http.post<Conductores>(`${this.baseUrl}/conductores`, conductor);
  }

  updateConductor(conductor: Conductores): Observable<Conductores> {
    return this.http.put<Conductores>(`${this.baseUrl}/conductores/${conductor.id_conductor}`, conductor);
  }

  deleteConductor(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/conductores/eliminar/${id}`);
  }

  buscarDni(numeroDni: string, headers: HttpHeaders) {
    return this.http.get<any>(`${this.baseUrl}/dni/${numeroDni}`, {headers});
  }
}