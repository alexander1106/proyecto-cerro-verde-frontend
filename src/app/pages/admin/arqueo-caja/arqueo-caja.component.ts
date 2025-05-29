import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CajaService } from '../../../service/caja.service';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-arqueo-caja',
  templateUrl: './arqueo-caja.component.html',
  styleUrls: ['./arqueo-caja.component.css'],
  standalone: false
})
export class ArqueoCajaComponent implements OnInit, OnChanges {

  @Input() modoModal: boolean = false;
  @Input() soloLectura: boolean = false;
  @Input() idArqueo: number | null = null;
  @Output() onCerrarModal: EventEmitter<void> = new EventEmitter<void>();
  @Output() onCajaCerrada = new EventEmitter<void>();


  denominaciones: any[] = [];
  detalles: any[] = [];
  arqueoGuardado: any = null;
  observaciones: string = '';
  modoActualizar: boolean = false;

  constructor(
    private cajaService: CajaService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Si es usado por ruta (no modal), se carga por caja o se verifica actual
    if (!this.modoModal) {
      const cajaId = this.route.snapshot.paramMap.get('id');
      if (cajaId) {
        this.verificarArqueoPorCajaId(+cajaId);
      } else {
        this.verificarArqueoExistente();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detecta cambio en el idArqueo pasado desde el modal
    if (changes['idArqueo'] && this.idArqueo && this.modoModal) {
      this.verificarArqueoPorId(this.idArqueo);
    }
  }

  verificarArqueoPorId(id: number) {
    this.cajaService.obtenerArqueoPorId(id).subscribe({
      next: (res: any) => {
        this.arqueoGuardado = res;
        this.observaciones = res.observaciones || '';

        this.cajaService.obtenerDenominaciones().subscribe((todas: any[]) => {
          this.denominaciones = todas.map((denom: any) => {
            const encontrado = res.detalles?.find((d: any) => d.denominacion.id === denom.id);
            return {
              ...denom,
              cantidad: encontrado ? encontrado.cantidad : 0
            };
          });
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el arqueo', 'error');
      }
    });
  }

  verificarArqueoExistente() {
    this.cajaService.obtenerDenominaciones().subscribe((todas: any[]) => {
      this.denominaciones = todas.map((denom: any) => ({
        ...denom,
        cantidad: 0
      }));

      this.cajaService.verificarExistenciaArqueo().subscribe({
        next: (res: any) => {
          if (res && res.id) {
            this.modoActualizar = true;
            this.arqueoGuardado = res;
            this.observaciones = res.observaciones || '';

            const arqueoDetalles = res.detalles || [];

            this.denominaciones.forEach(d => {
              const encontrado = arqueoDetalles.find((det: any) => det.denominacion.id === d.id);
              if (encontrado) d.cantidad = encontrado.cantidad;
            });
          }
        },
        error: err => {
          if (err.status === 404) {
            this.modoActualizar = false;
            // Ya se cargaron las denominaciones con 0
          } else {
            console.error("Error verificando arqueo existente:", err);
          }
        }
      });
    });
  }

  verificarArqueoPorCajaId(id: number) {
    this.cajaService.obtenerArqueoPorCajaId(id).subscribe({
      next: (res: any) => {
        this.arqueoGuardado = res;
        this.observaciones = res.observaciones;

        const arqueoDetalles = res.detalles || [];

        this.cajaService.obtenerDenominaciones().subscribe((todas: any[]) => {
          this.denominaciones = todas.map((denom: any) => {
            const encontrado = arqueoDetalles.find((d: any) => d.denominacion.id === denom.id);
            return {
              ...denom,
              cantidad: encontrado ? encontrado.cantidad : 0
            };
          });
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el arqueo para esta caja.', 'error');
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

  guardarArqueo() {
    const total = this.calcularTotal();
  
    // Paso 1: Obtener el saldo físico actual desde el backend
    this.cajaService.verificarEstadoCaja().subscribe({
      next: (res: any) => {
        const saldoFisico = res?.body?.saldoFisico;
  
        // Paso 2: Validar si coincide con el arqueo
        if (saldoFisico == null || total.toFixed(2) !== saldoFisico.toFixed(2)) {
          Swal.fire({
            icon: 'error',
            title: 'Inconsistencia detectada',
            html: `
              <p><strong>El total del arqueo (S/. ${total.toFixed(2)}) no coincide con el saldo físico de la caja (S/. ${saldoFisico?.toFixed(2)}).</strong></p>
              <p>Por favor, revisa los montos ingresados.</p>
            `,
            confirmButtonColor: '#dc3545'
          });
          return;
        }
  
        // Paso 3: Confirmar guardar si todo coincide
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
              observaciones: this.observaciones,
              detalles: detalles
            };
  
            const finalizar = () => {
              this.cajaService.cerrarCaja(total).subscribe({
                next: () => {
                  Swal.fire('Arqueo guardado', 'La caja fue cerrada correctamente.', 'success');
                  this.onCajaCerrada.emit();
                  this.onCerrarModal.emit();
                },
                error: () => {
                  Swal.fire('⚠️ Caja NO se cerró', 'Ocurrió un error al cerrar la caja.', 'error');
                }
              });
            };
  
            if (this.modoActualizar && this.arqueoGuardado?.id) {
              this.cajaService.actualizarArqueo(this.arqueoGuardado.id, arqueoData).subscribe(res => {
                this.arqueoGuardado = res;
                this.modoActualizar = true;
                finalizar();
              });
            } else {
              this.cajaService.crearArqueo(arqueoData).subscribe(res => {
                this.arqueoGuardado = res;
                this.modoActualizar = true;
                finalizar();
              });
            }
          }
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo validar el saldo de la caja.', 'error');
      }
    });
  }
  
  

  validarEntero(event: any) {
    const valor = event.target.value;
    event.target.value = valor.replace(/[^0-9]/g, '');
  }
}
