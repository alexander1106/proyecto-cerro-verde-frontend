import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-registrar-tipo-incidencia',
  templateUrl: './registrar-tipoincidencia.component.html',
  styleUrls: ['./registrar-tipoincidencia.component.css'],
  imports: [ReactiveFormsModule, NgIf],
  standalone: true
})
export class RegistrarTipoIncidenciaComponent {
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  tipoForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private service: MantenimientoService) {
    this.tipoForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  registrar(): void {
    if (this.tipoForm.invalid) return;

    const data = {
      nombre: this.tipoForm.value.nombre
    };

    this.loading = true;
    this.service.registrarTipoIncidencia(data).subscribe({
      next: () => {
        this.loading = false;
        this.onRegistroExitoso.emit();
      },
      error: err => {
        console.error(err);
        this.error = 'Error al registrar el tipo de incidencia.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}
