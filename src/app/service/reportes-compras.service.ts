// src/app/service/reportes-compras.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface ProductoReporte {
  productoNombre: string;
  cantidadComprada: number;
  totalGastado: number;
}

export interface ProveedorReporte {
  proveedorNombre: string;
  cantidadFacturas: number;
  totalGastado: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesComprasService {
  // Asegúrate de usar la URL correcta de tu backend:
  private readonly baseUrl = 'http://localhost:8080/cerro-verde/reportes';

  constructor(private http: HttpClient) { }


  getProductosMasComprados(desde: string, hasta: string): Observable<ProductoReporte[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<ProductoReporte[]>(`${this.baseUrl}/productos`, { params });
  }

  /**
   * Llama a GET /cerro-verde/reportes/proveedores?desde=...&hasta=...
   * Devuelve un arreglo de ProveedorReporte en JSON
   */
  getProveedoresMasComprados(desde: string, hasta: string): Observable<ProveedorReporte[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<ProveedorReporte[]>(`${this.baseUrl}/proveedores`, { params });
  }

  getProductosPdf(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get(`${this.baseUrl}/productos/pdf`, {
      params,
      responseType: 'blob' // Muy importante para recibir binario
    });
  }


  getProductosExcel(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get(`${this.baseUrl}/productos/excel`, {
      params,
      responseType: 'blob'
    });
  }

  getProveedoresPdf(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get(`${this.baseUrl}/proveedores/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Llama a GET /cerro-verde/reportes/proveedores/excel?desde=...&hasta=...
   * Devuelve un Observable<Blob> con el Excel (.xlsx) de Proveedores
   */
  getProveedoresExcel(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get(`${this.baseUrl}/proveedores/excel`, {
      params,
      responseType: 'blob'
    });
  }
}
