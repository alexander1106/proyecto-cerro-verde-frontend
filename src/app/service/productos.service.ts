import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private http: HttpClient) { }

  listarProductos(){
    return this.http.get<any[]>("http://localhost:8080/api/productos")
  }

  listarProductosActivos(){
    return this.http.get<any[]>("http://localhost:8080/api/productosactivos")
  }

  buscarProductoId(id: number){
    return this.http.get(`http://localhost:8080/api/productos/${id}`)
  }

  registrarProductos(producto: any) {
    return this.http.post("http://localhost:8080/api/productos", producto)
  }

  modificarProductos(producto: any) {
    return this.http.put("http://localhost:8080/api/productos", producto)
  }

  eliminarProducto(id: number) {
    return this.http.delete(`http://localhost:8080/api/productos/${id}`)
  }
}
