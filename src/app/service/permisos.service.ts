import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import baseUrl from '../components/helper';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarPermisos(): Observable<any> {
    return this.http.get(`${baseUrl}/permisos/`);
  }

  // Obtener un permiso por ID
  public obtenerPermisoPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  // Crear un nuevo permiso
  public agregarPermiso(permiso: any): Observable<any> {
    return this.http.post(`${baseUrl}/`, permiso);
  }

  // Editar un permiso existente
  public editarPermiso(permiso: any): Observable<any> {
    return this.http.put(`${baseUrl}/`, permiso);
  }

  // Eliminar un permiso por ID
  public eliminarPermiso(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }
}
