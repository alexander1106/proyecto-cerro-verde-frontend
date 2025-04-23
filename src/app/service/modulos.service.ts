import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/helper';

@Injectable({
  providedIn: 'root'
})
export class ModulosService {


  constructor(private http: HttpClient) { }

  // Listar todos los módulos
  public listarModulos(): Observable<any> {
    return this.http.get(`${baseUrl}/modulos/`);
  }

  // Obtener un módulo por ID
  public obtenerModuloPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/modulos/${id}`);
  }

  // Crear un nuevo módulo
  public agregarModulo(modulo: any): Observable<any> {
    return this.http.post(`${baseUrl}/modulos/`, modulo);
  }

  // Editar un módulo existente
  public editarModulo(id: number, modulo: any): Observable<any> {
    return this.http.put(`${baseUrl}/modulos/${id}`, modulo);
  }

  // Eliminar un módulo por ID
  public eliminarModulo(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/modulos/${id}`);
  }

    // Obtener submódulos por ID de módulo
    public obtenerSubmodulosPorModulo(idModulo: number): Observable<any> {
      return this.http.get(`${baseUrl}/submodulos/modulos/${idModulo}`);
    }

    // (Opcional) Obtener todos los submódulos
    public obtenerTodos(): Observable<any> {
      return this.http.get(`${baseUrl}/submodulos/`);
    }

}
