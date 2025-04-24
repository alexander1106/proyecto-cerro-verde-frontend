import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CajaService } from '../../services/caja.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-caja-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './caja-detalle.component.html',
  styleUrls: ['./caja-detalle.component.css']
})
export class CajaDetalleComponent implements OnInit {
  cajaService = inject(CajaService);
  caja: any = null;
  historial: any[] = [];
  montoCierre: number = 0;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.cajaService.obtenerCajaAperturada().subscribe(caja => {
      this.caja = caja;
      this.cajaService.cajaActual.set(caja);
    });
  }

  cerrarCaja() {
    if (this.montoCierre <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }
    
    this.cajaService.cerrarCaja(this.montoCierre).subscribe({
      next: () => {
        this.showSuccessMessage('Caja cerrada correctamente ✅');
        this.caja = null;
        this.cajaService.cajaActual.set(null);
        this.router.navigate(['/apertura']);
      },
      error: err => this.showErrorMessage('Error al cerrar la caja: ' + err.error)
    });
  }
  
  private showSuccessMessage(message: string) {
    const alertPlaceholder = document.createElement('div');
    alertPlaceholder.className = 'position-fixed top-0 end-0 p-3';
    alertPlaceholder.style.zIndex = '5';
    document.body.appendChild(alertPlaceholder);
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
      `<div class="alert alert-success alert-dismissible fade show" role="alert">`,
      `   <i class="bi bi-check-circle-fill me-2"></i>`,
      `   ${message}`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('');
    
    alertPlaceholder.append(wrapper);
    
    setTimeout(() => {
      const alert = wrapper.firstChild as HTMLElement;
      if (alert) {
        alert.classList.remove('show');
        setTimeout(() => alertPlaceholder.remove(), 300);
      }
    }, 3000);
  }
  
  private showErrorMessage(message: string) {
    alert(message);
  }
}