import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { RegistrarAreaHotelComponent } from '../registrar-areas-hotel/registrar-areas-hotel.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-listar-areas-hotel',
  templateUrl: './listar-areas-hotel.component.html',
  styleUrls: ['./listar-areas-hotel.component.css'],
  imports: [RegistrarAreaHotelComponent, NgIf, NgFor],
  standalone: true
})
export class ListarAreasHotelComponent implements OnInit {
  areasHotel: any[] = [];
  loading = true;
  error = '';
  mostrarModal = false;

  constructor(private mantenimientoService: MantenimientoService) {}

  ngOnInit(): void {
    this.obtenerAreasHotel();
  }

  obtenerAreasHotel(): void {
    this.mantenimientoService.getAreasHotel().subscribe({
      next: (data) => {
        this.areasHotel = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las áreas del hotel';
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
    this.obtenerAreasHotel();
  }

}
