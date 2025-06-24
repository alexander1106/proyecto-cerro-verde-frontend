import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Interface que refleja el DTO de resumen del backend */
export interface CajaResumenDTO {
  tipo: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CajaReporteService {
  private readonly baseUrl = 'http://localhost:8080/cerro-verde/reportes/caja';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el resumen (ingresos vs egresos).
   * @param desde YYYY-MM-DD
   * @param hasta YYYY-MM-DD
   * @param tipos lista de nombres de tipos ('Ingreso','Egreso')
   */
  obtenerResumenCaja(
    desde: string,
    hasta: string,
    tipos: string[]
  ): Observable<CajaResumenDTO[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('tipos', tipos.join(','));
    return this.http.get<CajaResumenDTO[]>(`${this.baseUrl}/resumen`, { params });
  }

  // —— Descarga de archivos PDF/Excel ——

  descargarPdfResumenCaja(
    desde: string,
    hasta: string,
    tipos: string[]
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('tipos', tipos.join(','));
    return this.http.get(
      `${this.baseUrl}/resumen/pdf`,
      { params, responseType: 'blob' }
    );
  }

  descargarExcelResumenCaja(
    desde: string,
    hasta: string,
    tipos: string[]
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('tipos', tipos.join(','));
    return this.http.get(
      `${this.baseUrl}/resumen/excel`,
      { params, responseType: 'blob' }
    );
  }
}
