import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { RegistrarPersonalLimpiezaComponent } from '../registrar-personal-limpieza/registrar-personal-limpieza.component';

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
  }

  registroExitoso(): void {
    this.cerrarModal();
    this.obtenerPersonalLimpieza();
  }
}
