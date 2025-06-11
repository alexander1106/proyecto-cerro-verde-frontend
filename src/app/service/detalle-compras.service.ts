import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DetalleComprasService {

  constructor(private http: HttpClient) { }

  eliminarCategoria(id: number) {
    return this.http.delete(`http://localhost:8080/cerro-verde/detallescompra/${id}`)
  }
}
