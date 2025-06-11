import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { RegistrarIncidenciaComponent } from '../registrar-incidencias/registrar-incidencias.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-listar-incidencias',
  templateUrl: './listar-incidencias.component.html',
  styleUrls: ['./listar-incidencias.component.css'],
  imports: [RegistrarIncidenciaComponent, NgIf, NgFor],
  standalone: true
})
export class ListarIncidenciasComponent implements OnInit {
  incidencias: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;

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
}
