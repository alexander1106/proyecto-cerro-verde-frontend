import { Component, OnInit } from '@angular/core';
import { HabitacionesService, Habitacion } from '../../../../../service/habitaciones.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-habitaciones-list',
  templateUrl: './habitaciones-list.component.html',
  styleUrls: ['./habitaciones-list.component.css'],
  standalone: false,
})
export class HabitacionesListComponent implements OnInit {
  habitaciones: Habitacion[] = [];
  loading = true;
  error = '';

  constructor(private habitacionesService: HabitacionesService) {}

  ngOnInit(): void {
    this.cargarHabitaciones();
  }

  cargarHabitaciones(): void {
    this.loading = true;
    this.error = '';

    this.habitacionesService.getHabitaciones().subscribe({
      next: (data) => {
        console.log('🚀 Habitaciones cargadas:', data);
        this.habitaciones = data;
        this.loading = false;
      },

    });

  }

  eliminarHabitacion(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la habitación.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.habitacionesService.deleteHabitacion(id).subscribe({
          next: () => {
            this.habitaciones = this.habitaciones.filter(h => h.id_habitacion !== id);
            // @ts-ignore
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'La habitación fue eliminada correctamente',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            // @ts-ignore
            Swal.fire('Error', 'No se pudo eliminar la habitación', 'error');
          }
        });
      }
    });
  }

  filtroGeneral: string = '';

  get habitacionesActivasFiltradas() {
    const filtro = this.filtroGeneral.toLowerCase();
    return this.habitacionesActivas.filter(h => {
      const tipo = h.tipo_habitacion?.nombre?.toLowerCase() || '';
      const piso = h.piso?.toString() || '';
      const estado = h.estado_habitacion?.toLowerCase() || '';
      const numero = h.numero?.toString() || '';
      return (
        tipo.includes(filtro) ||
        piso.includes(filtro) ||
        estado.includes(filtro) ||
        numero.includes(filtro)
      );
    });
  }


  get habitacionesActivas() {
    return this.habitaciones?.filter(h => h.estado === 1) || [];
  }

    currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.habitacionesActivasFiltradas.length / this.itemsPerPage);
  }

  get habitacionesPaginadas() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.habitacionesActivasFiltradas.slice(start, start + this.itemsPerPage);
  }

  changePage(delta: number) {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
    }
  }

}
