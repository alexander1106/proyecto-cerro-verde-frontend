import { Component, OnInit } from '@angular/core';
import { CajaService } from '../../../service/caja.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

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
  observaciones: string = '';
  modoActualizar: boolean = false;

  constructor(private cajaService: CajaService, private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const cajaId = this.route.snapshot.paramMap.get('id');
  
    if (cajaId) {
      this.verificarArqueoPorCajaId(+cajaId); // arqueo específico
    } else {
      this.verificarArqueoExistente(); // arqueo actual
    }
  }

  verificarArqueoExistente() {
    this.cajaService.verificarExistenciaArqueo().subscribe({
      next: (res: any) => {
        if (res && res.id) {
          this.modoActualizar = true;
          this.arqueoGuardado = res;
  
          const arqueoDetalles = res.detalles;
  
          this.cajaService.obtenerDenominaciones().subscribe((todas: any[]) => {
            this.denominaciones = todas.map((denom: any) => {
              const encontrado = arqueoDetalles.find((d: any) => d.denominacion.valor === denom.valor);
              return {
                ...denom,
                cantidad: encontrado ? encontrado.cantidad : 0
              };
            });
          });
  
          this.observaciones = res.observaciones;
        }
      },
      error: err => {
        if (err.status === 404) {
          this.modoActualizar = false;
          this.cargarDenominaciones();
        } else {
          console.error("Error verificando arqueo existente:", err);
        }
      }
    });
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
    const total = this.calcularTotal();
  
    Swal.fire({
      title: '¿Estás seguro que quieres guardar el arqueo?',
      html: `<p>Total del arqueo: <strong>S/. ${total.toFixed(2)}</strong></p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
    }).then((result) => {
      if (result.isConfirmed) {
        const detalles = this.denominaciones
          .filter(d => d.cantidad > 0)
          .map(d => ({
            denominacion: d,
            cantidad: d.cantidad
          }));
  
        const arqueoData = {
          id: this.arqueoGuardado?.id,
          observaciones: this.observaciones,
          detalles: detalles
        };
  
        if (this.modoActualizar && this.arqueoGuardado?.id) {
          this.cajaService.actualizarArqueo(this.arqueoGuardado.id, arqueoData).subscribe(res => {
            this.arqueoGuardado = res;
            Swal.fire('¡Actualizado!', 'El arqueo fue actualizado correctamente.', 'success').then(() => {
              this.router.navigate(['/admin/detalle-caja']);
            });            
          });
        } else {
          this.cajaService.crearArqueo(arqueoData).subscribe(res => {
            this.arqueoGuardado = res;
            this.modoActualizar = true;
            Swal.fire('¡Guardado!', 'El arqueo fue guardado correctamente.', 'success').then(() => {
              this.router.navigate(['/admin/detalle-caja']);
            });            
          });
        }
      }
    });
  }  

  validarEntero(event: any) {
    const valor = event.target.value;
    event.target.value = valor.replace(/[^0-9]/g, '');
  }

  calcularSubtotalMonedas(): number {
    return this.denominaciones
      .filter(d => d.valor < 6)
      .reduce((total, d) => total + d.valor * d.cantidad, 0);
  }

  calcularSubtotalBilletes(): number {
    return this.denominaciones
      .filter(d => d.valor >= 10)
      .reduce((total, d) => total + d.valor * d.cantidad, 0);
  }

  verificarArqueoPorCajaId(id: number) {
    this.cajaService.obtenerArqueoPorCajaId(id).subscribe({
      next: (res: any) => {
        this.modoActualizar = false; // Solo lectura si es cerrada
        this.arqueoGuardado = res;
  
        const arqueoDetalles = res.detalles;
  
        this.cajaService.obtenerDenominaciones().subscribe((todas: any[]) => {
          this.denominaciones = todas.map((denom: any) => {
            const encontrado = arqueoDetalles.find((d: any) => d.denominacion.valor === denom.valor);
            return {
              ...denom,
              cantidad: encontrado ? encontrado.cantidad : 0
            };
          });
        });
  
        this.observaciones = res.observaciones;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Arqueo no encontrado',
          text: 'No se pudo cargar el arqueo para esta caja.'
        });
      }
    });
  }
  
}