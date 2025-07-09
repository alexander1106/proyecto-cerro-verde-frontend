import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  constructor(private http: HttpClient) {}

  listarVenta() {
    return this.http.get<any[]>('http://localhost:8080/cerro-verde/venta');
  }

  buscarVentaId(id: number) {
    return this.http.get(`http://localhost:8080/cerro-verde/venta/${id}`);
  }

  registrarVenta(venta: any) {
    return this.http.post('http://localhost:8080/cerro-verde/venta', venta);
  }

  modificarVenta(venta: any) {
    return this.http.put('http://localhost:8080/cerro-verde/venta', venta);
  }

  eliminarVenta(id: number) {
    return this.http.delete(`http://localhost:8080/cerro-verde/venta/${id}`);
  }

  descargarComprobante(idVenta: number) {
    return this.http.get(`http://localhost:8080/cerro-verde/pdf/${idVenta}`, {
      responseType: 'blob',
    });
  }

  descargarNotaCredito(id: number): Observable<Blob> {
    const url = `http://localhost:8080/cerro-verde/notaCredito/${id}/descargar`;
    return this.http.get(url, { responseType: 'blob' }); // 'blob' indica que estamos esperando un archivo
  }

  obtenerNotaCreditoPorVenta(idVenta: number): Observable<any> {
    return this.http.get(`http://localhost:8080/cerro-verde/notaCredito/porVenta/${idVenta}`);
  }
  
}
