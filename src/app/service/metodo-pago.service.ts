import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {

  constructor(private http: HttpClient) { }

  listarMetodosPago(){
    return this.http.get<any[]>("http://localhost:8080/cerro-verde/metodopago")
  }

  listarMetodosPagoActivo(){
    return this.http.get<any[]>("http://localhost:8080/cerro-verde/metodopagoactivo")
  }

  buscarMetodoPagoId(id: number){
    return this.http.get(`http://localhost:8080/cerro-verde/metodopago/${id}`)
  }

  registrarMetodoPago(metodoPago: any) {
    return this.http.post("http://localhost:8080/cerro-verde/metodopago", metodoPago)
  }

  modificarMetodoPago(metodoPago: any) {
    return this.http.put("http://localhost:8080/cerro-verde/metodopago", metodoPago)
  }

  eliminarMetodoPago(id: number) {
    return this.http.delete(`http://localhost:8080/cerro-verde/metodopago/${id}`)
  }

  verificarRelacion(id: number){
    return this.http.get(`http://localhost:8080/cerro-verde/metodopagorelacion/${id}`)
  }
}
