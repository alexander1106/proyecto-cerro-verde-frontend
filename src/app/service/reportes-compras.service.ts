import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoReporte {
  productoNombre: string;
  cantidadComprada: number;
  totalGastado: number;
}

export interface ProveedorReporte {
  proveedorNombre: string;
  cantidadFacturas: number;
  totalGastado: number;
  productosComprados?: string; // Si deseas mostrar la lista de productos
}

@Injectable({
  providedIn: 'root'
})
export class ReportesComprasService {
  // Asegúrate de usar la URL correcta de tu backend:
  private readonly baseUrl = 'http://localhost:8080/cerro-verde/reportes';

  constructor(private http: HttpClient) { }

  /**
   * Productos más comprados con filtro de stock opcional
   */
  getProductosMasComprados(
    desde: string,
    hasta: string,
    stockFilter: string | null
  ): Observable<ProductoReporte[]> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    if (stockFilter) {
      params = params.set('stockFilter', stockFilter);
    }
    return this.http.get<ProductoReporte[]>(`${this.baseUrl}/productos`, { params });
  }

  /**
   * Proveedores más comprados
   */
  getProveedoresMasComprados(
    desde: string,
    hasta: string
  ): Observable<ProveedorReporte[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<ProveedorReporte[]>(`${this.baseUrl}/proveedores`, { params });
  }

  /**
   * Descargar PDF Productos
   */
  getProductosPdf(
    desde: string,
    hasta: string,
    stockFilter: string | null
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    if (stockFilter) {
      params = params.set('stockFilter', stockFilter);
    }
    return this.http.get(`${this.baseUrl}/productos/pdf`, { params, responseType: 'blob' });
  }

  /**
   * Descargar Excel Productos
   */
  getProductosExcel(
    desde: string,
    hasta: string,
    stockFilter: string | null
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    if (stockFilter) {
      params = params.set('stockFilter', stockFilter);
    }
    return this.http.get(`${this.baseUrl}/productos/excel`, { params, responseType: 'blob' });
  }

  /**
   * Descargar PDF Proveedores
   */
  getProveedoresPdf(
    desde: string,
    hasta: string
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get(`${this.baseUrl}/proveedores/pdf`, { params, responseType: 'blob' });
  }

  /**
   * Descargar Excel Proveedores
   */
  getProveedoresExcel(
    desde: string,
    hasta: string
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get(`${this.baseUrl}/proveedores/excel`, { params, responseType: 'blob' });
  }
}