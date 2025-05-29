import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
}
