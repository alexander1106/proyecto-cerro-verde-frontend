import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Imagen {
  id_imagen?: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImagenesService {
  private baseUrl = 'http://localhost:8080/cerro-verde';

  constructor(private http: HttpClient) {}

  // Método para obtener todas las imágenes
  getImagen(): Observable<Imagen[]> {
    return this.http.get<Imagen[]>(`${this.baseUrl}/imagenes`);
  }

  createImagen(imagen: Imagen): Observable<Imagen> {
    return this.http.post<Imagen>(`${this.baseUrl}/imagenes`, imagen);
  }

  updateImagen(imagen: Imagen): Observable<Imagen> {
    return this.http.put<Imagen>(`${this.baseUrl}/imagenes/${imagen.id_imagen}`, imagen);
  }

  deleteImagen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/imagenes/${id}`);
  }
}
