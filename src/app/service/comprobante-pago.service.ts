import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ComprobantePagoService {
  constructor(private http: HttpClient) {}

  numeroCorrelativo(comprobante: string) {
    return this.http.get<{ correlativo: string }>(
      'http://localhost:8080/cerro-verde/venta/siguientecorrelativo',
      { params: { tipo: comprobante } }
    );
  }
}
