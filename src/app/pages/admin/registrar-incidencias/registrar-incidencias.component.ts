import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { HabitacionesService, Habitacion } from '../../../service/habitaciones.service'; // aquí se importa tu servicio real
import { MantenimientoService } from '../../../service/mantenimiento.service';

@Component({
  selector: 'app-registrar-incidencia',
  templateUrl: './registrar-incidencias.component.html',
  styleUrls: ['./registrar-incidencias.component.css'],
  standalone: false,
})
export class RegistrarIncidenciaComponent implements OnInit {
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  incidenciaForm: FormGroup;
  loading = false;
  error = '';

  habitaciones: Habitacion[] = [];
  tiposIncidencia: any[] = [];
  areas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private habitacionesService: HabitacionesService
  ) {
    this.incidenciaForm = this.fb.group({
      fecha_registro: [{ value: this.getCurrentDateTime(), disabled: true }],
      fecha_solucion: [''],
      descripcion: ['', Validators.required],
      id_habitacion: [null],
      id_tipo_incidencia: [null],
      id_area: [null]
    });
  }

  ngOnInit(): void {
    this.cargarListas();
  
    this.incidenciaForm.get('id_habitacion')?.valueChanges.subscribe(value => {
      if (value) {
        this.incidenciaForm.get('id_area')?.disable();
      } else {
        this.incidenciaForm.get('id_area')?.enable();
      }
    });
  
    this.incidenciaForm.get('id_area')?.valueChanges.subscribe(value => {
      if (value) {
        this.incidenciaForm.get('id_habitacion')?.disable();
      } else {
        this.incidenciaForm.get('id_habitacion')?.enable();
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
    this.habitacionesService.getHabitaciones().subscribe(data => this.habitaciones = data);
    this.mantenimientoService.getTiposIncidencia().subscribe(data => this.tiposIncidencia = data);
    this.mantenimientoService.getAreasHotel().subscribe(data => this.areas = data);
  }

  registrar(): void {
    if (this.incidenciaForm.invalid) return;

    const fecha_registro = this.incidenciaForm.get('fecha_registro')?.value || this.getCurrentDateTime();

    const data = {
      fecha_registro: fecha_registro,
      fecha_solucion: this.incidenciaForm.value.fecha_solucion,
      estado_incidencia: this.incidenciaForm.value.estado_incidencia,
      descripcion: this.incidenciaForm.value.descripcion,
      habitacion: this.incidenciaForm.value.id_habitacion ? { id_habitacion: this.incidenciaForm.value.id_habitacion } : null,
      tipoIncidencia: this.incidenciaForm.value.id_tipo_incidencia ? { id_tipo_incidencia: this.incidenciaForm.value.id_tipo_incidencia } : null,
      area: this.incidenciaForm.value.id_area ? { id_area: this.incidenciaForm.value.id_area } : null,
    };

    this.loading = true;
    this.mantenimientoService.registrarIncidencia(data).subscribe({
      next: () => {
        this.loading = false;
        this.onRegistroExitoso.emit();
      },
      error: err => {
        console.error(err);
        this.error = 'Error al registrar la incidencia.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}
