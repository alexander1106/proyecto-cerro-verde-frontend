import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UnidadService {

  constructor(private http: HttpClient) { }

  listarUnidad(){
    return this.http.get<any[]>("http://localhost:8080/api/unidadmedida")
  }

  listarUnidadActivos(){
    return this.http.get<any[]>("http://localhost:8080/api/unidadmedidaactivo")
  }

  buscarUnidadId(id: number){
    return this.http.get(`http://localhost:8080/api/unidadmedida/${id}`)
  }

  registrarUnidad(Unidad: any) {
    return this.http.post("http://localhost:8080/api/unidadmedida", Unidad)
  }

  modificarUnidad(Unidad: any) {
    return this.http.put("http://localhost:8080/api/unidadmedida", Unidad)
  }

  eliminarUnidad(id: number) {
    return this.http.delete(`http://localhost:8080/api/unidadmedida/${id}`)
  }
}
