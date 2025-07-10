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

    this.loading = true;
    this.error = '';
    const nombreIngresado = this.personalLimpiezaForm.value.nombres.trim();

    // Verificar duplicados
    this.mantenimientoService.getPersonalLimpieza().subscribe({
      next: (personalList) => {
        const existe = personalList.some((p: any) =>
          p.nombres.toLowerCase() === nombreIngresado.toLowerCase() &&
          (!this.modoEdicion || p.id_personal_limpieza !== this.personalEditar.id_personal_limpieza)
        );

        if (existe) {
          this.error = 'El nombre del personal ya existe. Por favor usa otro.';
          this.loading = false;
          return;
        }

        const data = {
          nombres: nombreIngresado
        };

        if (this.modoEdicion) {
          this.mantenimientoService.actualizarPersonalLimpieza(this.personalEditar.id_personal_limpieza, data).subscribe({
            next: () => {
              this.loading = false;
              this.onRegistroExitoso.emit();
            },
            error: err => {
              console.error(err);
              this.error = 'Error al actualizar el personal.';
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
              this.error = 'Error al registrar el personal.';
              this.loading = false;
            }
          });
        }
      },
      error: err => {
        console.error(err);
        this.error = 'Error al verificar el nombre del personal.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}

