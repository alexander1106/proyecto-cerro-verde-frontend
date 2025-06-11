import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';

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
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerTiposIncidencia();
  }
}
