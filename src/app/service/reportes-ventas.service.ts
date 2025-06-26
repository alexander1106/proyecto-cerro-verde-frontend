// src/app/services/reportes-ventas.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Interfaces que replican la forma de los DTO del backend. */
export interface ProductoVentasDTO {
  productoNombre: string;
  cantidadVendida: number;
  totalVendido: number;
}

export interface ClienteFrecuenteDTO {
  clienteNombre: string;
  cantidadCompras: number;
  totalGastado: number;
}

export interface HabitacionVentasDTO {
  habitacionNumero: string;
  vecesVendida: number;
  totalRecaudado: number;
}

export interface SalonVentasDTO {
  salonNombre: string;
  vecesAlquilado: number;
  totalRecaudado: number;
}

export interface PagoVentasDTO {
  metodoPago: string;
  vecesUsado: number;
  totalRecibido: number;
}

// Interfaces detalladas con lista de productos
export interface SalonVentasDetalladoDTO {
  salonNombre: string;
  vecesAlquilado: number;
  totalRecaudado: number;
  productos: string;
}

export interface HabitacionVentasDetalladoDTO {
  habitacionNumero: string;
  vecesVendida: number;
  totalRecaudado: number;
  productos: string;
}

export interface PagoVentasDetalladoDTO {
  metodoPago: string;
  vecesUsado: number;
  totalRecibido: number;
  productos: string;
}

// DTO para reservas por mes
export interface ReservasPorMesDTO {
  mes: string;
  cantidad: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesVentasService {
  private readonly baseUrl = 'http://localhost:8080/cerro-verde/reportes/ventas';

  constructor(private http: HttpClient) {}

  // ----- Resumen JSON -----
  getProductosMasVendidos(desde: string, hasta: string): Observable<ProductoVentasDTO[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ProductoVentasDTO[]>(`${this.baseUrl}/productos`, { params });
  }

  getClientesMasFrecuentes(desde: string, hasta: string): Observable<ClienteFrecuenteDTO[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ClienteFrecuenteDTO[]>(`${this.baseUrl}/clientes`, { params });
  }

  getHabitacionesMasVendidas(desde: string, hasta: string): Observable<HabitacionVentasDTO[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<HabitacionVentasDTO[]>(`${this.baseUrl}/habitaciones`, { params });
  }

  getSalonesMasVendidos(desde: string, hasta: string): Observable<SalonVentasDTO[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<SalonVentasDTO[]>(`${this.baseUrl}/salones`, { params });
  }

  getMetodosPagoMasUsados(desde: string, hasta: string): Observable<PagoVentasDTO[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<PagoVentasDTO[]>(`${this.baseUrl}/metodos-pago`, { params });
  }

  // ----- Detallado JSON -----
  getSalonesDetallado(desde: string, hasta: string): Observable<SalonVentasDetalladoDTO[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<SalonVentasDetalladoDTO[]>(`${this.baseUrl}/salones/detallado`, { params });
  }

  getHabitacionesDetallado(desde: string, hasta: string): Observable<HabitacionVentasDetalladoDTO[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<HabitacionVentasDetalladoDTO[]>(`${this.baseUrl}/habitaciones/detallado`, { params });
  }

  getMetodosPagoDetallado(desde: string, hasta: string): Observable<PagoVentasDetalladoDTO[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<PagoVentasDetalladoDTO[]>(`${this.baseUrl}/metodos-pago/detallado`, { params });
  }
  // ----- Reservas por mes JSON -----
  getReservasPorMes(
    tipo: 'habitaciones' | 'salones',
    desde: string,
    hasta: string
  ): Observable<ReservasPorMesDTO[]> {
    const params = new HttpParams()
      .set('tipo', tipo)
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<ReservasPorMesDTO[]>(`${this.baseUrl}/reservas-por-mes`, { params });
  }

  // ----- Descarga PDF Reservas por mes -----
  descargarPdfReservasPorMes(
    tipo: 'habitaciones' | 'salones',
    desde: string,
    hasta: string
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('tipo', tipo)
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/reservas-por-mes/pdf`,
      { params, responseType: 'blob' }
    );
  }

  // ----- Descarga Excel Reservas por mes -----
  descargarExcelReservasPorMes(
    tipo: 'habitaciones' | 'salones',
    desde: string,
    hasta: string
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('tipo', tipo)
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/reservas-por-mes/excel`,
      { params, responseType: 'blob' }
    );
  }

  // ----- Descarga de archivos Resumen -----
  descargarPdfResumen(
    tipo: 'productos' | 'clientes' | 'habitaciones' | 'salones' | 'metodos-pago',
    desde: string,
    hasta: string
  ): Observable<Blob> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/${tipo}/pdf`,
      { params, responseType: 'blob' }
    );
  }

  descargarExcelResumen(
    tipo: 'productos' | 'clientes' | 'habitaciones' | 'salones' | 'metodos-pago',
    desde: string,
    hasta: string
  ): Observable<Blob> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/${tipo}/excel`,
      { params, responseType: 'blob' }
    );
  }

  // ----- Descarga de archivos Detallado -----
  descargarPdfSalonesDetallado(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/salones/detallado/pdf`,
      { params, responseType: 'blob' }
    );
  }

  descargarExcelSalonesDetallado(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/salones/detallado/excel`,
      { params, responseType: 'blob' }
    );
  }

  descargarPdfHabitacionesDetallado(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/habitaciones/detallado/pdf`,
      { params, responseType: 'blob' }
    );
  }

  descargarExcelHabitacionesDetallado(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/habitaciones/detallado/excel`,
      { params, responseType: 'blob' }
    );
  }

  descargarPdfMetodosPagoDetallado(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/metodos-pago/detallado/pdf`,
      { params, responseType: 'blob' }
    );
  }

  descargarExcelMetodosPagoDetallado(desde: string, hasta: string): Observable<Blob> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get(
      `${this.baseUrl}/metodos-pago/detallado/excel`,
      { params, responseType: 'blob' }
    );
  }
}
