import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HabitacionesService } from '../../../service/habitaciones.service';
import { MantenimientoService } from '../../../service/mantenimiento.service';
import { SalonesService } from '../../../service/salones.service';
import { LoginService } from '../../../service/login.service';

@Component({
  selector: 'app-registrar-incidencia',
  templateUrl: './registrar-incidencias.component.html',
  styleUrls: ['./registrar-incidencias.component.css'],
  standalone: false,
})
export class RegistrarIncidenciaComponent implements OnInit, OnChanges {
  @Input() incidenciaEditar: any = null;
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
    private salonesService: SalonesService,
    private loginService: LoginService
  ) {
    this.incidenciaForm = this.fb.group({
      fecha_registro: [this.getCurrentDateTime(), Validators.required],
      fecha_solucion: [''],
      descripcion: ['', Validators.required],
      id_habitacion: [null],
      id_area: [null],
      id_salon: [null],
      id_tipo_incidencia: [null, Validators.required],
      gravedad: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarListas();
    this.suscribirCamposMutuos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incidenciaEditar'] && this.incidenciaEditar) {
      const fecha = new Date(this.incidenciaEditar.fecha_registro);
      const formattedDate = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}T${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
      this.incidenciaForm.patchValue({
        fecha_registro: formattedDate,
        descripcion: this.incidenciaEditar.descripcion,
        id_tipo_incidencia: this.incidenciaEditar.tipoIncidencia?.id_tipo_incidencia || null,
        gravedad: this.incidenciaEditar.gravedad,
        id_habitacion: this.incidenciaEditar.habitacion?.id_habitacion || null,
        id_area: this.incidenciaEditar.area?.id_area || null,
        id_salon: this.incidenciaEditar.salon?.id_salon || null
      });
    }
  }

  suscribirCamposMutuos(): void {
    this.incidenciaForm.get('id_habitacion')?.valueChanges.subscribe(() => this.actualizarCamposMutuamenteExclusivos());
    this.incidenciaForm.get('id_area')?.valueChanges.subscribe(() => this.actualizarCamposMutuamenteExclusivos());
    this.incidenciaForm.get('id_salon')?.valueChanges.subscribe(() => this.actualizarCamposMutuamenteExclusivos());
  }

  actualizarCamposMutuamenteExclusivos(): void {
    const h = this.incidenciaForm.get('id_habitacion')?.value;
    const a = this.incidenciaForm.get('id_area')?.value;
    const s = this.incidenciaForm.get('id_salon')?.value;

    if (h) {
      this.incidenciaForm.get('id_area')?.disable({ emitEvent: false });
      this.incidenciaForm.get('id_salon')?.disable({ emitEvent: false });
    } else if (a) {
      this.incidenciaForm.get('id_habitacion')?.disable({ emitEvent: false });
      this.incidenciaForm.get('id_salon')?.disable({ emitEvent: false });
    } else if (s) {
      this.incidenciaForm.get('id_habitacion')?.disable({ emitEvent: false });
      this.incidenciaForm.get('id_area')?.disable({ emitEvent: false });
    } else {
      this.incidenciaForm.get('id_habitacion')?.enable({ emitEvent: false });
      this.incidenciaForm.get('id_area')?.enable({ emitEvent: false });
      this.incidenciaForm.get('id_salon')?.enable({ emitEvent: false });
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  cargarListas(): void {
    this.habitacionesService.getHabitaciones().subscribe(data => this.habitaciones = data);
    this.mantenimientoService.getTiposIncidencia().subscribe(data => this.tiposIncidencia = data);
    this.mantenimientoService.getAreasHotel().subscribe(data => this.areas = data);
    this.salonesService.getSalones().subscribe(data => this.salones = data);
  }

  guardar(): void {
    if (this.incidenciaForm.invalid) return;

    const data = {
      fecha_registro: this.incidenciaForm.value.fecha_registro,
      descripcion: this.incidenciaForm.value.descripcion,
      gravedad: this.incidenciaForm.value.gravedad,
      tipoIncidencia: this.incidenciaForm.value.id_tipo_incidencia ? { id_tipo_incidencia: this.incidenciaForm.value.id_tipo_incidencia } : null,
      habitacion: this.incidenciaForm.value.id_habitacion ? { id_habitacion: this.incidenciaForm.value.id_habitacion } : null,
      area: this.incidenciaForm.value.id_area ? { id_area: this.incidenciaForm.value.id_area } : null,
      salon: this.incidenciaForm.value.id_salon ? { id_salon: this.incidenciaForm.value.id_salon } : null
    };

    this.loading = true;

    const request$ = this.incidenciaEditar
      ? this.mantenimientoService.actualizarIncidencia(this.incidenciaEditar.id_incidencia, data)
      : this.mantenimientoService.registrarIncidencia(data);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.onRegistroExitoso.emit();
      },
      error: err => {
        console.error(err);
        this.error = this.incidenciaEditar ? 'Error al actualizar la incidencia.' : 'Error al registrar la incidencia.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }

}


