import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';

@Component({
  selector: 'app-registrar-personal-limpieza',
  templateUrl: './registrar-personal-limpieza.component.html',
  styleUrls: ['./registrar-personal-limpieza.component.css'],
  standalone: false,
})
export class RegistrarPersonalLimpiezaComponent {
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  personalLimpiezaForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService
  ) {
    this.personalLimpiezaForm = this.fb.group({
      nombres: ['', Validators.required]
    });
  }

  registrar(): void {
    if (this.personalLimpiezaForm.invalid) return;

    const data = {
      nombres: this.personalLimpiezaForm.value.nombres
    };

    this.loading = true;
    this.mantenimientoService.registrarPersonalLimpieza(data).subscribe({
      next: () => {
        this.loading = false;
        this.onRegistroExitoso.emit();
      },
      error: err => {
        console.error(err);
        this.error = 'Error al registrar personal de limpieza.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}
