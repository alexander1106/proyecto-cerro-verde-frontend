import { Component, OnInit } from '@angular/core';
import { CajaService } from '../../../service/caja.service';

@Component({
  selector: 'app-admin-cajas',
  templateUrl: './admin-cajas.component.html',
  styleUrls: ['./admin-cajas.component.css'],
  standalone: false
})
export class AdminCajasComponent implements OnInit {
  filtroArqueoDesdeAdmin: string | null = null;
  filtroArqueoHastaAdmin: string | null = null;
  ordenArqueosDescAdmin: boolean = true;
  mostrarModalArqueos = false;
  arqueosCajaSeleccionada: any[] = [];
  cajaArqueoSeleccionadaId: number | null = null;
  mostrarModalDetalleArqueo: boolean = false;
  arqueoSeleccionadoId: number | null = null;
  cajas: any[] = [];
  loading = false;
  transaccionesCajaSeleccionada: any[] = [];
  mostrarModalTransacciones = false;
  cajaTransaccionSeleccionadaId: number | null = null;
  filtroTipoTrans: number | null = null;
  paginaTransActual: number = 1;
  tamanioPaginaTrans: number = 7;
  ordenAscendente: boolean = true;
  // Filtros
  filtroEstadoCaja: string | null = null;
  filtroUsuario: string = '';

  // Paginación
  paginaCajasActual: number = 1;
  tamanioPaginaCajas: number = 10;

  paginaArqueosActual: number = 1;
  tamanioPaginaArqueos: number = 5;
  
  get arqueosFiltradosAdmin() {
    const desde = this.filtroArqueoDesdeAdmin ? new Date(this.filtroArqueoDesdeAdmin) : null;
    const hasta = this.filtroArqueoHastaAdmin ? new Date(this.filtroArqueoHastaAdmin) : null;
  
    return this.arqueosCajaSeleccionada
      .filter(a => {
        const fecha = new Date(a.fechaArqueo);
        return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fechaArqueo).getTime();
        const fechaB = new Date(b.fechaArqueo).getTime();
        return this.ordenArqueosDescAdmin ? fechaB - fechaA : fechaA - fechaB;
      });
  }
  
  get totalPaginasArqueosAdmin() {
    return Math.ceil(this.arqueosFiltradosAdmin.length / this.tamanioPaginaArqueos);
  }
  
  get arqueosPaginadosAdmin() {
    const inicio = (this.paginaArqueosActual - 1) * this.tamanioPaginaArqueos;
    return this.arqueosFiltradosAdmin.slice(inicio, inicio + this.tamanioPaginaArqueos);
  }
  
  limpiarFiltrosArqueosAdmin() {
    this.filtroArqueoDesdeAdmin = null;
    this.filtroArqueoHastaAdmin = null;
    this.ordenArqueosDescAdmin = true;
    this.paginaArqueosActual = 1;
  }
  
  get cajasFiltradas() {
    return this.cajas.filter(caja => {
      const coincideEstado = this.filtroEstadoCaja ? caja.estadoCaja === this.filtroEstadoCaja : true;
      const coincideUsuario = this.filtroUsuario.trim() !== ''
        ? (caja.usuario?.username || '').toLowerCase().includes(this.filtroUsuario.trim().toLowerCase())
        : true;
      return coincideEstado && coincideUsuario;
    });
  }
  get totalPaginasCajas() {
    return Math.ceil(this.cajasFiltradas.length / this.tamanioPaginaCajas);
  }
  
  get cajasPaginadas() {
    const inicio = (this.paginaCajasActual - 1) * this.tamanioPaginaCajas;
    return this.cajasFiltradas.slice(inicio, inicio + this.tamanioPaginaCajas);
  }
    
  get transaccionesFiltradasAdmin() {
    let transacciones = this.transaccionesCajaSeleccionada;
  
    if (this.filtroTipoTrans !== null) {
      transacciones = transacciones.filter(t => t.tipo.id === this.filtroTipoTrans);
    }
  
    return transacciones.sort((a, b) => {
      const fechaA = new Date(a.fechaHoraTransaccion).getTime();
      const fechaB = new Date(b.fechaHoraTransaccion).getTime();
      return this.ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
    });
  }  
  
  get totalPaginasTransacciones() {
    return Math.ceil(this.transaccionesFiltradasAdmin.length / this.tamanioPaginaTrans);
  }
  
  get transaccionesPaginadasAdmin() {
    const inicio = (this.paginaTransActual - 1) * this.tamanioPaginaTrans;
    return this.transaccionesFiltradasAdmin.slice(inicio, inicio + this.tamanioPaginaTrans);
  }
  
  cambiarPaginaTrans(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginasTransacciones) {
      this.paginaTransActual = nuevaPagina;
    }
  }
  

  // 🆕 Modal de detalle
  mostrarModalDetalleCaja = false;
  cajaSeleccionada: any = null;

  constructor(private cajaService: CajaService) {}

  ngOnInit(): void {
    this.cargarTodasLasCajas();
  }

  abrirDetalleArqueo(arqueoId: number) {
    this.arqueoSeleccionadoId = arqueoId;
    this.mostrarModalDetalleArqueo = true;
  }

  cargarTodasLasCajas() {
    this.loading = true;
    this.cajaService.obtenerTodasLasCajas().subscribe({
      next: data => {
        this.cajas = data;
        this.loading = false;
      },
      error: err => {
        console.error('❌ Error al obtener cajas:', err);
        this.loading = false;
      }
    });
  }

  abrirDetalleCaja(caja: any) {
    this.cajaSeleccionada = caja;
    this.mostrarModalDetalleCaja = true;
  }

  verArqueos(caja: any) {
    this.mostrarModalArqueos = true;
    this.cajaArqueoSeleccionadaId = caja.id;
    this.arqueosCajaSeleccionada = [];
    this.paginaArqueosActual = 1;
    this.filtroArqueoDesdeAdmin = null;
    this.filtroArqueoHastaAdmin = null;
    this.ordenArqueosDescAdmin = true;
  
    this.cajaService.obtenerArqueoPorCajaId(caja.id).subscribe({
      next: (data) => {
        this.arqueosCajaSeleccionada = data;
      },
      error: (err) => {
        console.error('❌ Error al obtener arqueos:', err);
        this.arqueosCajaSeleccionada = [];
      }
    });
  }
  

  cambiarPaginaArqueos(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginasArqueosAdmin) {
      this.paginaArqueosActual = nuevaPagina;
    }
  }

  verTransacciones(caja: any) {
    this.cajaTransaccionSeleccionadaId = caja.id;
    this.mostrarModalTransacciones = true;
    this.paginaTransActual = 1;
    this.filtroTipoTrans = null;
  
    this.cajaService.obtenerTransaccionesPorCajaId(caja.id).subscribe({
      next: (data) => {
        console.log('✅ Transacciones recibidas:', data);
        this.transaccionesCajaSeleccionada = data;
      },
      error: (err) => {
        console.error('❌ Error al obtener transacciones:', err);
        this.transaccionesCajaSeleccionada = [];
      }
    });
  }

  cambiarPaginaCajas(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginasCajas) {
      this.paginaCajasActual = nuevaPagina;
    }
  }
  
  
  
}

