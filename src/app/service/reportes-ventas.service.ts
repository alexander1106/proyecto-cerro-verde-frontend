// src/app/services/reportes-ventas.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interfaces que replican exactamente la forma de los DTO del backend.
 * 
 * ProductoVentasDTO  => JSON: { productoNombre, cantidadVendida, totalVendido }
 * ClienteFrecuenteDTO => JSON: { clienteNombre, cantidadCompras, totalGastado }
 * HabitacionVentasDTO => JSON: { habitacionNumero, vecesVendida, totalRecaudado }
 * SalonVentasDTO      => JSON: { salonNombre, vecesAlquilado, totalRecaudado }
 * PagoVentasDTO       => JSON: { metodoPago, vecesUsado, totalRecibido }
 */

export interface ProductoVentasDTO {
  productoNombre: string;
  cantidadVendida: number;  // mapea BigInteger → number en TS
  totalVendido: number;     // mapea BigDecimal → number en TS
}

export interface SalonVentasDTO {
  salonNombre: string;
  vecesAlquilado: number;   // BigInteger → number
  totalRecaudado: number;   // BigDecimal → number
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

export interface PagoVentasDTO {
  metodoPago: string;
  vecesUsado: number;
  totalRecibido: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesVentasService {

  // La URL base coincide con el @RequestMapping del controlador:
  // http://localhost:8080/cerro-verde/reportes/ventas
  private readonly baseUrl = 'http://localhost:8080/cerro-verde/reportes/ventas';

  constructor(private http: HttpClient) { }

  getProductosMasVendidos(desde: string, hasta: string): Observable<ProductoVentasDTO[]> {
  const params = new HttpParams().set('desde', desde).set('hasta', hasta);
  return this.http.get<ProductoVentasDTO[]>(`${this.baseUrl}/productos`, { params });
  }

  getClientesMasFrecuentes(desde: string, hasta: string): Observable<ClienteFrecuenteDTO[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<ClienteFrecuenteDTO[]>(`${this.baseUrl}/clientes`, { params });
  }

  getHabitacionesMasVendidas(desde: string, hasta: string): Observable<HabitacionVentasDTO[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<HabitacionVentasDTO[]>(`${this.baseUrl}/habitaciones`, { params });
  }

  getSalonesMasVendidos(desde: string, hasta: string): Observable<SalonVentasDTO[]> {
  const params = new HttpParams().set('desde', desde).set('hasta', hasta);
  return this.http.get<SalonVentasDTO[]>(`${this.baseUrl}/salones`, { params });
  }


  getMetodosPagoMasUsados(desde: string, hasta: string): Observable<PagoVentasDTO[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<PagoVentasDTO[]>(`${this.baseUrl}/metodos-pago`, { params });
  }


  /** ------------- MÉTODOS PARA DESCARGA DE ARCHIVOS ------------- */

  /**
   * GET /cerro-verde/reportes/ventas/{tipo}/pdf?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
   * @param tipo "productos", "clientes", "habitaciones", "salones" o "metodos-pago"
   * Devuelve un Blob que contiene el PDF generado por el backend.
   */
  descargarPdf(tipo: 'productos' | 'clientes' | 'habitaciones' | 'salones' | 'metodos-pago',
              desde: string,
              hasta: string): Observable<Blob> {

    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get(
      `${this.baseUrl}/${tipo}/pdf`,
      { params, responseType: 'blob' }
    );
  }

  /**
   * GET /cerro-verde/reportes/ventas/{tipo}/excel?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
   * @param tipo "productos", "clientes", "habitaciones", "salones" o "metodos-pago"
   * Devuelve un Blob que contiene el Excel (.xlsx) generado por el backend.
   */
  descargarExcel(tipo: 'productos' | 'clientes' | 'habitaciones' | 'salones' | 'metodos-pago',
                 desde: string,
                 hasta: string): Observable<Blob> {

    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get(
      `${this.baseUrl}/${tipo}/excel`,
      { params, responseType: 'blob' }
    );
  }
}
