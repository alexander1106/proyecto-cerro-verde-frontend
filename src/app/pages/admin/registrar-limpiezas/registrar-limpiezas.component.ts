import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnInit } from '@angular/core';
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
export class RegistrarLimpiezaComponent implements OnInit, OnChanges {
  @Input() limpiezaEditar: any = null;
  @Output() onRegistroExitoso = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  limpiezaForm: FormGroup;
  loading = false;
  error = '';

  personalLimpieza: any[] = [];
  habitaciones: any[] = [];
  salones: any[] = [];
  modoEdicion: boolean = false;


  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private habitacionesService: HabitacionesService,
    private salonesService: SalonesService
  ) {
    this.limpiezaForm = this.fb.group({
      fecha_limpieza: [this.getCurrentDateTime(), Validators.required],
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['limpiezaEditar']) {
      this.modoEdicion = !!this.limpiezaEditar;
  
      if (this.limpiezaEditar) {
        this.limpiezaForm.patchValue({
          fecha_limpieza: this.limpiezaEditar.fecha_registro,
          observaciones: this.limpiezaEditar.observaciones,
          id_personal_limpieza: this.limpiezaEditar.personal?.id_personal_limpieza || null,
          id_habitacion: this.limpiezaEditar.habitacion?.id_habitacion || null,
          id_salon: this.limpiezaEditar.salon?.id_salon || null
        });
  
        // 🔒 Desactivar campos si está en modo edición
        this.limpiezaForm.get('fecha_limpieza')?.disable();
        this.limpiezaForm.get('id_habitacion')?.disable();
        this.limpiezaForm.get('id_salon')?.disable();
      } else {
        this.limpiezaForm.enable(); // por si acaso
      }
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
    this.mantenimientoService.getPersonalLimpieza().subscribe(data => this.personalLimpieza = data);
    this.habitacionesService.getHabitaciones().subscribe(data => this.habitaciones = data);
    this.salonesService.getSalones().subscribe(data => this.salones = data);
  }

  guardar(): void {
    if (this.limpiezaForm.invalid) return;

    const data = {
      fecha_registro: this.limpiezaForm.value.fecha_limpieza,
      fecha_solucion: this.limpiezaEditar ? this.limpiezaEditar.fecha_solucion : null,
      observaciones: this.limpiezaForm.value.observaciones,
      estado_limpieza: this.limpiezaEditar ? this.limpiezaEditar.estado_limpieza : 'Pendiente',
      personal: { id_personal_limpieza: this.limpiezaForm.value.id_personal_limpieza },
      habitacion: this.limpiezaForm.value.id_habitacion ? { id_habitacion: this.limpiezaForm.value.id_habitacion } : null,
      salon: this.limpiezaForm.value.id_salon ? { id_salon: this.limpiezaForm.value.id_salon } : null
    };

    this.loading = true;

    const request$ = this.limpiezaEditar
      ? this.mantenimientoService.actualizarLimpieza(this.limpiezaEditar.id_limpieza, data)
      : this.mantenimientoService.registrarLimpieza(data);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.onRegistroExitoso.emit();
      },
      error: err => {
        console.error(err);
        this.error = this.limpiezaEditar ? 'Error al actualizar la limpieza.' : 'Error al registrar la limpieza.';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
  }
}
