import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  constructor(private http: HttpClient) { }

  listarProveedores(){
    return this.http.get<any[]>("http://localhost:8080/api/proveedores")
  }

  listarProveedoresActivo(){
    return this.http.get<any[]>("http://localhost:8080/api/proveedoresActivos")
  }

  buscarProveedorId(id: string){
    return this.http.get(`http://localhost:8080/api/proveedores/${id}`)
  }

  registrarProveedor(proveedor: any) {
    return this.http.post("http://localhost:8080/api/proveedores", proveedor)
  }

  modificarProveedor(proveedor: any) {
    return this.http.put("http://localhost:8080/api/proveedores", proveedor)
  }

  eliminarProveedor(id: string) {
    return this.http.delete(`http://localhost:8080/api/proveedores/${id}`)
  }

  buscarRuc(numeroRuc: string, headers: HttpHeaders) {
    return this.http.get<any>(`http://localhost:8080/api/ruc/${numeroRuc}`, {headers});
  }
}
