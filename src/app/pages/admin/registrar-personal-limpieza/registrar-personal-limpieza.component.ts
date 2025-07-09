import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';

@Component({
  selector: 'app-registrar-personal-limpieza',
  templateUrl: './registrar-personal-limpieza.component.html',
  styleUrls: ['./registrar-personal-limpieza.component.css'],
  standalone: false,
})
export class RegistrarPersonalLimpiezaComponent implements OnChanges {
  @Input() personalEditar: any = null;
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  personalLimpiezaForm: FormGroup;
  loading = false;
  error = '';
  modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService
  ) {
    this.personalLimpiezaForm = this.fb.group({
      nombres: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['personalEditar'] && this.personalEditar) {
      this.modoEdicion = true;
      this.personalLimpiezaForm.patchValue({
        nombres: this.personalEditar.nombres
      });
    } else {
      this.modoEdicion = false;
      this.personalLimpiezaForm.reset();
    }
  }

  guardar(): void {
    if (this.personalLimpiezaForm.invalid) return;

    const data = {
      nombres: this.personalLimpiezaForm.value.nombres
    };

    this.loading = true;

    if (this.modoEdicion) {
      this.mantenimientoService.actualizarPersonalLimpieza(this.personalEditar.id_personal_limpieza, data).subscribe({
        next: () => {
          this.loading = false;
          this.onRegistroExitoso.emit();
        },
        error: err => {
          console.error(err);
          this.error = 'Error al actualizar personal.';
          this.loading = false;
        }
      });
    } else {
      this.mantenimientoService.registrarPersonalLimpieza(data).subscribe({
        next: () => {
          this.loading = false;
          this.onRegistroExitoso.emit();
        },
        error: err => {
          console.error(err);
          this.error = 'Error al registrar personal.';
          this.loading = false;
        }
      });
    }
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}
