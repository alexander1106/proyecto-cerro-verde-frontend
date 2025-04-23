import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/helper';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarRoles(): Observable<any> {
    return this.http.get(`${baseUrl}/roles/`);
  }

  // Obtener un permiso por ID
  public obtenerRolesPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  // Crear un nuevo permiso
  public agregarRol(rol: any) {
    return this.http.post(`${baseUrl}/roles/`, rol );
  }
 
  public obtenerRol(rolId:any){
    return this.http.get(`${baseUrl}/roles/${rolId}`);
  }

  // Editar un permiso existente
  public actualizarRol(rol:any){
    return this.http.put(`${baseUrl}/roles/`, rol);
  }

  // Eliminar un permiso por ID
  public eliminarRol(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

}
