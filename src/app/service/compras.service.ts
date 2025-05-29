import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComprasService {
  constructor(private http: HttpClient) {}

  listarCompra() {
    return this.http.get<any[]>('http://localhost:8080/api/compras');
  }

  buscarCompraId(id: number) {
    return this.http.get(`http://localhost:8080/api/compras/${id}`);
  }

  registrarCompra(compra: any) {
    return this.http.post('http://localhost:8080/api/compras', compra);
  }

  modificarCompra(compra: any) {
    return this.http.put('http://localhost:8080/api/compras', compra);
  }

  eliminarCompra(id: number) {
    return this.http.delete(`http://localhost:8080/api/compras/${id}`);
  }

  obtenerDatosNuevaCompra(): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/datos-nuevacompra`);
  }
}
