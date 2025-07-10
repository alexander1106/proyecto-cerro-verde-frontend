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
  Math = Math;
  incidencias: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;
  incidenciaSeleccionada: any = null;
  mostrarModalDetalle = false;

  filtroEstado: string = '';
  filtroGravedad: string = '';
  ordenCampo: string = 'fecha_registro';
  ordenAscendente: boolean = true;

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(private mantenimientoService: MantenimientoService) {}

  ngOnInit(): void {
    this.obtenerIncidencias();
  }

  obtenerIncidencias(): void {
    this.loading = true;
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

  get incidenciasFiltradas(): any[] {
    let resultado = [...this.incidencias];

    if (this.filtroEstado) {
      resultado = resultado.filter(i => i.estado_incidencia === this.filtroEstado);
    }

    if (this.filtroGravedad) {
      resultado = resultado.filter(i => i.gravedad === this.filtroGravedad);
    }

    resultado.sort((a, b) => {
      const campoA = a[this.ordenCampo] ?? '';
      const campoB = b[this.ordenCampo] ?? '';
      if (campoA < campoB) return this.ordenAscendente ? -1 : 1;
      if (campoA > campoB) return this.ordenAscendente ? 1 : -1;
      return 0;
    });

    return resultado;
  }

  get incidenciasPaginadas(): any[] {
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.incidenciasFiltradas.slice(start, start + this.elementosPorPagina);
  }

  cambiarOrden(campo: string): void {
    if (this.ordenCampo === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenCampo = campo;
      this.ordenAscendente = true;
    }
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroGravedad = '';
  }

  cambiarPagina(delta: number): void {
    const totalPaginas = Math.ceil(this.incidenciasFiltradas.length / this.elementosPorPagina);
    this.paginaActual = Math.max(1, Math.min(this.paginaActual + delta, totalPaginas));
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerIncidencias();
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.incidenciaSeleccionada = null;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  verDetalle(incidencia: any): void {
    this.incidenciaSeleccionada = incidencia;
    this.mostrarModalDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarModalDetalle = false;
    this.incidenciaSeleccionada = null;
  }

  editarIncidencia(incidencia: any): void {
    this.incidenciaSeleccionada = incidencia;
    this.mostrarModal = true;
  }

  finalizarIncidencia(incidencia: any): void {
    const fechaSolucion = new Date().toISOString();

    Swal.fire({
      title: 'Finalizar incidencia',
      html: `
        <p>Se marcará como <strong>resuelta</strong> con fecha:</p>
        <p><i class="bi bi-calendar-check"></i> ${fechaSolucion}</p>
        <textarea id="observacionInput" class="swal2-textarea" placeholder="Observaciones de solución..."></textarea>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const input = (document.getElementById('observacionInput') as HTMLTextAreaElement).value;
        if (!input || input.trim().length < 5) {
          Swal.showValidationMessage('La observación debe tener al menos 5 caracteres.');
        }
        return input;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const observacionesSolucion = result.value;

        const incidenciaActualizada = {
          ...incidencia,
          estado_incidencia: 'resuelta',
          fecha_solucion: fechaSolucion,
          observaciones_solucion: observacionesSolucion
        };

        this.mantenimientoService.actualizarIncidencia(incidencia.id_incidencia, incidenciaActualizada).subscribe({
          next: () => {
            Swal.fire('¡Listo!', 'La incidencia fue finalizada.', 'success');
            this.obtenerIncidencias();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo actualizar la incidencia.', 'error');
          }
        });
      }
    });
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
