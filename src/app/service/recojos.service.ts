import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from './reserva.service';
import { Conductores } from './conductores.service';

export interface Recojos {
  id_recojo?: number;
  destino: string;
  fecha_hora: Date | string;
  estado: number;
  reserva: Reserva;
  conductor: Conductores;
  estado_recojo: string
}



@Injectable({
  providedIn: 'root'
})
export class RecojosService {
  private apiUrl = 'http://localhost:8080/cerro-verde/recepcion';

  constructor(private http: HttpClient) { }

  getRecojos(): Observable<Recojos[]> {
    return this.http.get<Recojos[]>(`${this.apiUrl}/recojos`);
  }

  getRecojo(id: number): Observable<Recojos> {
    return this.http.get<Recojos>(`${this.apiUrl}/recojos/${id}`);
  }

  createRecojo(recojo: Recojos): Observable<Recojos> {
    return this.http.post<Recojos>(`${this.apiUrl}/recojos`, recojo);
  }

  updateRecojo(recojo: Recojos): Observable<Recojos> {
    return this.http.put<Recojos>(`${this.apiUrl}/recojos/${recojo.id_recojo}`, recojo);
  }

  deleteRecojo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/recojos/eliminar/${id}`);
  }

    
  
}
