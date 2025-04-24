import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private baseUrl = '/cerro-verde/caja';
  cajaActual = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  verificarEstadoCaja() {
    return this.http.get(`${this.baseUrl}`, { responseType: 'text' }).pipe(
      tap(res => {
        if (res !== 'no_aperturada') {
          this.cajaActual.set(JSON.parse(res)); // convierte string a objeto
        } else {
          this.cajaActual.set(null);
        }
      })
    );
  }

  aperturarCaja(monto: number) {
    return this.http.post(`${this.baseUrl}/aperturar`, {
      montoApertura: monto
    });
  }

  cerrarCaja(montoCierre: number) {
    return this.http.post(`${this.baseUrl}/cerrar`, montoCierre);
  }

  obtenerCajaAperturada() {
    return this.http.get(`${this.baseUrl}/aperturada`);
  }

  obtenerHistorial() {
    return this.http.get(`${this.baseUrl}/historial`);
  }

  obtenerTransaccionesCajaActual() {
    return this.http.get(`${this.baseUrl}/transacciones`);
  }

  guardarTransaccion(transaccion: any) {
    return this.http.post(`${this.baseUrl}/transacciones/guardar`, transaccion, {
      responseType: 'text',
    });
  }

  obtenerTodasLasTransacciones() {
    return this.http.get<any[]>(`${this.baseUrl}/transacciones/all`);
  }
  
}
