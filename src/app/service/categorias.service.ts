import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(private http: HttpClient) { }

  listarCategoria(){
    return this.http.get<any[]>("http://localhost:8080/api/categoriasproductos")
  }

  listarCategoriasActivos(){
    return this.http.get<any[]>("http://localhost:8080/api/categoriasproductosactivos")
  }

  buscarCategoriaId(id: number){
    return this.http.get(`http://localhost:8080/api/categoriasproductos/${id}`)
  }

  registrarCategoria(categoria: any) {
    return this.http.post("http://localhost:8080/api/categoriasproductos", categoria)
  }

  modificarCategoria(categoria: any) {
    return this.http.put("http://localhost:8080/api/categoriasproductos", categoria)
  }

  eliminarCategoria(id: number) {
    return this.http.delete(`http://localhost:8080/api/categoriasproductos/${id}`)
  }
}
