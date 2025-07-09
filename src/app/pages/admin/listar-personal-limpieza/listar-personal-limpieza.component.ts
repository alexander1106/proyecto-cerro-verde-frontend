import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-personal-limpieza',
  templateUrl: './listar-personal-limpieza.component.html',
  styleUrls: ['./listar-personal-limpieza.component.css'],
  standalone: false
})
export class ListarPersonalLimpiezaComponent implements OnInit {
  personalLimpieza: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;
  personalSeleccionado: any = null;

  constructor(private mantenimientoService: MantenimientoService) {}

  ngOnInit(): void {
    this.obtenerPersonalLimpieza();
  }

  obtenerPersonalLimpieza(): void {
    this.mantenimientoService.getPersonalLimpieza().subscribe({
      next: (data) => {
        this.personalLimpieza = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el personal de limpieza';
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
    this.personalSeleccionado = null;
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerPersonalLimpieza();
  }

  editarPersonal(personal: any): void {
    this.mantenimientoService.getPersonalLimpiezaById(personal.id_personal_limpieza).subscribe({
      next: (res) => {
        this.personalSeleccionado = res;
        this.mostrarModal = true;
      },
      error: (err) => {
        console.error('Error al obtener personal', err);
      }
    });
  }

  eliminarPersonal(id: number): void {
    Swal.fire({
      title: '¿Eliminar personal?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.mantenimientoService.eliminarPersonalLimpieza(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El personal fue eliminado correctamente.', 'success');
            this.obtenerPersonalLimpieza();
          },
          error: (err) => {
            if (err.status === 409) {
              Swal.fire('No permitido', 'Este personal está relacionado con otras entidades.', 'error');
            } else {
              Swal.fire('Error', 'Ocurrió un error al eliminar.', 'error');
            }
            console.error(err);
          }
        });
      }
    });
  }
}
