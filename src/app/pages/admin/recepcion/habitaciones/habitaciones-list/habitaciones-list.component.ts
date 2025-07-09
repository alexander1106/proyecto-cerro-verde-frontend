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

  filtroGeneral: string = '';
  filtroTipo: string = '';
  filtroEstado: string = '';
  filtroPiso: string = ''; 

  tiposHabitacion: { id: number; nombre: string }[] = [];
  estadosHabitacion: string[] = ['Disponible', 'Reservada', 'Limpieza'];

  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private habitacionesService: HabitacionesService) {}

  ngOnInit(): void {
    this.cargarHabitaciones();
  }

  cargarHabitaciones(): void {
    this.loading = true;
    this.error = '';
  
    this.habitacionesService.getHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.tiposHabitacion = this.obtenerTiposUnicos(data);
        this.currentPage = 1; // reinicia a la primera página
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las habitaciones.';
        this.loading = false;
      }
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
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'La habitación fue eliminada correctamente',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.cargarHabitaciones();
            });
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la habitación porque está relacionada a una reserva', 'error');
          }
        });
      }
    });
  }


  get habitacionesActivas(): Habitacion[] {
    return this.habitaciones.filter(h => h.estado === 1);
  }

  changePage(delta: number): void {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
    }
  }

  obtenerTiposUnicos(habitaciones: Habitacion[]): { id: number; nombre: string }[] {
    const tiposUnicos: { [key: number]: string } = {};

    for (const h of habitaciones) {
      if (h.tipo_habitacion && !tiposUnicos[h.tipo_habitacion.id_tipo_habitacion!]) {
        tiposUnicos[h.tipo_habitacion.id_tipo_habitacion!] = h.tipo_habitacion.nombre;
      }
    }

    return Object.entries(tiposUnicos).map(([id, nombre]) => ({
      id: parseInt(id),
      nombre
    }));
  }

  get habitacionesActivasFiltradas() {
    const filtro = this.filtroGeneral.toLowerCase();
    const pisoFiltro = this.filtroPiso.toLowerCase();

    return this.habitacionesActivas.filter(h => {
      const tipo = h.tipo_habitacion?.nombre?.toLowerCase() || '';
      const estado = h.estado_habitacion?.toLowerCase() || '';
      const numero = h.numero?.toString() || '';
      const piso = h.piso?.numero?.toString() || '';

      const coincideTexto = filtro === '' || tipo.includes(filtro) || estado.includes(filtro) || numero.includes(filtro) || piso.includes(filtro);
      const coincideTipo = this.filtroTipo === '' || tipo === this.filtroTipo;
      const coincideEstado = this.filtroEstado === '' || estado === this.filtroEstado;
      const coincidePiso = this.filtroPiso === '' || piso === this.filtroPiso;

      return coincideTexto && coincideTipo && coincideEstado && coincidePiso;
    });
  }
  
  get totalPages(): number {
    return Math.ceil(this.habitacionesActivasFiltradas.length / this.itemsPerPage);
  }
  
  get habitacionesPaginadas(): Habitacion[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.habitacionesActivasFiltradas.slice(start, start + this.itemsPerPage);
  }

  get pisosUnicos(): string[] {
    const pisos = this.habitaciones.map(h => h.piso?.numero?.toString() || '');
    return [...new Set(pisos)].filter(p => p !== '');
  }
  
  
  limpiarFiltros(): void {
  this.filtroGeneral = '';
  this.filtroTipo = '';
  this.filtroEstado = '';
  this.filtroPiso = '';
  this.currentPage = 1; 
}

  
}
