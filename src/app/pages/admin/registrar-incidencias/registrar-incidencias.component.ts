import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';

@Component({
  selector: 'app-registrar-incidencia',
  templateUrl: './registrar-incidencias.component.html',
  styleUrls: ['./registrar-incidencias.component.css'],
  standalone: false
})
export class RegistrarIncidenciaComponent {
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  incidenciaForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private service: MantenimientoService) {
    this.incidenciaForm = this.fb.group({
      fecha_registro: ['', Validators.required],
      fecha_solucion: [''],
      estado_incidencia: ['', Validators.required],
      descripcion: ['', Validators.required],
      id_habitacion: [null],
      id_tipo_incidencia: [null],
      id_usuario: [null],
      id_area: [null]
    });
  }

  registrar(): void {
    if (this.incidenciaForm.invalid) return;

    const data = {
      fecha_registro: this.incidenciaForm.value.fecha_registro,
      fecha_solucion: this.incidenciaForm.value.fecha_solucion,
      estado_incidencia: this.incidenciaForm.value.estado_incidencia,
      descripcion: this.incidenciaForm.value.descripcion,
      habitacion: this.incidenciaForm.value.id_habitacion ? { id_habitacion: this.incidenciaForm.value.id_habitacion } : null,
      tipoIncidencia: this.incidenciaForm.value.id_tipo_incidencia ? { id_tipo_incidencia: this.incidenciaForm.value.id_tipo_incidencia } : null,
      usuario: this.incidenciaForm.value.id_usuario ? { id_usuario: this.incidenciaForm.value.id_usuario } : null,
      area: this.incidenciaForm.value.id_area ? { id_area: this.incidenciaForm.value.id_area } : null,
    };

    this.loading = true;
    this.service.registrarIncidencia(data).subscribe({
      next: () => {
        this.loading = false;
        this.onRegistroExitoso.emit();
      },
      error: err => {
        console.error(err);
        this.error = 'Error al registrar la incidencia.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}
