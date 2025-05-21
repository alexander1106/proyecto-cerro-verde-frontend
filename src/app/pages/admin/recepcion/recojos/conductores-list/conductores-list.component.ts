import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Conductores, ConductoresService } from '../../../../../service/conductores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-conductores-list',
  standalone: false,
  templateUrl: './conductores-list.component.html',
  styleUrls: ['./conductores-list.component.css']
})
export class ConductoresListComponent implements OnInit {
  conductores: Conductores[] = [];
  loading = true;
  error = '';

  constructor(private conductorService: ConductoresService) {}

  ngOnInit(): void {
    this.cargarConductores();
  }

  cargarConductores(): void {
    this.loading = true;
    this.error = '';

    this.conductorService.getConductores().subscribe({
      next: (data) => {
        this.conductores = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los conductores. Intente nuevamente.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  eliminarConductor(id: number): void {
    if (!id) {
      console.error('ID inválido para eliminar');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el conductor.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.conductorService.deleteConductor(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El conductor fue eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.cargarConductores(); // recarga lista desde el backend
            });
          },
          error: (err) => {
            const mensaje = err?.error?.message || 'Ocurrió un error al eliminar el conductor. Tiene un recojo activo';
            Swal.fire('Error', mensaje, 'error');
          }
          
        });
      }
    });
  }


  filtroGeneral: string = '';

  get conductorActivosFiltrados() {
    const filtro = this.filtroGeneral.toLowerCase();
    return this.conductorActivos.filter(h => {
      const conductor = h.nombre?.toLowerCase() || '';
      const dni = h.dni?.toLowerCase() || '';
      const modelo_vehiculo = h.modelo_vehiculo?.toLowerCase() || '';
      return (
        conductor.includes(filtro) ||
        dni.includes(filtro) ||
        modelo_vehiculo.includes(filtro)
      );
    });
  }


  get conductorActivos() {
    return this.conductores?.filter(h => h.estado === 1) || [];
  }

    currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.conductorActivosFiltrados.length / this.itemsPerPage);
  }

  get conductoresPaginados() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.conductorActivosFiltrados.slice(start, start + this.itemsPerPage);
  }

  changePage(delta: number) {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
    }
  }
}
