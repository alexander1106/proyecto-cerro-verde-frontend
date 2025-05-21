import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SalonesService, Salones } from '../../../../../service/salones.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-salones-list',
  templateUrl: './salones-list.component.html',
  styleUrls: ['./salones-list.component.css'],
  standalone: false,
})
export class SalonesListComponent implements OnInit {
  salones: Salones[] = [];
  loading = true;
  error = '';

  constructor(private salonesService: SalonesService) {}

  ngOnInit(): void {
    this.cargarSalones();
  }

  cargarSalones(): void {
    this.loading = true;
    this.error = '';

    this.salonesService.getSalones().subscribe({
      next: (data) => {
        console.log('🚀 SalongetSalones cargadas:', data);
        this.salones = data;
        this.loading = false;
      },

    });

  }

  eliminarSalon(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el salón',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.salonesService.deleteSalon(id).subscribe({
          next: () => {
            this.salones = this.salones.filter(h => h.id_salon !== id);
            // @ts-ignore
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El salón fue eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el salón. Tiene una reserva activa.', 'error');
          }
        });
      }
    });
  }

  filtroGeneral: string = '';

  get salonesActivasFiltradas() {
    const filtro = this.filtroGeneral.toLowerCase();
    return this.salonesActivas.filter(h => {
      const nombre = h.nombre?.toLowerCase() || '';
      const estado = h.estado_salon?.toLowerCase() || '';
      const preciod = h.precio_diario?.toString() || '';
      const precioh = h.precio_hora?.toString()
      return (
        nombre.includes(filtro) ||
        preciod.includes(filtro) ||
        estado.includes(filtro) ||
        precioh.includes(filtro)
      );
    });
  }


  get salonesActivas() {
    return this.salones?.filter(h => h.estado === 1) || [];
  }

    currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.salonesActivasFiltradas.length / this.itemsPerPage);
  }

  get salonesPaginadas() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.salonesActivasFiltradas.slice(start, start + this.itemsPerPage);
  }

  changePage(delta: number) {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
    }
  }

}
