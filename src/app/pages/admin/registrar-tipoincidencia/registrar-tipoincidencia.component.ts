import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';

@Component({
  selector: 'app-registrar-tipo-incidencia',
  templateUrl: './registrar-tipoincidencia.component.html',
  styleUrls: ['./registrar-tipoincidencia.component.css'],
  standalone: false
})
export class RegistrarTipoIncidenciaComponent implements OnChanges {
  @Input() tipoEditar: any = null;
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  tipoForm: FormGroup;
  loading = false;
  error = '';
  modoEdicion = false;

  constructor(private fb: FormBuilder, private service: MantenimientoService) {
    this.tipoForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tipoEditar'] && this.tipoEditar) {
      this.modoEdicion = true;
      this.tipoForm.patchValue({
        nombre: this.tipoEditar.nombre
      });
    } else {
      this.modoEdicion = false;
      this.tipoForm.reset();
    }
  }

  guardar(): void {
    if (this.tipoForm.invalid) return;

    this.loading = true;
    this.error = '';
    const nombreIngresado = this.tipoForm.value.nombre.trim();

    // Validar duplicados antes de registrar o actualizar
    this.service.getTiposIncidencia().subscribe({
      next: (tipos) => {
        const existeNombre = tipos.some((tipo: any) => 
          tipo.nombre.toLowerCase() === nombreIngresado.toLowerCase() &&
          (!this.modoEdicion || tipo.id_tipo_incidencia !== this.tipoEditar.id_tipo_incidencia)
        );

        if (existeNombre) {
          this.error = 'El nombre del tipo de incidencia ya existe. Por favor elige otro.';
          this.loading = false;
          return;
        }

        const data = { nombre: nombreIngresado };

        if (this.modoEdicion) {
          this.service.actualizarTipoIncidencia(this.tipoEditar.id_tipo_incidencia, data).subscribe({
            next: () => {
              this.loading = false;
              this.onRegistroExitoso.emit();
            },
            error: err => {
              console.error(err);
              this.error = 'Error al actualizar el tipo de incidencia.';
              this.loading = false;
            }
          });
        } else {
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
      },
      error: err => {
        console.error(err);
        this.error = 'Error al verificar el nombre del tipo de incidencia.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}

