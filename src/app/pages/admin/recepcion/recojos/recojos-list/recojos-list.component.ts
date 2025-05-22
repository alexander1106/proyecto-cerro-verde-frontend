import { Component, OnInit } from '@angular/core';
import { RecojosService, Recojos } from '../../../../../service/recojos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recojos-list',
  templateUrl: './recojos-list.component.html',
  styleUrls: ['./recojos-list.component.css'],
  standalone: false,
})
export class RecojosListComponent implements OnInit {
  recojos: Recojos[] = [];
  loading = true;
  error = '';

  constructor(private recojosService: RecojosService) {}

  ngOnInit(): void {
    this.cargarRecojos();
  }

  cargarRecojos(): void {
    this.loading = true;
    this.error = '';

    this.recojosService.getRecojos().subscribe({
      next: (data) => {
        console.log('🚀 Recojos cargados:', data);
        this.recojos = data;
        this.loading = false;
      },

    });

  }

  eliminarRecojo(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el recojo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.recojosService.deleteRecojo(id).subscribe({
          next: () => {
            this.recojos = this.recojos.filter(h => h.id_recojo !== id);
            // @ts-ignore
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El recojo fue eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            // @ts-ignore
            Swal.fire('Error', 'No se pudo eliminar el recojo', 'error');
          }
        });
      }
    });
  }

  filtroGeneral: string = '';

  get recojosActivosFiltrados() {
    const filtro = this.filtroGeneral.toLowerCase();
    return this.recojosActivos.filter(h => {
      const destino = h.destino?.toLowerCase() || '';
      const conductor = h.conductor?.nombre.toLowerCase() || '';
      const reserva = h.reserva?.cliente.nombre.toLowerCase() || '';
      const fecha_hora = h.fecha_hora?.toString() || '';
      return (
        destino.includes(filtro) ||
        conductor.includes(filtro) ||
        reserva.includes(filtro) ||
        fecha_hora.includes(filtro)
      );
    });
  }


  get recojosActivos() {
    return this.recojos?.filter(h => h.estado === 1) || [];
  }

    currentPage: number = 1;
  itemsPerPage: number = 10;

  get totalPages(): number {
    return Math.ceil(this.recojosActivosFiltrados.length / this.itemsPerPage);
  }

  get recojosPaginados() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.recojosActivosFiltrados.slice(start, start + this.itemsPerPage);
  }

  changePage(delta: number) {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages) {
      this.currentPage = nextPage;
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }

}
