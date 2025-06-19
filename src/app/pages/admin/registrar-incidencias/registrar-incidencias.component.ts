import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HabitacionesService } from '../../../service/habitaciones.service';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { SalonesService } from '../../../service/salones.service';

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

  habitaciones: any[] = [];
  tiposIncidencia: any[] = [];
  areas: any[] = [];
  salones: any[] = [];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private habitacionesService: HabitacionesService,
    private salonesService: SalonesService
  ) {
    this.incidenciaForm = this.fb.group({
      fecha_registro: [{ value: this.getCurrentDateTime(), disabled: true }],
      fecha_solucion: [''],
      descripcion: ['', Validators.required],
      id_habitacion: [null],
      id_area: [null],
      id_salon: [null],
      id_tipo_incidencia: [null]
    });
  }

  ngOnInit(): void {
    this.cargarListas();

    // Unificar la lógica mutual exclusiva
    this.incidenciaForm.get('id_habitacion')?.valueChanges.subscribe(() => {
      this.actualizarCamposMutualmenteExclusivos();
    });

    this.incidenciaForm.get('id_area')?.valueChanges.subscribe(() => {
      this.actualizarCamposMutualmenteExclusivos();
    });

    this.incidenciaForm.get('id_salon')?.valueChanges.subscribe(() => {
      this.actualizarCamposMutualmenteExclusivos();
    });
  }

  actualizarCamposMutualmenteExclusivos(): void {
    const habitacionSeleccionada = this.incidenciaForm.get('id_habitacion')?.value;
    const areaSeleccionada = this.incidenciaForm.get('id_area')?.value;
    const salonSeleccionado = this.incidenciaForm.get('id_salon')?.value;

    if (habitacionSeleccionada) {
      this.incidenciaForm.get('id_area')?.disable({ emitEvent: false });
      this.incidenciaForm.get('id_salon')?.disable({ emitEvent: false });
    } else if (areaSeleccionada) {
      this.incidenciaForm.get('id_habitacion')?.disable({ emitEvent: false });
      this.incidenciaForm.get('id_salon')?.disable({ emitEvent: false });
    } else if (salonSeleccionado) {
      this.incidenciaForm.get('id_habitacion')?.disable({ emitEvent: false });
      this.incidenciaForm.get('id_area')?.disable({ emitEvent: false });
    } else {
      // Si nada seleccionado → habilitar todo
      this.incidenciaForm.get('id_habitacion')?.enable({ emitEvent: false });
      this.incidenciaForm.get('id_area')?.enable({ emitEvent: false });
      this.incidenciaForm.get('id_salon')?.enable({ emitEvent: false });
    }
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
    this.salonesService.getSalones().subscribe(data => this.salones = data);
  }

  registrar(): void {
    if (this.incidenciaForm.invalid) return;

    const fecha_registro = this.incidenciaForm.get('fecha_registro')?.value || this.getCurrentDateTime();

    const data = {
      fecha_registro: fecha_registro,
      fecha_solucion: this.incidenciaForm.value.fecha_solucion,
      descripcion: this.incidenciaForm.value.descripcion,
      tipoIncidencia: this.incidenciaForm.value.id_tipo_incidencia ? { id_tipo_incidencia: this.incidenciaForm.value.id_tipo_incidencia } : null,
      habitacion: this.incidenciaForm.value.id_habitacion ? { id_habitacion: this.incidenciaForm.value.id_habitacion } : null,
      area: this.incidenciaForm.value.id_area ? { id_area: this.incidenciaForm.value.id_area } : null,
      salon: this.incidenciaForm.value.id_salon ? { id_salon: this.incidenciaForm.value.id_salon } : null
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
