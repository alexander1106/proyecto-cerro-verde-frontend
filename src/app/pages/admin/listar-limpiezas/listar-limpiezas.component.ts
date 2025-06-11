import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';

@Component({
  selector: 'app-listar-limpiezas',
  templateUrl: './listar-limpiezas.component.html',
  styleUrls: ['./listar-limpiezas.component.css'],
  standalone: false
})
export class ListarLimpiezasComponent implements OnInit {
  limpiezas: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;

  constructor(private mantenimientoService: MantenimientoService) {}

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
  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerLimpiezas();
  }
}

