import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private baseUrl = 'http://localhost:8080/cerro-verde';

  constructor(private http: HttpClient) {}

  // ---------- AreasHotel ----------
  getAreasHotel(): Observable<any> {
    return this.http.get(`${this.baseUrl}/areashotel/ver`);
  }

  getAreaHotelById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/areashotel/areashotel/${id}`);
  }

  registrarAreaHotel(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/areashotel/registrar`, data);
  }

  actualizarAreaHotel(id: number, data: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/areashotel/actualizar/${id}`, data);
  }

  eliminarAreaHotel(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/areashotel/eliminar/${id}`);
  }

  // ---------- Incidencias ----------
  getIncidencias(): Observable<any> {
    return this.http.get(`${this.baseUrl}/incidencias/ver`);
  }

  getIncidenciaById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/incidencias/incidencias/${id}`);
  }

  registrarIncidencia(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/incidencias/registrar`, data);
  }

  actualizarIncidencia(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/incidencias/actualizar/${id}`, data);
  }

  eliminarIncidencia(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/incidencias/eliminar/${id}`);
  }

  // ---------- Limpiezas ----------
  getLimpiezas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/limpiezas/ver`);
  }

  getLimpiezaById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/limpiezas/limpiezas/${id}`);
  }

  registrarLimpieza(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/limpiezas/registrar`, data);
  }

  actualizarLimpieza(id: number, data: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/limpiezas/actualizar/${id}`, data);
  }

  eliminarLimpieza(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/limpiezas/eliminar/${id}`);
  }

  // ---------- TipoIncidencia ----------
  getTiposIncidencia(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tipoincidencia/ver`);
  }

  getTipoIncidenciaById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/tipoincidencia/tipoincidencia/${id}`);
  }

  registrarTipoIncidencia(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tipoincidencia/registrar`, data);
  }

  actualizarTipoIncidencia(id: number, data: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/tipoincidencia/actualizar/${id}`, data);
  }

  eliminarTipoIncidencia(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/tipoincidencia/eliminar/${id}`);
  }

    // ---------- Personal Limpieza ----------
    getPersonalLimpieza(): Observable<any> {
      return this.http.get(`${this.baseUrl}/personallimpieza/ver`);
    }
  
    getPersonalLimpiezaById(id: number): Observable<any> {
      return this.http.get(`${this.baseUrl}/personallimpieza/personallimpieza/${id}`);
    }
  
    registrarPersonalLimpieza(data: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/personallimpieza/registrar`, data);
    }
  
    actualizarPersonalLimpieza(id: number, data: any): Observable<any> {
      return this.http.get(`${this.baseUrl}/personallimpieza/actualizar/${id}`, data);
    }
  
    eliminarPersonalLimpieza(id: number): Observable<any> {
      return this.http.get(`${this.baseUrl}/personallimpieza/eliminar/${id}`);
    }
}
