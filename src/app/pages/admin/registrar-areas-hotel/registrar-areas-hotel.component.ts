import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-registrar-area-hotel',
  templateUrl: './registrar-areas-hotel.component.html',
  styleUrls: ['./registrar-areas-hotel.component.css'],
  imports: [ReactiveFormsModule, NgIf],
  standalone: true
})
export class RegistrarAreaHotelComponent {
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  areaForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private service: MantenimientoService) {
    this.areaForm = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  registrar(): void {
    if (this.areaForm.invalid) return;

    this.loading = true;
    const payload = {
      nombre: this.areaForm.value.nombre,
    };

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

  cancelar(): void {
    this.onCancelar.emit();
  }
}
