import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-registrar-limpieza',
  templateUrl: './registrar-limpiezas.component.html',
  styleUrls: ['./registrar-limpiezas.component.css'],
  imports: [ReactiveFormsModule, NgIf],
  standalone: true
})
export class RegistrarLimpiezaComponent {
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  limpiezaForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private service: MantenimientoService) {
    this.limpiezaForm = this.fb.group({
      fecha_hora_limpieza: ['', Validators.required],
      observaciones: ['', Validators.required],
      id_usuario: [null, Validators.required],
      id_habitacion: [null, Validators.required]
    });
  }

  registrar(): void {
    if (this.limpiezaForm.invalid) return;

    const data = {
      fecha_hora_limpieza: this.limpiezaForm.value.fecha_hora_limpieza,
      observaciones: this.limpiezaForm.value.observaciones,
      usuario: { id_usuario: this.limpiezaForm.value.id_usuario },
      habitacion: { id_habitacion: this.limpiezaForm.value.id_habitacion }
    };

    this.loading = true;
    this.service.registrarLimpieza(data).subscribe({
      next: () => {
        this.loading = false;
        this.onRegistroExitoso.emit();
      },
      error: err => {
        console.error(err);
        this.error = 'Error al registrar la limpieza.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}
