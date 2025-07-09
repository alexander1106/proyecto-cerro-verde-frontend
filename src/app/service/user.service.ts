import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from '../components/helper';

@Injectable({
  providedIn: 'root'
})
export class UserService {



  constructor(private httpClient: HttpClient) {}

  public añadirUsuario(user: any) {
  return this.httpClient.post(`${baseUrl}/usuarios/`, user);
}
public añadirUsuarioPerfiles(user: any) {
  return this.httpClient.post(`${baseUrl}/usuarios/permisos/`, user);
}
  public listarTrabajadores(){
    return this.httpClient.get(`${baseUrl}/usuarios/`);
  }
  editarUsuario(user: any) {
    return this.httpClient.put(`${baseUrl}/usuarios/${user.idUsuario}`, user);
  }
  public obtenerUsuario(id: any) {
    return this.httpClient.get(`${baseUrl}/usuarios/${id}`);
  }

  cambiarPassword(idUsuario: number, nuevaContraseña: string) {
    const url = `${baseUrl}/usuarios/${idUsuario}/cambiar-password`;
    return this.httpClient.put(url, nuevaContraseña, {
      headers: { 'Content-Type': 'text/plain' },  // Muy importante
      responseType: 'text'
    });
  }



}
