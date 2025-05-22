import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';
import Swal from 'sweetalert2';

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

  constructor(private reservasService: ReservasService, private router: Router) { }

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
    // Filtrar por búsqueda
    this.filteredReservas = this.reservas.filter(reserva =>
      Object.values(reserva).some(value =>
        value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );

    // Paginación
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredReservas = this.filteredReservas.slice(startIndex, endIndex);
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

  deleteReserva(id: number): void {
    if (confirm('¿Está seguro que desea eliminar esta reserva?')) {
      this.reservasService.deleteReserva(id).subscribe({
        next: () => {
          this.loadReservas();
        },
        error: (err) => {
          this.error = 'Error al eliminar la reserva: ' + err.message;
        }
      });
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }
}
