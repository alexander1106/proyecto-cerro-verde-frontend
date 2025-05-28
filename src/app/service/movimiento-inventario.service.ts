import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MovimientoInventarioService {

  constructor(private http:HttpClient){}
  listarMovimientosInventario(){
    return this.http.get<any[]>("http://localhost:8080/cerro-verde/movimientosinventario")
  }
}