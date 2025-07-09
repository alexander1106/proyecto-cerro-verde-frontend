import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Pisos, PisosService } from '../../../../../service/pisos.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-pisos-list',
  standalone: false,
  templateUrl: './pisos-list.component.html',
  styleUrls: ['./pisos-list.component.css']
})
export class PisosListComponent implements OnInit {
  pisos: Pisos[] = [];
  loading = true;
  error = '';

  constructor(private pisoService: PisosService) {}

  ngOnInit(): void {
    this.cargarPisos();
  }

  cargarPisos(): void {
    this.loading = true;
    this.error = '';

    this.pisoService.getPisos().subscribe({
      next: (data) => {
        this.pisos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los tipos de habitación. Intente nuevamente.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  eliminarPiso(id: number): void {
    if (!id) {
      console.error('ID inválido para eliminar');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el piso.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.pisoService.deletePiso(id).subscribe({
          next: () => {
            this.pisos = this.pisos.filter(h => h.id_piso !== id);
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El piso fue eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire('Error', 'No se pudo eliminar el piso, está relacionado a una Habitación', 'error');
          }
        });
      }
    });
  }


  filtroGeneral: string = '';

  get pisosActivasFiltradas() {
    const filtro = this.filtroGeneral.toLowerCase();
    return this.pisosActivos.filter(h => {
      const piso = h.numero?.toString() || '';
      return (
        piso.includes(filtro)
      );
    });
  }


  get pisosActivos() {
    return this.pisos?.filter(h => h.estado === 1) || [];
  }

  currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.pisosActivasFiltradas.length / this.itemsPerPage);
  }

  get pisosPaginadas() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.pisosActivasFiltradas.slice(start, start + this.itemsPerPage);
  }

  changePage(delta: number) {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
    }
  }

  limpiarFiltros(): void {
    this.filtroGeneral = '';
    this.currentPage = 1;
  }
}
