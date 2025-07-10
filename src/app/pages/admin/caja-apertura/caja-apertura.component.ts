import { VentasService } from './../../../service/ventas.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CajaService } from '../../../service/caja.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-caja-apertura',
  templateUrl: './caja-apertura.component.html',
  styleUrls: ['./caja-apertura.component.css'],
  standalone: false
})
export class CajaAperturaComponent implements OnInit {
  monto: number = 0;
  cajaAperturada: any = null;
  transacciones: any[] = [];
  nuevaTransaccion = {
    montoTransaccion: null,
    tipo: { id: 1 }, // 1: ingreso, 2: egreso
    motivo: '',
    ventaDevueltaId: null
  };

  ventasCanceladas: any[] = [];

  resumenMetodoPago = {
    efectivo: 0,
    yape: 0,
    plin: 0,
    tarjeta: 0
  };
  
  motivosIngreso = [
    'Pago recibido',
    'Transferencia entrante',
    'Otros'
  ];
  
  motivosEgreso = [
    'Pago de servicios',
    'Devolución',
    'Compra de insumos',
    'Transferencia bancaria',
    'Otros'
  ];

  mostrarModalApertura = false;
  tabActivo: 'transacciones' | 'arqueo' = 'transacciones';
  arqueo: any[] = [];
  requiereMontoInicial = false;
  mostrarModalArqueo = false;
  mostrarModalDetalleArqueo = false;
  arqueoSeleccionadoId: number | null = null;
  usarMontoAnterior: boolean = false; // por defecto SÍ usa saldo anterior
  mostrarModalTransaccion = false;
  paginaActual: number = 1;
  tamanioPagina: number = 10;
  filtroTipo: number | null = null;
  filtroFechaDesde: string | null = null;
  filtroFechaHasta: string | null = null;
  filtroArqueoDesde: string | null = null;
  filtroArqueoHasta: string | null = null;
  paginaArqueoActual: number = 1;
  tamanioPaginaArqueo: number = 3;
  ordenTransaccionesDesc: boolean = true;
  ordenArqueosDesc: boolean = true;
  get transaccionesFiltradas() {
    const filtradas = this.transacciones
      .filter(t => {
        const coincideTipo = this.filtroTipo ? t.tipo.id === this.filtroTipo : true;
        const fecha = new Date(t.fechaHoraTransaccion);
        const desde = this.filtroFechaDesde ? new Date(this.filtroFechaDesde) : null;
        const hasta = this.filtroFechaHasta ? new Date(this.filtroFechaHasta) : null;
  
        const enRango = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
        return coincideTipo && enRango;
      });
  
    return filtradas.sort((a, b) => {
      const diff = new Date(b.fechaHoraTransaccion).getTime() - new Date(a.fechaHoraTransaccion).getTime();
      return this.ordenTransaccionesDesc ? diff : -diff;
    });
  } 
  get totalPaginas(): number {
    return Math.ceil(this.transaccionesFiltradas.length / this.tamanioPagina);
  }
  get transaccionesPaginadas() {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    return this.transaccionesFiltradas.slice(inicio, fin);
  }
  get arqueosFiltrados() {
    const filtrados = this.arqueo
      .filter(a => {
        const fecha = new Date(a.fechaArqueo);
        const desde = this.filtroArqueoDesde ? new Date(this.filtroArqueoDesde) : null;
        const hasta = this.filtroArqueoHasta ? new Date(this.filtroArqueoHasta) : null;
  
        const enRango = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
        return enRango;
      });
  
    return filtrados.sort((a, b) => {
      const diff = new Date(b.fechaArqueo).getTime() - new Date(a.fechaArqueo).getTime();
      return this.ordenArqueosDesc ? diff : -diff;
    });
  }
  get totalPaginasArqueo(): number {
    return Math.ceil(this.arqueosFiltrados.length / this.tamanioPaginaArqueo);
  }
  get arqueosPaginados() {
    const inicio = (this.paginaArqueoActual - 1) * this.tamanioPaginaArqueo;
    return this.arqueosFiltrados.slice(inicio, inicio + this.tamanioPaginaArqueo);
  }
  get transaccionesDeHoy() {
    const hoy = new Date();
    return this.transacciones.filter(t => {
      const fecha = new Date(t.fechaHoraTransaccion);
      return fecha.toDateString() === hoy.toDateString();
    });
  }
  get totalVentasNoEfectivo(): number {
    return this.transaccionesDeHoy
      .filter(t => 
        t.tipo.id === 1 &&
        t.id_venta != null &&
        t.metodoPago?.nombre?.toLowerCase() !== 'efectivo'
      )
      .reduce((sum, t) => sum + t.montoTransaccion, 0);
  }
  get motivosDisponibles(): string[] {
  if (this.nuevaTransaccion.tipo?.id === 1) {
    return this.motivosIngreso;
  } else if (this.nuevaTransaccion.tipo?.id === 2) {
    return this.motivosEgreso;
  }
  return [];
}
  get totalVentasHoy(): number {
    return this.transaccionesDeHoy
      .filter(t => t.tipo.id === 1)
      .reduce((sum, t) => sum + t.montoTransaccion, 0);
  }
  
  get totalEgresosHoy(): number {
    return this.transaccionesDeHoy
      .filter(t => t.tipo.id === 2)
      .reduce((sum, t) => sum + t.montoTransaccion, 0);
  }
  
  get totalEnEfectivo(): number {
    return this.transaccionesDeHoy
      .filter(t => t.metodoPago?.nombre?.toLowerCase() === 'efectivo')
      .reduce((sum, t) => sum + t.montoTransaccion, 0);
  }
  
  get cantidadTransaccionesHoy(): number {
    return this.transaccionesDeHoy.length;
  }
  get totalVentasYape(): number {
    return this.transaccionesDeHoy
      .filter(t => t.tipo.id === 1 && t.id_venta != null && t.metodoPago?.id_metodo_pago === 1)
      .reduce((sum, t) => sum + t.montoTransaccion, 0);
  }
  
  get totalVentasPlin(): number {
    return this.transaccionesDeHoy
      .filter(t => t.tipo.id === 1 && t.id_venta != null && t.metodoPago?.id_metodo_pago === 12)
      .reduce((sum, t) => sum + t.montoTransaccion, 0);
  }
  
  get totalVentasTarjeta(): number {
    return this.transaccionesDeHoy
      .filter(t => t.tipo.id === 1 && t.id_venta != null && t.metodoPago?.id_metodo_pago === 13)
      .reduce((sum, t) => sum + t.montoTransaccion, 0);
  }
  
  get totalVentasEfectivo(): number {
    return this.transaccionesDeHoy
      .filter(t => t.tipo.id === 1 && t.id_venta != null && t.metodoPago?.id_metodo_pago === 16)
      .reduce((sum, t) => sum + t.montoTransaccion, 0);
  }
  
  constructor(private cajaService: CajaService, private ventasService: VentasService, private router: Router) {}

  ngOnInit() {
    this.verificarEstadoCaja();   
  }

  limpiarFiltros() {
    this.filtroTipo = null;
    this.filtroFechaDesde = null;
    this.filtroFechaHasta = null;
    this.paginaActual = 1;
  }
  
  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }
  
  limpiarFiltrosArqueo() {
    this.filtroArqueoDesde = null;
    this.filtroArqueoHasta = null;
    this.paginaArqueoActual = 1;
  }
  
  cambiarPaginaArqueo(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginasArqueo) {
      this.paginaArqueoActual = nuevaPagina;
    }
  }  

  abrirModalArqueo() {
    this.mostrarModalArqueo = true;
  }

  abrirDetalleArqueo(id: number) {
    this.arqueoSeleccionadoId = id;
    this.mostrarModalDetalleArqueo = true;
  }

  cargarVentasCanceladas() {
    this.ventasService.listarVenta().subscribe({
      next: (ventas: any[]) => {
        this.ventasCanceladas = ventas.filter(
          v => v.estadoVenta?.toLowerCase() === 'cancelado'
        );
      },
      error: () => {
        console.error('No se pudieron cargar las ventas canceladas');
      }
    });
  }  

  onMotivoChange() {
    if (this.nuevaTransaccion.motivo === 'Devolución') {
      this.cargarVentasCanceladas();
    } else {
      this.nuevaTransaccion.ventaDevueltaId = null;
    }    
  }  
  
  verificarEstadoCaja() {
    this.cajaService.verificarEstadoCaja().subscribe({
      next: response => {
        if (response.status === 204 || !response.body) {
          this.requiereMontoInicial = true;
          this.cajaAperturada = null;
        } else {
          this.requiereMontoInicial = false;
          this.cajaAperturada = response.body;
  
          this.cargarTransacciones();
          this.cargarArqueo();
  
          // ✅ LLAMA AQUÍ el resumen de métodos de pago
          this.cajaService.obtenerResumenPorMetodoPago(this.cajaAperturada.id).subscribe(resumen => {
            this.resumenMetodoPago = resumen;
          });
        }
      },
      error: (error: any) => {
        this.cajaAperturada = null;
        console.log(error);
      }
    });
  }
  

  aperturarDesdeModal() {
    const usarNuevoMonto = this.requiereMontoInicial || !this.usarMontoAnterior;
  
    if (usarNuevoMonto && (!this.monto || this.monto <= 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'Por favor ingrese un monto mayor a cero',
      });
      return;
    }
  
    Swal.fire({
      title: '¿Aperturar caja?',
      text: usarNuevoMonto
        ? `Se usará el monto ingresado: S/. ${this.monto.toFixed(2)}`
        : 'Se reutilizará el saldo anterior automáticamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aperturar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        const payload = usarNuevoMonto ? this.monto : undefined;
  
        this.cajaService.aperturarCaja(payload).subscribe({
          next: () => {
            this.mostrarModalApertura = false;
            this.monto = 0;
            Swal.fire({
              icon: 'success',
              title: 'Caja aperturada correctamente',
              showConfirmButton: false,
              timer: 1500
            });
            this.verificarEstadoCaja();
          },
          error: err => {
            Swal.fire({
              icon: 'error',
              title: 'Error al aperturar',
              text: err.error || 'Ocurrió un error inesperado.'
            });
          }
        });
      }
    });
  }
  

  cargarTransacciones() {
    this.cajaService.obtenerTransaccionesCajaActual().subscribe(data => {
      this.transacciones = Array.isArray(data) ? data : [];
    });
  }

  guardarTransaccion() {
    const monto = this.nuevaTransaccion.montoTransaccion;
  
    if (!monto || monto <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'El monto debe ser mayor a cero.',
      });
      return;
    }
  
    if (!this.nuevaTransaccion.tipo?.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Tipo requerido',
        text: 'Seleccione un tipo de transacción.',
      });
      return;
    }
  
    if (!this.nuevaTransaccion.motivo || this.nuevaTransaccion.motivo.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Seleccione un motivo para la transacción.',
      });
      return;
    }
  
    if (this.nuevaTransaccion.motivo === 'Devolución' && !this.nuevaTransaccion.ventaDevueltaId) {
      Swal.fire({
        icon: 'warning',
        title: 'Venta requerida',
        text: 'Seleccione una venta asociada a la devolución.',
      });
      return;
    }    
  
    this.cajaService.guardarTransaccion(this.nuevaTransaccion).subscribe({
      next: () => {
        this.nuevaTransaccion = {
          montoTransaccion: null,
          tipo: { id: 1 },
          motivo: '',
          ventaDevueltaId: null
        };
        this.cargarTransacciones();
        this.verificarEstadoCaja();
  
        Swal.fire({
          icon: 'success',
          title: 'Transacción guardada',
          text: 'La transacción se ha registrado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar la transacción', 'error');
      }
    });
  }
    

  cargarArqueo() {
    this.cajaService.verificarExistenciaArqueo().subscribe({
      next: (res: any) => this.arqueo = res,
      error: () => this.arqueo = []
    });
  }

  cerrarCaja() {
    this.cajaService.verificarExistenciaArqueo().subscribe({
      next: () => {
        Swal.fire({
          title: '¿Cerrar caja?',
          text: `Saldo actual: S/. ${this.cajaAperturada.saldoFisico.toFixed(2)}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, realizar Arqueo',
          cancelButtonText: 'Cancelar'
        }).then(result => {
          if (result.isConfirmed) {
            this.abrirModalArqueo(); // 👈 Abrimos el modal de arqueo
          }
        });
      },
      error: err => {
        if (err.status === 404) {
          Swal.fire({
            title: 'Realice un arqueo antes de cerrar la caja',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ir al Arqueo',
            cancelButtonText: 'Cancelar'
          }).then(result => {
            if (result.isConfirmed) this.tabActivo = 'arqueo';
          });
        }
      }
    });
  }

  descargarResumenYActualizarCaja() {
    this.verificarEstadoCaja(); // recarga estado y transacciones
  
    // Espera un poquito a que cajaAperturada se actualice (por si acaso es asíncrono)
    setTimeout(() => {
      if (this.cajaAperturada?.id) {
        this.cajaService.descargarResumenCaja(this.cajaAperturada.id);
      } else {
        console.warn('No se pudo descargar el resumen: cajaAperturada no encontrada');
      }
    }, 1000); // puedes ajustar el tiempo si lo necesitas más o menos
  }
  
  descargarManualResumenCaja() {
    if (!this.cajaAperturada?.id) {
      console.warn('No hay caja aperturada para descargar resumen');
      return;
    }
  
    this.cajaService.descargarResumenCaja(this.cajaAperturada.id);
  }  
  
}
