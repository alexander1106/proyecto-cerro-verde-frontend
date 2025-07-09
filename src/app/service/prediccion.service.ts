import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrediccionService {

  private apiUrl = 'http://localhost:8000/predecir';

  constructor(private http: HttpClient) {}

  predecir(fecha: string): Observable<any> {
    const body = { fecha };
    return this.http.post<any>(this.apiUrl, body);
  }


}
