import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';
import { HabitacionesService, Habitacion, HabitacionReserva } from '../../../../../service/habitaciones.service';
import { ClientesService, Cliente } from '../../../../../service/clientes.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-habitacion-reserva-form',
  standalone:false,
  templateUrl: './habitacion-reserva-form.component.html',
  styleUrls: ['./habitacion-reserva-form.component.css']
})
export class HabitacionReservaFormComponent implements OnInit {
  reservaForm!: FormGroup;
  habitaciones: Habitacion[] = [];
  clientes: Cliente[] = [];
  habitacionesOriginales: { id_habitacion: number, id_habitacionreserva: number }[] = [];
  filtroHabitaciones = '';
  loading = false;
  submitting = false;
  isEditing = false;
  id: number | null = null;
  error = '';

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private habitacionesService: HabitacionesService,
    private clientesService: ClientesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadClientes();

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.isEditing = true;
      this.loadReserva(this.id);
    } else {
      this.loadHabitaciones();
    }
  }

  createForm(): void {
    this.reservaForm = this.fb.group({
      cliente: [null, Validators.required],
      fecha_inicio: ['', [Validators.required, fechaNoPasada()]],
      fecha_fin: ['', Validators.required],
      estado_reserva: ['Pendiente', Validators.required],
      comentarios: [''],
      habitaciones: this.fb.array([])
    }, {
      validators: [fechaFinMayorQueInicio()]
    });

    this.reservaForm.get('fecha_inicio')?.valueChanges.subscribe(() => {
      this.reservaForm.get('fecha_fin')?.updateValueAndValidity();
    });
  }

  get habitacionesArray(): FormArray {
    return this.reservaForm.get('habitaciones') as FormArray;
  }

  toggleHabitacion(habitacion: Habitacion): void {
    const index = this.habitacionesArray.controls.findIndex(ctrl => ctrl.value.id_habitacion === habitacion.id_habitacion);

    if (index !== -1 && this.habitacionesArray.length <= 1) {
      Swal.fire('No puedes quitar esta habitación', 'Debe haber al menos una habitación seleccionada', 'warning');
      return;
    }

    if (index === -1) {
      // Agregar habitación
      this.habitacionesArray.push(this.fb.control(habitacion));
    } else {
      // Quitar habitación
      this.habitacionesArray.removeAt(index);
      
      // Si estamos editando y quitamos una habitación original, marcarla como disponible
      if (this.isEditing && this.habitacionesOriginales.some(h => h.id_habitacion === habitacion.id_habitacion)) {
        habitacion.estado_habitacion = 'Disponible';
      }
    }

    this.habitacionesService.updateHabitacion(habitacion).subscribe({
      next: () => console.log(`Estado actualizado: ${habitacion.numero} => ${habitacion.estado_habitacion}`),
      error: err => console.error(`Error actualizando habitación: ${err.message}`)
    });
  }

  loadClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: data => this.clientes = [...data],
      error: err => this.error = 'Error al cargar clientes: ' + err.message
    });
  }

  loadHabitaciones(): void {
    this.habitacionesService.getHabitaciones().subscribe({
      next: data => {
        const idsOriginales = this.habitacionesOriginales.map(h => h.id_habitacion);
        this.habitaciones = data.filter(h =>
          h.estado === 1 &&
          (h.estado_habitacion === 'Disponible' || idsOriginales.includes(h.id_habitacion!))
        );
      },
      error: err => this.error = 'Error al cargar las habitaciones: ' + err.message
    });
  }

  loadReserva(id: number): void {
    this.loading = true;
    this.reservasService.getReservaById(id).subscribe({
      next: reserva => {
        const relacionesActivas = (reserva.habitacionesXReserva || [])
          .filter(hr => hr.estado === 1);

        relacionesActivas.forEach(hr => {
          this.habitacionesArray.push(this.fb.control(hr.habitacion));
          if (hr.id_hab_reserv != null) {
            this.habitacionesOriginales.push({
              id_habitacion: hr.habitacion.id_habitacion!,
              id_habitacionreserva: hr.id_hab_reserv
            });
          }
          
        });

        this.reservaForm.patchValue({
          fecha_inicio: this.formatDateForInput(reserva.fecha_inicio as string),
          fecha_fin: this.formatDateForInput(reserva.fecha_fin as string),
          estado_reserva: reserva.estado_reserva,
          comentarios: reserva.comentarios,
          cliente: reserva.cliente.idCliente
        });

        this.loadHabitaciones();
        this.loading = false;
      },
      error: err => {
        this.error = 'Error al cargar la reserva: ' + err.message;
        this.loading = false;
      }
    });
  }

  formatDateForInput(date: string): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}T${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  onSubmit(): void {
    if (this.reservaForm.invalid || this.habitacionesArray.length === 0) {
      this.markFormGroupTouched(this.reservaForm);
      this.error = 'Complete todos los campos requeridos y seleccione al menos una habitación.';
      return;
    }

    this.submitting = true;
    const formValue = this.reservaForm.value;
    const cliente = this.clientes.find(c => c.idCliente === formValue.cliente)!;

    const reserva: Reserva = {
      fecha_inicio: new Date(formValue.fecha_inicio),
      fecha_fin: new Date(formValue.fecha_fin),
      estado_reserva: formValue.estado_reserva,
      comentarios: formValue.comentarios,
      estado: 1,
      tipo: 'Habitación',
      cliente
    };

    const action$ = this.isEditing && this.id
      ? this.reservasService.updateReserva(this.id, { ...reserva, id_reserva: this.id })
      : this.reservasService.createReserva(reserva);

    action$.subscribe({
      next: res => this.manejarHabitaciones(res),
      error: err => this.mostrarError('Error al guardar la reserva: ' + err.message)
    });
  }

  private manejarHabitaciones(reserva: Reserva): void {
    const habitacionesSeleccionadas = this.habitacionesArray.value as Habitacion[];
    const idsSeleccionados = habitacionesSeleccionadas
      .map(h => h.id_habitacion)
      .filter((id): id is number => id !== undefined);

    const habitacionesParaReservar = habitacionesSeleccionadas.map(habitacion => {
      habitacion.estado_habitacion = 'Reservada';
      return habitacion;
    });

    const habitacionesParaLiberar = this.isEditing 
      ? this.habitacionesOriginales
          .filter(original => !idsSeleccionados.includes(original.id_habitacion))
          .map(original => {
            const habitacion = this.habitaciones.find(h => h.id_habitacion === original.id_habitacion)!;
            habitacion.estado_habitacion = 'Disponible';
            return habitacion;
          })
      : [];

    forkJoin([
      ...habitacionesParaReservar.map(h => this.habitacionesService.updateHabitacion(h)),
      ...habitacionesParaLiberar.map(h => this.habitacionesService.updateHabitacion(h))
    ]).subscribe({
      next: () => this.manejarRelacionesHabitaciones(reserva, idsSeleccionados),
      error: err => this.mostrarError('Error al actualizar estados de habitación: ' + err.message)
    });
  }

  private manejarRelacionesHabitaciones(reserva: Reserva, idsSeleccionados: number[]): void {
    if (!this.isEditing) {
      const nuevasRelaciones = this.habitacionesArray.value.map((habitacion: Habitacion) => ({
        habitacion,
        reserva,
        estado: 1
      }));

      forkJoin(
        nuevasRelaciones.map((hr: HabitacionReserva) => this.habitacionesService.createHabitacionReserva(hr))
      ).subscribe({
        next: () => this.finalizarGuardado(),
        error: err => this.mostrarError('Error al crear relaciones: ' + err.message)
      });
    } else {
      const relacionesAEliminar = this.habitacionesOriginales
        .filter(original => 
          !idsSeleccionados.includes(original.id_habitacion) &&
          original.id_habitacionreserva !== null &&
          original.id_habitacionreserva !== undefined
        );

      const relacionesACrear = this.habitacionesArray.value
        .filter((habitacion: Habitacion) => habitacion.id_habitacion !== undefined && 
              !this.habitacionesOriginales.some(o => o.id_habitacion === habitacion.id_habitacion))
        .map((habitacion: Habitacion) => ({
          habitacion,
          reserva,
          estado: 1
        }));

      if (relacionesAEliminar.length === 0) {
        this.crearNuevasRelaciones(relacionesACrear);
      } else {
        forkJoin(
          relacionesAEliminar.map(rel => 
            this.habitacionesService.deleteHabitacionReserva(rel.id_habitacionreserva)
          )
        ).subscribe({
          next: () => this.crearNuevasRelaciones(relacionesACrear),
          error: err => this.mostrarError('Error al eliminar relaciones: ' + err.message)
        });
      }
    }
  }

  private crearNuevasRelaciones(relaciones: HabitacionReserva[]): void {
    if (relaciones.length === 0) { 
        this.finalizarGuardado();
        return;
        }

forkJoin(
relaciones.map((hr: HabitacionReserva) =>
  this.habitacionesService.createHabitacionReserva(hr)
)
).subscribe({
next: () => this.finalizarGuardado(),
error: err => this.mostrarError('Error al crear nuevas relaciones: ' + err.message)
});
}

private finalizarGuardado(): void {
Swal.fire({
icon: 'success',
title: 'Reserva guardada',
text: 'La reserva se guardó correctamente'
}).then(() => {
this.router.navigate(['/admin/reservas']);
});
this.submitting = false;
}

private mostrarError(mensaje: string): void {
this.error = mensaje;
this.submitting = false;
Swal.fire('Error', mensaje, 'error');
}

private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
Object.values(formGroup.controls).forEach(control => {
if (control instanceof FormGroup || control instanceof FormArray) {
  this.markFormGroupTouched(control);
} else {
  control.markAsTouched();
}
});
}


  isHabitacionSelected(habitacion: Habitacion): boolean {
    return this.habitacionesArray.value.some((s: Habitacion) => s.id_habitacion === habitacion.id_habitacion);
  }

  habitacionesFiltradas(): Habitacion[] {
    const filtro = this.filtroHabitaciones?.toLowerCase() || '';
    return this.habitaciones.filter(s => s.numero?.toString().includes(filtro));
  }

  customSearch(term: string, item: any): boolean {
    term = term.toLowerCase();
    return item.nombre.toLowerCase().includes(term) || (item.dniRuc?.toLowerCase().includes(term));
  }

  redirigirACrearCliente(): void {
    this.router.navigate(['/admin/recepcion/clientes/crear']);
  }

  onCancel(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Perderás los datos no guardados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['/admin/reservas']);
      }
    });
  }
}

function fechaNoPasada(): ValidatorFn {
return (control: AbstractControl) => {
const fecha = new Date(control.value);
return fecha < new Date() ? { fechaPasada: true } : null;
};
}

function fechaFinMayorQueInicio(): ValidatorFn {
return (group: AbstractControl) => {
const inicio = new Date(group.get('fecha_inicio')?.value);
const fin = new Date(group.get('fecha_fin')?.value);
return fin <= inicio ? { fechaInvalida: true } : null;
};
}
