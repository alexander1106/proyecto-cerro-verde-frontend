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
import { SalonesService, Salones, SalonReserva } from '../../../../../service/salones.service';
import { ClientesService, Cliente } from '../../../../../service/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-salon-reserva-form',
  standalone: false,
  templateUrl: './salon-reserva-form.component.html',
  styleUrls: ['./salon-reserva-form.component.css']
})
export class SalonReservaFormComponent implements OnInit {
  reservaForm!: FormGroup;
  salones: Salones[] = [];
  clientes: Cliente[] = [];
  loading = false;
  submitting = false;
  error = '';
  isEditing = false;
  id: number | null = null;
  filtroSalones: string = '';

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private salonesService: SalonesService,
    private clientesService: ClientesService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadClientes();
    this.loadSalones();

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
      salones: this.fb.array([], Validators.required)
    });
  }

  get salonesArray(): FormArray {
    return this.reservaForm.get('salones') as FormArray;
  }

  toggleSalon(salon: Salones): void {
    const index = this.salonesArray.controls.findIndex(
      control => control.value.id_salon === salon.id_salon
    );

    if (this.salonesArray.length <= 1 && index !== -1) {
      Swal.fire('No puedes quitar este salón', 'Debe haber al menos un salón seleccionado', 'warning');
      return;
    }

    if (index === -1) {
      this.salonesArray.push(this.fb.control(salon));
      salon.estado_salon = 'Reservado';
      this.salonesService.updateSalon(salon).subscribe({
        next: () => console.log(`Salón ${salon.nombre} actualizado a Reservado`),
        error: err => console.error(`Error al actualizar salón ${salon.nombre}: `, err)
      });
    } else {
      this.salonesArray.removeAt(index);
      salon.estado_salon = 'Disponible';
      this.salonesService.updateSalon(salon).subscribe({
        next: () => console.log(`Salón ${salon.nombre} actualizado a Disponible`),
        error: err => console.error(`Error al actualizar salón ${salon.nombre}: `, err)
      });
    }
  }

  loadClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: data => this.clientes = [...data],
      error: err => this.error = 'Error al cargar los clientes: ' + err.message
    });
  }

  loadSalones(): void {
    this.salonesService.getSalones().subscribe({
      next: data => {
        this.salones = data.filter(s => s.estado === 1 && s.estado_salon === 'Disponible');
      },
      error: err => this.error = 'Error al cargar los salones: ' + err.message
    });
  }

  loadReserva(id: number): void {
    this.loading = true;
    this.reservasService.getReservaById(id).subscribe({
      next: reserva => {
        const salonesReserva = reserva.salonesXReserva || [];
        salonesReserva.forEach(sr => {
          this.salonesArray.push(this.fb.control(sr.salon));
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
    if (this.reservaForm.invalid || this.salonesArray.length === 0) {
      this.markFormGroupTouched(this.reservaForm);
      this.error = 'Complete todos los campos requeridos y seleccione al menos un salón.';
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
      tipo: 'Salón',
      cliente
    };

    const action$ = this.isEditing && this.id
      ? this.reservasService.updateReserva(this.id, { ...reserva, id_reserva: this.id })
      : this.reservasService.createReserva(reserva);

    action$.subscribe({
      next: res => {
        if (this.isEditing && this.id) {
          this.salonesService.deleteSalonesByReserva(this.id).subscribe({
            next: () => this.guardarNuevosSalones(res),
            error: err => {
              this.error = 'Error al eliminar salones anteriores: ' + err.message;
              this.submitting = false;
            }
          });
        } else {
          this.guardarNuevosSalones(res);
        }
      },
      error: err => {
        this.error = 'Error al guardar la reserva: ' + err.message;
        this.submitting = false;
      }
    });
  }

  guardarNuevosSalones(reserva: Reserva): void {
    const salonesReservados: SalonReserva[] = this.salonesArray.value.map((salon: Salones) => {
      const salonActualizado = { ...salon, estado_salon: 'Reservado' };

      this.salonesService.updateSalon(salonActualizado).subscribe({
        next: () => console.log(`Salón ${salon.nombre} actualizado a Reservado`),
        error: err => console.error(`Error al actualizar salón ${salon.nombre}: `, err)
      });

      return {
        salon,
        reserva,
        estado: 1
      };
    });

    const total = salonesReservados.length;
    let exitos = 0;

    salonesReservados.forEach(sr => {
      this.salonesService.createSalonReserva(sr).subscribe({
        next: () => {
          exitos++;
          if (exitos === total) {
            this.submitting = false;
            Swal.fire('Éxito', 'Reserva guardada correctamente', 'success');
            this.router.navigate(['/admin/reservas']);
          }
        },
        error: err => {
          this.error = 'Error al asociar salones a la reserva: ' + err.message;
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

  isSalonSelected(salon: Salones): boolean {
    return this.salonesArray.value.some((s: Salones) => s.id_salon === salon.id_salon);
  }

  salonesFiltrados(): Salones[] {
    const filtro = this.filtroSalones?.toLowerCase() || '';
    return this.salones.filter(s =>
      s.nombre?.toLowerCase().includes(filtro)
    );
  }

  customSearch(term: string, item: any): boolean {
    term = term.toLowerCase();
    return item.nombre.toLowerCase().includes(term) ||
      (item.dniRuc && item.dniRuc.toLowerCase().includes(term));
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

  compareClientes(c1: any, c2: any): boolean {
    return c1 && c2 ? c1 === c2 : c1 === c2;
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

