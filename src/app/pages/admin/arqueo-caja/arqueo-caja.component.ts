import { Component, OnInit } from '@angular/core';
import { CajaService } from '../../../service/caja.service';

@Component({
  selector: 'app-arqueo-caja',
  templateUrl: './arqueo-caja.component.html',
  styleUrls: ['./arqueo-caja.component.css'],
  standalone: false
})
export class ArqueoCajaComponent implements OnInit {

  denominaciones: any[] = [];
  detalles: any[] = [];
  arqueoGuardado: any = null;

  constructor(private cajaService: CajaService) {}

  ngOnInit(): void {
    this.cargarDenominaciones();
  }

  cargarDenominaciones() {
    this.cajaService.obtenerDenominaciones().subscribe(data => {
      this.denominaciones = data.map((denom: any) => ({
        ...denom,
        cantidad: 0
      }));
    });
  }

  calcularTotal(): number {
    return this.denominaciones.reduce((total, d) => total + d.valor * d.cantidad, 0);
  }

  guardarArqueo() {
    const detalles = this.denominaciones
      .filter(d => d.cantidad > 0)
      .map(d => ({
        denominacion: d,
        cantidad: d.cantidad
      }));

    this.cajaService.crearArqueo(detalles).subscribe(res => {
      this.arqueoGuardado = res;
      alert('Arqueo guardado correctamente');
    });
  }
}
