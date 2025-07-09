import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { HabitacionesService } from '../../../service/habitaciones.service';
import { SalonesService } from '../../../service/salones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-limpieza',
  templateUrl: './listar-limpiezas.component.html',
  styleUrls: ['./listar-limpiezas.component.css'],
  standalone: false
})
export class ListarLimpiezaComponent implements OnInit {
  limpiezas: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;
  filtroEstado: string = '';
  limpiezaSeleccionada: any = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private habitacionesService: HabitacionesService,
    private salonesService: SalonesService
  ) {}

  ngOnInit(): void {
    this.obtenerLimpiezas();
  }

  obtenerLimpiezas(): void {
    this.mantenimientoService.getLimpiezas().subscribe({
      next: (data) => {
        this.limpiezas = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las limpiezas.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  get limpiezasFiltradas(): any[] {
    if (!this.filtroEstado) return this.limpiezas;
    return this.limpiezas.filter(l => l.estado_limpieza === this.filtroEstado);
  }

  limpiarFiltroEstado(): void {
    this.filtroEstado = '';
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiezaSeleccionada = null;
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerLimpiezas();
  }

  finalizarLimpieza(limpieza: any): void {
    const fechaHoraActual = new Date();
    const fechaSolucionStr = fechaHoraActual.toISOString().slice(0, 16).replace('T', ' ');

    Swal.fire({
      title: 'Finalizar limpieza',
      html: `
        <p>Se marcará como <strong>completada</strong> con fecha:</p>
        <p><i class="bi bi-calendar-check"></i> ${fechaSolucionStr}</p>
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

        const limpiezaActualizada = {
          ...limpieza,
          estado_limpieza: 'Completada',
          fecha_solucion: new Date().toISOString(),
          observaciones: observacionesSolucion
        };

        this.mantenimientoService.actualizarLimpieza(limpieza.id_limpieza, limpiezaActualizada).subscribe({
          next: () => {
            // ✅ Actualizar estado del lugar a "Disponible"
            if (limpieza.habitacion && limpieza.habitacion.id_habitacion) {
              const habitacionActualizada = {
                ...limpieza.habitacion,
                estado_habitacion: 'Disponible'
              };

              this.habitacionesService.updateHabitacion(habitacionActualizada).subscribe({
                next: () => {
                  Swal.fire('¡Listo!', 'Limpieza finalizada y habitación marcada como disponible.', 'success');
                  this.obtenerLimpiezas();
                },
                error: (err) => {
                  console.error(err);
                  Swal.fire('Parcialmente finalizado', 'La limpieza se completó, pero no se actualizó la habitación.', 'warning');
                  this.obtenerLimpiezas();
                }
              });

            } else if (limpieza.salon && limpieza.salon.id_salon) {
              const salonActualizado = {
                ...limpieza.salon,
                estado_salon: 'Disponible'
              };

              this.salonesService.updateSalon(salonActualizado).subscribe({
                next: () => {
                  Swal.fire('¡Listo!', 'Limpieza finalizada y salón marcado como disponible.', 'success');
                  this.obtenerLimpiezas();
                },
                error: (err) => {
                  console.error(err);
                  Swal.fire('Parcialmente finalizado', 'La limpieza se completó, pero no se actualizó el salón.', 'warning');
                  this.obtenerLimpiezas();
                }
              });

            } else {
              Swal.fire('¡Listo!', 'Limpieza finalizada correctamente.', 'success');
              this.obtenerLimpiezas();
            }
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo finalizar la limpieza.', 'error');
          }
        });
      }
    });
  }

  eliminarLimpieza(limpieza: any): void {
    Swal.fire({
      title: '¿Eliminar limpieza?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mantenimientoService.eliminarLimpieza(limpieza.id_limpieza).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La limpieza fue eliminada.', 'success');
            this.obtenerLimpiezas();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar la limpieza.', 'error');
          }
        });
      }
    });
  }

  editarLimpieza(limpieza: any): void {
    this.limpiezaSeleccionada = limpieza;
    this.mostrarModal = true;
  }
  
}
