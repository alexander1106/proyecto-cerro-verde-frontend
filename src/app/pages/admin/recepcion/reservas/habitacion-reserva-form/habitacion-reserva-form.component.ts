import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';
import { HabitacionesService, Habitacion, HabitacionReserva } from '../../../../../service/habitaciones.service';
import { ClientesService, Cliente } from '../../../../../service/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-habitacion-reserva-form',
  standalone: false,
  templateUrl: './habitacion-reserva-form.component.html',
  styleUrls: ['./habitacion-reserva-form.component.css']
})
export class HabitacionReservaFormComponent implements OnInit {
  reservaForm!: FormGroup;
  habitaciones: Habitacion[] = [];
  clientes: Cliente[] = [];
  loading = false;
  submitting = false;
  error = '';
  isEditing = false;
  id: number | null = null;
  filtroHabitaciones: string = '';
  private habitacionesOriginales: Habitacion[] = [];


  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private habitacionesService: HabitacionesService,
    private clientesService: ClientesService,
    private route: ActivatedRoute,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadClientes();
    this.loadHabitaciones();

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.isEditing = true;
      this.loadReserva(this.id);
    }
  }

  createForm(): void {
    this.reservaForm = this.fb.group({
      cliente: [null, Validators.required],
      fecha_inicio: ['', [Validators.required, fechaNoPasada()]],
      fecha_fin: ['', Validators.required],
      estado_reserva: ['Pendiente', Validators.required],
      comentarios: [''],
      habitaciones: this.fb.array([], Validators.required)
    });
  }

  get habitacionesArray(): FormArray {
    return this.reservaForm.get('habitaciones') as FormArray;
  }

  toggleHabitacion(habitacion: Habitacion): void {
    const index = this.habitacionesArray.controls.findIndex(
      control => control.value.id_habitacion === habitacion.id_habitacion
    );

    // Prevent removing if there's only one selected room
    if (this.habitacionesArray.length <= 1 && index !== -1) {
      Swal.fire('No puedes quitar esta habitación', 'Debe haber al menos una habitación seleccionada', 'warning');
      return;
    }

    if (index === -1) {
      // Agregar habitación seleccionada
      this.habitacionesArray.push(this.fb.control(habitacion));

      // Actualizar estado de la habitación en el backend
      habitacion.estado_habitacion = 'Reservada';
      this.habitacionesService.updateHabitacion(habitacion).subscribe({
        next: () => console.log(`Habitación ${habitacion.numero} actualizada a Reservada`),
        error: err => console.error(`Error al actualizar habitación ${habitacion.numero}: `, err)
      });
    } else {
      // Eliminar habitación desmarcada
      this.habitacionesArray.removeAt(index);

      // Actualizar estado de la habitación en el backend
      habitacion.estado_habitacion = 'Disponible';
      this.habitacionesService.updateHabitacion(habitacion).subscribe({
        next: () => console.log(`Habitación ${habitacion.numero} actualizada a Disponible`),
        error: err => console.error(`Error al actualizar habitación ${habitacion.numero}: `, err)
      });
    }
  }

  redirigirACrearCliente(): void {
    this.router.navigate(['/admin/recepcion/clientes/crear']);
  }

  loadClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = [...data];
      },
      error: (err) => {
        this.error = 'Error al cargar los clientes: ' + err.message;
      }
    });
  }

  loadHabitaciones(): void {
    this.habitacionesService.getHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data.filter(h => h.estado === 1 && h.estado_habitacion === 'Disponible');
      },
      error: (err) => {
        this.error = 'Error al cargar las habitaciones: ' + err.message;
      }
    });
  }

  loadReserva(id: number): void {
    this.loading = true;
    this.reservasService.getReservaById(id).subscribe({
      next: (reserva) => {
        const habitacionesReserva = reserva.habitacionesXReserva || [];
        this.habitacionesOriginales = habitacionesReserva.map(hr => hr.habitacion);

        habitacionesReserva.forEach(hr => {
          const yaAgregada = this.habitacionesArray.value.some(
            (h: Habitacion) => h.id_habitacion === hr.habitacion.id_habitacion
          );
          if (!yaAgregada) {
            this.habitacionesArray.push(this.fb.control(hr.habitacion));
          }
        });

        this.reservaForm.patchValue({
          fecha_inicio: this.formatDateForInput(reserva.fecha_inicio as string),
          fecha_fin: this.formatDateForInput(reserva.fecha_fin as string),
          estado_reserva: reserva.estado_reserva,
          comentarios: reserva.comentarios,
          cliente: reserva.cliente.idCliente
        });
        this.loading = false;
      },
      error: (err) => {
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
      this.error = 'Por favor, complete todos los campos requeridos y seleccione al menos una habitación.';
      return;
    }

    this.submitting = true;
    const formValue = this.reservaForm.value;
    const clienteSeleccionado = this.clientes.find(c => c.idCliente === formValue.cliente);

    const reserva: Reserva = {
      fecha_inicio: new Date(formValue.fecha_inicio),
      fecha_fin: new Date(formValue.fecha_fin),
      estado_reserva: formValue.estado_reserva,
      comentarios: formValue.comentarios,
      estado: 1,
      tipo: 'Habitación',
      cliente: clienteSeleccionado!
    };

    if (this.isEditing && this.id) {
      reserva.id_reserva = this.id;
      this.reservasService.updateReserva(this.id, reserva).subscribe({
        next: (updatedReserva) => {
          this.createOrUpdateHabitacionesReserva(updatedReserva);
        },
        error: (err) => {
          this.error = 'Error al actualizar la reserva: ' + err.message;
          this.submitting = false;
        }
      });
    } else {
      this.reservasService.createReserva(reserva).subscribe({
        next: (newReserva) => {
          this.createOrUpdateHabitacionesReserva(newReserva);
        },
        error: (err) => {
          this.error = 'Error al crear la reserva: ' + err.message;
          this.submitting = false;
        }
      });
    }
  }

  createOrUpdateHabitacionesReserva(reserva: Reserva): void {
    if (this.isEditing && reserva.id_reserva) {
      // Eliminar asociaciones anteriores antes de crear las nuevas
      this.habitacionesService.deleteHabitacionesByReserva(reserva.id_reserva).subscribe({
        next: () => this.guardarNuevasHabitaciones(reserva),
        error: err => {
          this.error = 'Error al eliminar habitaciones anteriores: ' + err.message;
          this.submitting = false;
        }
      });
    } else {
      this.guardarNuevasHabitaciones(reserva);
    }
  }

  guardarNuevasHabitaciones(reserva: Reserva): void {
    const habitacionesReservadas: HabitacionReserva[] = this.habitacionesArray.value.map((habitacion: Habitacion) => {
      const habitacionActualizada = { ...habitacion, estado_habitacion: 'Reservada' };

      this.habitacionesService.updateHabitacion(habitacionActualizada).subscribe({
        next: () => console.log(`Habitación ${habitacion.numero} actualizada a Reservada`),
        error: err => console.error(`Error al actualizar habitación ${habitacion.numero}: `, err)
      });

      return {
        habitacion,
        reserva,
        estado: 1
      };
    });

    const total = habitacionesReservadas.length;
    let exitos = 0;

    habitacionesReservadas.forEach(habRes => {
      this.habitacionesService.createHabitacionReserva(habRes).subscribe({
        next: () => {
          exitos++;
          if (exitos === total) {
            this.submitting = false;
            Swal.fire('Éxito', 'Reserva actualizada correctamente', 'success');
            this.router.navigate(['/admin/reservas']);
          }
        },
        error: err => {
          this.error = 'Error al asociar habitaciones a la reserva: ' + err.message;
          this.submitting = false;
        }
      });
    });
  }




  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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

  compareClientes(c1: any, c2: any): boolean {
    return c1 && c2 ? c1 === c2 : c1 === c2;
  }

  isHabitacionSelected(habitacion: Habitacion): boolean {
    return this.habitacionesArray.value.some(
      (h: Habitacion) => h.id_habitacion === habitacion.id_habitacion
    );
  }

  habitacionesFiltradas(): Habitacion[] {
    const filtro = this.filtroHabitaciones?.toLowerCase() || '';
    return this.habitaciones.filter(h =>
      h.numero?.toString().includes(filtro) ||
      h.tipo_habitacion?.nombre?.toLowerCase().includes(filtro) ||
      h.piso?.toString().includes(filtro)
    );
  }

  customSearch(term: string, item: any): boolean {
    term = term.toLowerCase();
    return item.nombre.toLowerCase().includes(term) ||
      (item.dniRuc && item.dniRuc.toLowerCase().includes(term));
  }
}

function fechaNoPasada(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    const ahora = new Date();
    const fechaInicio = new Date(control.value);
    return fechaInicio < ahora ? { fechaPasada: true } : null;
  };
}
