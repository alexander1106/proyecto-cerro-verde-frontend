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
