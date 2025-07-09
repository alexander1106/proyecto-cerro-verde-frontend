import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';
import Swal from 'sweetalert2';
import { LoginService } from '../../../../../service/login.service';

@Component({
  selector: 'app-reservas-list',
  standalone: false,
  templateUrl: './reservas-list.component.html',
  styleUrls: ['./reservas-list.component.css']
})
export class ReservasListComponent implements OnInit {
  reservas: Reserva[] = [];
  filteredReservas: Reserva[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  currentPage = 1;
  totalPages = 0;
  pageSize = 10;
  filtroTipoReserva: string = '';
  filtroEstadoReserva: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';



  constructor(private reservasService: ReservasService, private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
    this.loadReservas();
  }

  loadReservas(): void {
    this.loading = true;
    this.reservasService.getReservas().subscribe({
      next: (data) => {
        // Filtrar solo reservas con estado = 1
        this.reservas = data.filter(reserva => reserva.estado === 1);
        this.totalPages = Math.ceil(this.reservas.length / this.pageSize);
        this.updateFilteredReservas();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las reservas: ' + err.message;
        this.loading = false;
      }
    });
  }

  updateFilteredReservas(): void {
    const term = this.searchTerm.toLowerCase();
    const tipoFiltro = this.filtroTipoReserva.toLowerCase();
    const estadoFiltro = this.filtroEstadoReserva.toLowerCase();
  
    const fechaDesdeVal = this.fechaDesde ? new Date(this.fechaDesde) : null;
    const fechaHastaVal = this.fechaHasta ? new Date(this.fechaHasta) : null;
  
    let filtradas = this.reservas.filter(reserva => {
      const coincideBusqueda = !term || [
        reserva.cliente?.nombre,
        reserva.cliente?.dniRuc,
        reserva.tipo,
        reserva.estado_reserva,
        reserva.nro_persona?.toString(),
        this.formatDate(reserva.fecha_inicio),
        this.formatDate(reserva.fecha_fin)
      ].some(valor =>
        valor?.toString().toLowerCase().includes(term)
      );
  
      const coincideTipo =
        !tipoFiltro || reserva.tipo.toLowerCase() === tipoFiltro;
  
      const coincideEstado =
        !estadoFiltro || reserva.estado_reserva.toLowerCase() === estadoFiltro;
  
      const fechaInicio = new Date(reserva.fecha_inicio);
  
      const coincideFechas =
        (!fechaDesdeVal || fechaInicio >= fechaDesdeVal) &&
        (!fechaHastaVal || fechaInicio <= fechaHastaVal);
  
      return coincideBusqueda && coincideTipo && coincideEstado && coincideFechas;
    });
  
    // Ordenar por ID descendente
    filtradas.sort((a, b) => (b.id_reserva ?? 0) - (a.id_reserva ?? 0));
  
    // Recalcular total de páginas
    this.totalPages = Math.ceil(filtradas.length / this.pageSize);
  
    // Paginación
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredReservas = filtradas.slice(startIndex, endIndex);
  }  
  

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroTipoReserva = '';
    this.filtroEstadoReserva = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.currentPage = 1;
    this.updateFilteredReservas();
  }
  
  onSearchChange(): void {
    this.currentPage = 1; // Resetear a la primera página al cambiar el término de búsqueda
    this.updateFilteredReservas();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateFilteredReservas();
    }
  }

  viewReserva(reserva: Reserva): void {
    if (reserva.tipo === 'Habitación') {
      this.router.navigate(['/admin/recepcion/reservas/habitaciones/ver', reserva.id_reserva]);
    } else if (reserva.tipo === 'Salón') {
      this.router.navigate(['/admin/recepcion/reservas/salones/ver', reserva.id_reserva]);
    }
  }


  editReserva(reserva: Reserva): void {
    if (reserva.tipo === 'Habitación') {
      this.router.navigate(['/admin/recepcion/reservas/habitaciones/editar', reserva.id_reserva]);
    } else if (reserva.tipo === 'Salón') {
      this.router.navigate(['/admin/recepcion/reservas/salones/editar', reserva.id_reserva]);
    }
  }

  deleteReserva(reserva: Reserva): void {
    if (reserva.estado_reserva.toLowerCase() !== 'pendiente') {
      Swal.fire('No permitido', 'Solo se pueden eliminar reservas en estado pendiente.', 'warning');
      return;
    }
  
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará la reserva permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservasService.deleteReserva(reserva.id_reserva!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La reserva ha sido eliminada correctamente.', 'success');
            this.loadReservas();
          },
          error: (err) => {
            Swal.fire('Error', 'Ocurrió un error al eliminar la reserva: ' + err.message, 'error');
          }
        });
      }
    });
  }
  

  cancelarReserva(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción cancelará la reserva y devolverá el monto al cliente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservasService.cancelarReserva(id).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Reserva cancelada correctamente', 'success');
            this.loadReservas();
          },
          error: (err) => {
            Swal.fire('Error', err.error || 'No se pudo cancelar la reserva', 'error');
          }
        });
      }
    });
  }
  
  

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }

}
