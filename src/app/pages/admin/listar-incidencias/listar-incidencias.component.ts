import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-incidencias',
  templateUrl: './listar-incidencias.component.html',
  styleUrls: ['./listar-incidencias.component.css'],
  standalone: false
})
export class ListarIncidenciasComponent implements OnInit {
  incidencias: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;
  incidenciaSeleccionada: any = null;
  mostrarModalDetalle: boolean = false;

  constructor(private mantenimientoService: MantenimientoService) {}

  ngOnInit(): void {
    this.obtenerIncidencias();
  }

  obtenerIncidencias(): void {
    this.mantenimientoService.getIncidencias().subscribe({
      next: (data) => {
        this.incidencias = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las incidencias.';
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
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerIncidencias();
  }

  finalizarIncidencia(incidencia: any): void {
    const fechaHoraActual = new Date();
    const fechaSolucionStr = fechaHoraActual.toISOString().slice(0, 16).replace('T', ' '); // formato bonito
  
    Swal.fire({
      title: '¿Estás seguro de finalizar la incidencia?',
      html: `<p>Se marcará como <strong>resuelta</strong> con fecha:</p>
             <p><i class="bi bi-calendar-check"></i> ${fechaSolucionStr}</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const incidenciaActualizada = {
          ...incidencia,
          estado_incidencia: 'resuelta',
          fecha_solucion: new Date().toISOString()  // fecha real en UTC o la que use tu backend
        };
  
        this.mantenimientoService.actualizarIncidencia(incidencia.id_incidencia, incidenciaActualizada).subscribe({
          next: () => {
            Swal.fire('¡Listo!', 'La incidencia fue finalizada.', 'success');
            this.obtenerIncidencias(); // recargar lista
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo actualizar la incidencia.', 'error');
          }
        });
      }
    });
  }

  verDetalle(incidencia: any): void {
    this.incidenciaSeleccionada = incidencia;
    this.mostrarModalDetalle = true;
  }
  
  cerrarDetalle(): void {
    this.mostrarModalDetalle = false;
    this.incidenciaSeleccionada = null;
  }

  eliminarIncidencia(incidencia: any): void {
    Swal.fire({
      title: '¿Eliminar incidencia?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mantenimientoService.eliminarIncidencia(incidencia.id_incidencia).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La incidencia fue eliminada.', 'success');
            this.obtenerIncidencias();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar la incidencia.', 'error');
          }
        });
      }
    });
  }
  
  
}
