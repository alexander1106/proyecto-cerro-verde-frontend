import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UnidadService {

  constructor(private http: HttpClient) { }

  listarUnidad(){
    return this.http.get<any[]>("http://localhost:8080/cerro-verde/unidadmedida")
  }

  buscarUnidadId(id: number){
    return this.http.get(`http://localhost:8080/cerro-verde/unidadmedida/${id}`)
  }

  registrarUnidad(Unidad: any) {
    return this.http.post("http://localhost:8080/cerro-verde/unidadmedida", Unidad)
  }

  modificarUnidad(Unidad: any) {
    return this.http.put("http://localhost:8080/cerro-verde/unidadmedida", Unidad)
  }

  eliminarUnidad(id: number) {
    return this.http.delete(`http://localhost:8080/cerro-verde/unidadmedida/${id}`)
  }
}
