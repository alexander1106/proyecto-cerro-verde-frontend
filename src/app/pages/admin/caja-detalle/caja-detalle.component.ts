import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CajaService } from '../../../service/caja.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-caja-detalle',
  templateUrl: './caja-detalle.component.html',
  standalone: false,

  styleUrls: ['./caja-detalle.component.css']
})
export class CajaDetalleComponent implements OnInit {
  cajaService = inject(CajaService);
  caja: any = null;
  historial: any[] = [];
  montoCierre: number = 0;
  readOnly: boolean = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Modo solo lectura para caja cerrada
      this.cajaService.obtenerPorId(+id).subscribe(caja => {
        this.caja = caja;
        this.readOnly = true; // flag
      });
    } else {
      // Caja actual en uso
      this.cajaService.obtenerCajaAperturada().subscribe(caja => {
        this.caja = caja;
        this.cajaService.cajaActual.set(caja);
        this.readOnly = false;
      });
    }
  }

  cerrarCaja() {
    if (!this.caja) return;

    // Paso 1: Verificar si existe arqueo
    this.cajaService.verificarExistenciaArqueo().subscribe({
      next: (res: any) => {
        // Si hay arqueo, continuar con cierre normal
        this.confirmarCierreCaja();
      },
      error: err => {
        if (err.status === 404) {
          // No hay arqueo: mostrar SweetAlert personalizado
          Swal.fire({
            title: 'Por favor realice el arqueo antes de cerrar la caja',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ir al Arqueo',
            cancelButtonText: 'Cancelar'
          }).then(result => {
            if (result.isConfirmed) {
              this.router.navigate(['/admin/arqueo-caja']);
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al verificar arqueo',
            text: 'Ocurrió un error inesperado al verificar el arqueo.'
          });
        }
      }
    });
  }

  private confirmarCierreCaja() {
    Swal.fire({
      title: '¿Estás seguro de cerrar la caja?',
      text: `Saldo actual: S/. ${this.caja.saldo.toFixed(2)}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.cajaService.cerrarCaja(0).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Caja cerrada correctamente ✅',
              showConfirmButton: false,
              timer: 1500
            });

            this.caja = null;
            this.cajaService.cajaActual.set(null);
            this.router.navigate(['/admin/caja']);
          },
          error: err => {
            Swal.fire({
              icon: 'error',
              title: 'Error al cerrar la caja',
              text: err.error || 'Ocurrió un error inesperado.'
            });
          }
        });
      }
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
