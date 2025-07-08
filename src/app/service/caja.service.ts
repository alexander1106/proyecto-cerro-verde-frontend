import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CajaService {


  private baseUrl = 'http://localhost:8080/cerro-verde/caja';
  cajaActual = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  obtenerTodasLasCajas() {
    return this.http.get<any[]>(`${this.baseUrl}/admin/listar`);
  }

  verificarEstadoCajaRaw() {
    return this.http.get(`${this.baseUrl}`);
  }

  verificarEstadoCaja() {
    return this.http.get(`${this.baseUrl}`, { observe: 'response' });
  }

  aperturarCaja(montoApertura?: number) {
    const body = montoApertura ? { montoApertura } : {};
    return this.http.post(`${this.baseUrl}/aperturar`, body);
  }

  cerrarCaja(montoCierre: number) {
    return this.http.post(`${this.baseUrl}/cerrar`, montoCierre);
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  descargarResumenCaja(idCaja: number): void {
    const url = `http://localhost:8080/cerro-verde/resumencaja/reporte-pdf?idCaja=${idCaja}`;
  
    this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
      const file = new Blob([blob], { type: 'application/pdf' });
  
      // 👉 Generar fecha actual como yyyy-MM-dd_HH-mm
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
  
      const timestamp = `${yyyy}-${mm}-${dd}_${hh}-${mi}`;
  
      // 👇 Nombre dinámico
      const fileName = `cierre_caja_${timestamp}.pdf`;
  
      // 🔽 Descargar archivo
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.download = fileName;
      link.click();
  
      window.URL.revokeObjectURL(link.href);
    }, error => {
      console.error('❌ Error al descargar el resumen de caja:', error);
    });
  }  

  // 🔹 ARQUEO CAJA
  obtenerDenominaciones() {
    return this.http.get<any[]>(`${this.baseUrl}/arqueo/denominaciones`);
  }

  verificarExistenciaArqueo() {
    return this.http.get(`${this.baseUrl}/arqueo`);
  }

  crearArqueo(arqueoData: { detalles: any[], observaciones: string }) {
    return this.http.post(`${this.baseUrl}/arqueo/crear`, arqueoData);
  }

  obtenerArqueoPorId(id: number) {
    return this.http.get(`${this.baseUrl}/arqueo/${id}`);
  }

  actualizarArqueo(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/arqueo/${id}`, data);
  }

  obtenerArqueoPorCajaId(cajaId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/arqueo/caja/${cajaId}`);
  }

  // 🔹 TRANSACCIONES
  guardarTransaccion(transaccion: any) {
    return this.http.post(`${this.baseUrl}/transacciones/guardar`, transaccion, {
      responseType: 'text',
    });
  }

  obtenerTransaccionPorId(id: number) {
    return this.http.get(`${this.baseUrl}/transacciones/${id}`);
  }


  obtenerCajaAperturada() {
    return this.http.get(`${this.baseUrl}/caja/`);
  }


  obtenerTransaccionesCajaActual() {
    return this.http.get(`${this.baseUrl}/transacciones`);
  }

  obtenerTodasLasTransacciones() {
    return this.http.get<any[]>(`${this.baseUrl}/transacciones/all`);
  }

  obtenerTodasTransaccionesPorUsuario() {
    return this.http.get<any[]>(`${this.baseUrl}/transacciones/usuario`);
  }

  obtenerTransaccionesPorCajaId(cajaId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/transacciones/caja/${cajaId}`);
  }




}
