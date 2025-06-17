import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';

@Component({
  selector: 'app-registrar-limpieza',
  templateUrl: './registrar-limpiezas.component.html',
  styleUrls: ['./registrar-limpiezas.component.css'],
  standalone: false
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
      idUsuario: [null, Validators.required],     // ← cambiados a camelCase
      idHabitacion: [null, Validators.required]
    });
  }

  registrar(): void {
    if (this.limpiezaForm.invalid) return;

    const data = {
      fecha_hora_limpieza: this.limpiezaForm.value.fecha_hora_limpieza,
      observaciones: this.limpiezaForm.value.observaciones,
      usuario: {
        idUsuario: this.limpiezaForm.value.idUsuario     // ← importante
      },
      habitacion: {
        idHabitacion: this.limpiezaForm.value.idHabitacion
      }
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
