import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/helper';

@Injectable({
  providedIn: 'root'
})
export class IaService {

  constructor(private http: HttpClient) { }


  public consultarPrecio(precio: any): Observable<any> {
    return this.http.post(`${baseUrl}/consultar-precio`, precio);
  }
}
