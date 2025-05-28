import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cliente {
  idCliente?: string | number | null;
  dniRuc: string;
  nombre: string;
  telefono: string;
  correo: string;
  pais: string;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = 'http://localhost:8080/cerro-verde';

  constructor(private http: HttpClient) { }

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
  }

  getClientesActivos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientesactivos`);
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clientes/${id}`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/clientes`, cliente);
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/clientes/${id}`, cliente);
  }

  deleteCliente(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/clientes/${id}`);
  }

  buscarDni(numeroDni: string, headers: HttpHeaders) {
    return this.http.get<any>(`${this.apiUrl}/dni/${numeroDni}`, {headers});
  }

  verficarRelacion(id: number) {
    return this.http.get<any>(`${this.apiUrl}/clienterelacion/${id}`)
  }
}