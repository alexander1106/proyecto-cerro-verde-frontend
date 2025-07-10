import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';

@Component({
  selector: 'app-registrar-area-hotel',
  templateUrl: './registrar-areas-hotel.component.html',
  styleUrls: ['./registrar-areas-hotel.component.css'],
  standalone: false
})
export class RegistrarAreaHotelComponent implements OnChanges {
  @Input() areaEditar: any = null;
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  areaForm: FormGroup;
  loading = false;
  error = '';
  modoEdicion = false;

  constructor(private fb: FormBuilder, private service: MantenimientoService) {
    this.areaForm = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['areaEditar'] && this.areaEditar) {
      this.modoEdicion = true;
      this.areaForm.patchValue({
        nombre: this.areaEditar.nombre
      });
    } else {
      this.modoEdicion = false;
      this.areaForm.reset();
    }
  }

  guardar(): void {
    if (this.areaForm.invalid) return;

    this.loading = true;
    this.error = '';
    const nombreIngresado = this.areaForm.value.nombre.trim();

    // Primero verificamos si existe ya un área con ese nombre
    this.service.getAreasHotel().subscribe({
      next: (areas) => {
        const nombreExiste = areas.some((area: any) => 
          area.nombre.toLowerCase() === nombreIngresado.toLowerCase() &&
          (!this.modoEdicion || area.id_area !== this.areaEditar.id_area)
        );

        if (nombreExiste) {
          this.error = 'El nombre del área ya existe. Por favor elige otro.';
          this.loading = false;
          return;
        }

        const payload = { nombre: nombreIngresado };

        if (this.modoEdicion) {
          this.service.actualizarAreaHotel(this.areaEditar.id_area, payload).subscribe({
            next: () => {
              this.loading = false;
              this.onRegistroExitoso.emit();
            },
            error: err => {
              console.error(err);
              this.error = 'Error al actualizar el área.';
              this.loading = false;
            }
          });
        } else {
          this.service.registrarAreaHotel(payload).subscribe({
            next: () => {
              this.loading = false;
              this.onRegistroExitoso.emit();
            },
            error: err => {
              console.error(err);
              this.error = 'Error al registrar el área.';
              this.loading = false;
            }
          });
        }
      },
      error: err => {
        console.error(err);
        this.error = 'Error al verificar el nombre del área.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}

