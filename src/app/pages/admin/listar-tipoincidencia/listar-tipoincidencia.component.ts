import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-tipo-incidencia',
  templateUrl: './listar-tipoincidencia.component.html',
  styleUrls: ['./listar-tipoincidencia.component.css'],
  standalone: false
})
export class ListarTipoIncidenciaComponent implements OnInit {
  tiposIncidencia: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;
  tipoSeleccionado: any = null;

  constructor(private mantenimientoService: MantenimientoService) {}

  ngOnInit(): void {
    this.obtenerTiposIncidencia();
  }

  obtenerTiposIncidencia(): void {
    this.mantenimientoService.getTiposIncidencia().subscribe({
      next: (data) => {
        this.tiposIncidencia = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar los tipos de incidencia.';
        this.loading = false;
      }
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.tipoSeleccionado = null;
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerTiposIncidencia();
  }

  editarTipo(tipo: any): void {
    this.mantenimientoService.getTipoIncidenciaById(tipo.id_tipo_incidencia).subscribe({
      next: (res) => {
        this.tipoSeleccionado = res;
        this.mostrarModal = true;
      },
      error: (err) => {
        console.error('Error al obtener tipo de incidencia', err);
      }
    });
  }

  eliminarTipo(id: number): void {
    Swal.fire({
      title: '¿Eliminar tipo de incidencia?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.mantenimientoService.eliminarTipoIncidencia(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Tipo de incidencia eliminado correctamente', 'success');
            this.obtenerTiposIncidencia();
          },
          error: (err) => {
            if (err.status === 409) {
              Swal.fire('No permitido', 'Este tipo de incidencia tiene registros asociados.', 'error');
            } else {
              Swal.fire('Error', 'No se pudo eliminar el tipo de incidencia.', 'error');
            }
            console.error(err);
          }
        });
      }
    });
  }
}
