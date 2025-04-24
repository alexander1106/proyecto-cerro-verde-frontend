import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CajaService } from './services/caja.service';

@Component({
  standalone: true,
  template: `<p>Verificando caja...</p>`
})
export class InitComponent {
  constructor(private router: Router, private cajaService: CajaService) {
    this.cajaService.verificarEstadoCaja().subscribe(() => {
      const caja = this.cajaService.cajaActual();
      if (caja) {
        this.router.navigate(['/detalle']);
      } else {
        this.router.navigate(['/apertura']);
      }
    });
  }
}