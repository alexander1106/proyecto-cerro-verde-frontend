import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { HabitacionesService } from '../../../service/habitaciones.service';
import { SalonesService } from '../../../service/salones.service';

@Component({
  selector: 'app-registrar-limpieza',
  templateUrl: './registrar-limpiezas.component.html',
  styleUrls: ['./registrar-limpiezas.component.css'],
  standalone: false,
})
export class RegistrarLimpiezaComponent implements OnInit {
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  limpiezaForm: FormGroup;
  loading = false;
  error = '';

  personalLimpieza: any[] = [];
  habitaciones: any[] = [];
  salones: any[] = [];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private habitacionesService: HabitacionesService,
    private salonesService: SalonesService
  ) {
    this.limpiezaForm = this.fb.group({
      fecha_hora_limpieza: [this.getCurrentDateTime(), Validators.required],
      observaciones: [''],
      id_personal_limpieza: [null, Validators.required],
      id_habitacion: [null],
      id_salon: [null]
    });
  }

  ngOnInit(): void {
    this.cargarListas();

    this.limpiezaForm.get('id_habitacion')?.valueChanges.subscribe(value => {
      if (value) {
        this.limpiezaForm.get('id_salon')?.disable();
      } else {
        this.limpiezaForm.get('id_salon')?.enable();
      }
    });

    this.limpiezaForm.get('id_salon')?.valueChanges.subscribe(value => {
      if (value) {
        this.limpiezaForm.get('id_habitacion')?.disable();
      } else {
        this.limpiezaForm.get('id_habitacion')?.enable();
      }
    });
  }

  getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  cargarListas(): void {
    this.mantenimientoService.getPersonalLimpieza().subscribe(data => this.personalLimpieza = data);
    this.habitacionesService.getHabitaciones().subscribe(data => this.habitaciones = data);
    this.salonesService.getSalones().subscribe(data => this.salones = data);
  }

  registrar(): void {
    if (this.limpiezaForm.invalid) return;

    const data = {
      fecha_hora_limpieza: this.limpiezaForm.value.fecha_hora_limpieza,
      observaciones: this.limpiezaForm.value.observaciones,
      personal: { id_personal_limpieza: this.limpiezaForm.value.id_personal_limpieza },
      habitacion: this.limpiezaForm.value.id_habitacion ? { id_habitacion: this.limpiezaForm.value.id_habitacion } : null,
      salon: this.limpiezaForm.value.id_salon ? { id_salon: this.limpiezaForm.value.id_salon } : null
    };

    this.loading = true;
    this.mantenimientoService.registrarLimpieza(data).subscribe({
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
