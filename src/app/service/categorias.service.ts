import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(private http: HttpClient) { }

  listarCategoria(){
    return this.http.get<any[]>("http://localhost:8080/cerro-verde/categoriasproductos")
  }

  buscarCategoriaId(id: number){
    return this.http.get(`http://localhost:8080/cerro-verde/categoriasproductos/${id}`)
  }

  registrarCategoria(categoria: any) {
    return this.http.post("http://localhost:8080/cerro-verde/categoriasproductos", categoria)
  }

  modificarCategoria(categoria: any) {
    return this.http.put("http://localhost:8080/cerro-verde/categoriasproductos", categoria)
  }

  eliminarCategoria(id: number) {
    return this.http.delete(`http://localhost:8080/cerro-verde/categoriasproductos/${id}`)
  }
}
