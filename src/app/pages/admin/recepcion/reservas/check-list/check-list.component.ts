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

  constructor(private checkService: CheckinCheckoutService) {}

  ngOnInit(): void {
    this.cargarChecks();
  }

  cargarChecks(): void {
    this.loading = true;
    this.error = '';

    this.checkService.buscarTodos().subscribe({
      next: (data) => {
        this.checks = data;
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
    return this.checkActivos.filter(h => {
      const checkin = h.fecha_checkin?.toString() || '';
      const reserva = h.reserva?.toString() || '';
      const checkout = h.fecha_checkout?.toString() || '';
      return (
        checkin.includes(filtro) ||
        reserva.includes(filtro) ||
        checkout.includes(filtro)
      );
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
}
