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
  filtroEstado: string = '';
  estadosRecojo: string[] = ['Pendiente', 'En ruta', 'Completo'];
  
  fechaDesde: string = '';
  fechaHasta: string = '';


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

  onSearchChange(): void {
    this.currentPage = 1; // Resetear a la primera página al cambiar el término de búsqueda
  }

  get recojosActivosFiltrados() {
    const filtro = this.filtroGeneral.toLowerCase();
    const estadoFiltro = this.filtroEstado.toLowerCase();
    const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
    const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;
  
    return this.recojosActivos.filter(h => {
      const destino = h.destino?.toLowerCase() || '';
      const conductor = h.conductor?.nombre?.toLowerCase() || '';
      const cliente = h.reserva?.cliente?.nombre?.toLowerCase() || '';
      const fechaHora = h.fecha_hora ? new Date(h.fecha_hora) : null;
      const estado = h.estado_recojo?.toLowerCase() || '';
  
      const coincideTexto =
        filtro === '' ||
        destino.includes(filtro) ||
        conductor.includes(filtro) ||
        cliente.includes(filtro) ||
        h.fecha_hora?.toString().toLowerCase().includes(filtro);
  
      const coincideEstado =
        estadoFiltro === '' || estado === estadoFiltro;
  
      const coincideFecha =
        (!desde || (fechaHora && fechaHora >= desde)) &&
        (!hasta || (fechaHora && fechaHora <= hasta));
  
      return coincideTexto && coincideEstado && coincideFecha;
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

  limpiarFiltros(): void {
    this.filtroGeneral = '';
    this.filtroEstado = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.currentPage = 1;
  }
  

}
