import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TipoHabitacionService, TipoHabitacion } from '../../../../../../service/tipo-habitacion.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-tipo-habitacion-list',
  standalone: false,
  templateUrl: './tipo-habitacion-list.component.html',
  styleUrls: ['./tipo-habitacion-list.component.css']
})
export class TipoHabitacionListComponent implements OnInit {
  tipos: TipoHabitacion[] = [];
  loading = true;
  error = '';


  constructor(private tipoHabitacionService: TipoHabitacionService) {}

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.loading = true;
    this.error = '';

    this.tipoHabitacionService.getTiposHabitacion().subscribe({
      next: (data) => {
        this.tipos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los tipos de habitación. Intente nuevamente.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  eliminarTipo(id: number): void {
    if (!id) {
      console.error('ID inválido para eliminar');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.tipoHabitacionService.deleteTipoHabitacion(id).subscribe({
          next: () => {
            this.tipos = this.tipos.filter(h => h.id_tipo_habitacion !== id);
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El tipo fue eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire('Error', 'No se pudo eliminar el tipo, está relacionada a una Habitación', 'error');
          }
        });
      }
    });
  }


  filtroGeneral: string = '';

  get tipohabitacionesActivasFiltradas() {
    const filtro = this.filtroGeneral.toLowerCase();
    return this.tipohabitacionesActivas.filter(h => {
      const tipo = h.nombre?.toLowerCase() || '';
      const precio = h.precio?.toString() || '';
      return (
        tipo.includes(filtro) ||
        precio.includes(filtro)
      );
    });
  }


  get tipohabitacionesActivas() {
    return this.tipos?.filter(h => h.estado === 1) || [];
  }

    currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.tipohabitacionesActivasFiltradas.length / this.itemsPerPage);
  }

  get tipohabitacionesPaginadas() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.tipohabitacionesActivasFiltradas.slice(start, start + this.itemsPerPage);
  }

  changePage(delta: number) {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
    }
  }
}
