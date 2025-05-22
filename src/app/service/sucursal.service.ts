import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Sucursal {
  id_sucursal?: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private baseUrl = 'http://localhost:8080/cerro-verde';
  
  private sucursalesMock: Sucursal[] = [
    { id_sucursal: 1, nombre: 'Sucursal Central' },
    { id_sucursal: 2, nombre: 'Sucursal Norte' },
    { id_sucursal: 3, nombre: 'Sucursal Sur' }
  ];

  constructor(private http: HttpClient) { }

  getSucursales(): Observable<Sucursal[]> {
    return of(this.sucursalesMock);
  }

  getSucursal(id: number): Observable<Sucursal> {
    const sucursal = this.sucursalesMock.find(s => s.id_sucursal === id);
    return of(sucursal as Sucursal);
  }
}