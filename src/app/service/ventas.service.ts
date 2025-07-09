import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  private baseUrl = 'http://localhost:8080/cerro-verde';

  constructor(private http: HttpClient) {}

  // ========== MÉTODOS EXISTENTES (mantenidos) ==========
  listarVenta(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/venta`);
  }

  buscarVentaId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/venta/${id}`);
  }

  registrarVenta(venta: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/venta`, venta);
  }

  modificarVenta(venta: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/venta`, venta);
  }

  eliminarVenta(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/venta/${id}`);
  }

  descargarComprobante(idVenta: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/pdf/${idVenta}`, {
      responseType: 'blob',
    });
  }

  descargarNotaCredito(id: number): Observable<Blob> {
    const url = `${this.baseUrl}/notaCredito/${id}/descargar`;
    return this.http.get(url, { responseType: 'blob' });
  }

  obtenerNotaCreditoPorVenta(idVenta: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notaCredito/porVenta/${idVenta}`);
  }

  // ========== NUEVOS MÉTODOS BASADOS EN TU CONTROLLER ==========

  // Registrar pago de hospedaje
  registrarPagoHospedaje(venta: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/venta/hospedaje`, venta);
  }

  // Registrar venta de productos
  registrarVentaProductos(venta: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/venta/productos`, venta);
  }

  // Editar venta de productos
  editarVentaProductos(venta: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/venta/productos`, venta);
  }

  // Confirmar venta de productos
  confirmarVentaProductos(
    ventaId: number,
    tipoComprobante: string
  ): Observable<any> {
    const params = new HttpParams().set('tipoComprobante', tipoComprobante);
    return this.http.put(
      `${this.baseUrl}/venta/productos/${ventaId}/confirmar`,
      {},
      { params }
    );
  }

  // ========== MÉTODOS AUXILIARES ==========

  // Verificar si una venta se puede editar
  puedeEditarVenta(venta: any): boolean {
    return venta.tipoVenta === 'productos' && venta.estadoVenta === 'pendiente';
  }

  // Verificar si una venta se puede confirmar
  puedeConfirmarVenta(venta: any): boolean {
    return venta.tipoVenta === 'productos' && venta.estadoVenta === 'pendiente';
  }

  // Verificar si una venta tiene comprobante
  tieneComprobante(venta: any): boolean {
    return venta.estadoVenta === 'completada' && !!venta.comprobantePago;
  }

  // Agregar estos métodos a tu VentasService existente

  // Filtrar ventas por tipo y estado en el frontend
  filtrarVentas(ventas: any[], tipo?: string, estado?: string): any[] {
    let filtradas = ventas;

    if (tipo) {
      if (tipo === 'hospedaje') {
        filtradas = filtradas.filter(
          (v) =>
            v.tipoVenta === 'hospedaje' &&
            (v.estadoVenta === 'completada' || v.estadoVenta === 'cancelada')
        );
      } else if (tipo === 'productos') {
        filtradas = filtradas.filter((v) => v.tipoVenta === 'productos');
      }
    }

    if (estado) {
      filtradas = filtradas.filter((v) => v.estadoVenta === estado);
    }

    return filtradas;
  }

  // Verificar si es venta de productos pendiente
  esVentaProductosPendiente(venta: any): boolean {
    return venta.tipoVenta === 'productos' && venta.estadoVenta === 'pendiente';
  }

  // Verificar si puede generar comprobante
  puedeGenerarComprobante(venta: any): boolean {
    return (
      venta.estadoVenta === 'completada' || venta.estadoVenta === 'Completado'
    );
  }
}
