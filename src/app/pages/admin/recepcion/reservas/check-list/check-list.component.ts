import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CheckinCheckoutService, CheckinCheckout} from '../../../../../service/checkin-checkout.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-check-list',
  standalone: false,
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.css']
})
export class ChecksListComponent implements OnInit {
  checks: CheckinCheckout[] = [];
  loading = true;
  error = '';

  fechaDesde: string = '';
  fechaHasta: string = '';

  constructor(private checkService: CheckinCheckoutService) {}

  ngOnInit(): void {
    this.cargarChecks();
  }

  cargarChecks(): void {
    this.loading = true;
    this.error = '';

    this.checkService.buscarTodos().subscribe({
      next: (data) => {
        // Ordenar del más reciente al más antiguo por id_check
        this.checks = data.sort((a: CheckinCheckout, b: CheckinCheckout) => b.id_check! - a.id_check!);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los checks. Intente nuevamente.';
        this.loading = false;
        console.error('Error:', err);
      }
    });

  }

  eliminar(id: number): void {
    if (!id) {
      console.error('ID inválido para eliminar');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el check.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.checkService.eliminar(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El check fue eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.cargarChecks(); // recarga lista desde el backend
            });
          },
          error: (err) => {
            const mensaje = err?.error?.message || 'Ocurrió un error al eliminar el check. Tiene un recojo activo';
            Swal.fire('Error', mensaje, 'error');
          }

        });
      }
    });
  }


  filtroGeneral: string = '';

  get checkActivosFiltrados() {
    const filtro = this.filtroGeneral.toLowerCase();
    const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
    const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

    return this.checkActivos.filter(h => {
      const checkin = h.fecha_checkin?.toString() || '';
      const reserva = h.reserva?.toString() || '';
      const fechaHora = h.fecha_checkin ? new Date(h.fecha_checkin) : null;
      const checkout = h.fecha_checkout?.toString() || '';

      const coincideTexto =
        filtro === '' ||
        reserva.includes(filtro) ||
        checkin?.toString().toLowerCase().includes(filtro) ||
        checkout?.toString().toLowerCase().includes(filtro);

      const coincideFecha =
      (!desde || (fechaHora && fechaHora >= desde)) &&
      (!hasta || (fechaHora && fechaHora <= hasta));

      return coincideTexto && coincideFecha;
    });
  }


  get checkActivos() {
    return this.checks?.filter(h => h.estado === 1) || [];
  }

    currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.checkActivosFiltrados.length / this.itemsPerPage);
  }

  get checksPaginados() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.checkActivosFiltrados.slice(start, start + this.itemsPerPage);
  }

  changePage(delta: number) {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }

  limpiarFiltros(): void {
    this.filtroGeneral = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.currentPage = 1; // Resetear a la primera página al cambiar el término de búsqueda
  }
}
