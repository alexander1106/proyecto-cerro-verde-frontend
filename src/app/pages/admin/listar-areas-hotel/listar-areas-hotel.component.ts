import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-areas-hotel',
  templateUrl: './listar-areas-hotel.component.html',
  styleUrls: ['./listar-areas-hotel.component.css'],
  standalone: false
})
export class ListarAreasHotelComponent implements OnInit {
  areasHotel: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;
  areaSeleccionada: any = null;

  constructor(private mantenimientoService: MantenimientoService) {}

  ngOnInit(): void {
    this.obtenerAreasHotel();
  }

  obtenerAreasHotel(): void {
    this.mantenimientoService.getAreasHotel().subscribe({
      next: (data) => {
        this.areasHotel = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las áreas del hotel';
        console.error(err);
        this.loading = false;
      }
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.areaSeleccionada = null;
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerAreasHotel();
  }

  editarArea(area: any): void {
    this.mantenimientoService.getAreaHotelById(area.id_area).subscribe({
      next: (res) => {
        this.mostrarModal = true;
        this.areaSeleccionada = res;
      },
      error: (err) => {
        console.error('Error al obtener el área', err);
      }
    });
  }

  eliminarArea(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará el área seleccionada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mantenimientoService.eliminarAreaHotel(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Área eliminada',
              showConfirmButton: false,
              timer: 1500
            });
            this.obtenerAreasHotel();
          },
          error: (err) => {
            if (err.status === 409) {
              Swal.fire({
                icon: 'error',
                title: 'No se puede eliminar',
                text: 'El área tiene incidencias asociadas.'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error al eliminar',
                text: 'Ocurrió un problema inesperado.'
              });
            }
            console.error(err);
          }
        });
      }
    });
  }
}
