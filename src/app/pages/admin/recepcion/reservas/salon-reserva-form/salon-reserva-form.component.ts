import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';
import { SalonesService, Salones, SalonReserva } from '../../../../../service/salones.service';
import { ClientesService, Cliente } from '../../../../../service/clientes.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-salon-reserva-form',
  standalone:false,
  templateUrl: './salon-reserva-form.component.html',
  styleUrls: ['./salon-reserva-form.component.css']
})
export class SalonReservaFormComponent implements OnInit {
  reservaForm!: FormGroup;
  nuevoClienteForm!: FormGroup;
  salones: Salones[] = [];
  clientes: Cliente[] = [];
  salonesOriginales: { id_salon: number, id_salonreserva: number }[] = [];
  filtroSalones = '';
  loading = false;
  submitting = false;
  isEditing = false;
  mostrarModalCliente = false;
  id: number | null = null;
  error = '';

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private salonesService: SalonesService,
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
      this.loadSalones();
    }
  }

  createForm(): void {
    this.reservaForm = this.fb.group({
      cliente: [null, Validators.required],
      fecha_inicio: ['', [Validators.required, fechaNoPasada()]],
      fecha_fin: ['', Validators.required],
      nro_persona: [1, [Validators.required, Validators.min(1)]],
      estado_reserva: ['Pendiente', Validators.required],
      comentarios: [''],
      salones: this.fb.array([])
    }, {
      validators: [fechaFinMayorQueInicio()]
    });

    this.reservaForm.get('fecha_inicio')?.valueChanges.subscribe(() => {
      this.reservaForm.get('fecha_fin')?.updateValueAndValidity();
    });
  }

  get salonesArray(): FormArray {
    return this.reservaForm.get('salones') as FormArray;
  }

    abrirModalCliente(): void {
      this.mostrarModalCliente = true;
      this.nuevoClienteForm.reset();
    }
  
    buscarDni(): void {
          const dni = this.nuevoClienteForm.get('dniRuc')?.value;
          if (!dni || !/^\d{8}$/.test(dni)) {
            Swal.fire('Advertencia', 'Ingrese un DNI válido de 8 dígitos', 'warning');
            return;
          }
      
          const headers = new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('token')}`
          });
      
          this.clientesService.buscarDni(dni, headers).subscribe({
            next: (data) => {
              const clienteData = JSON.parse(data.datos);
              this.nuevoClienteForm.get('nombre')?.setValue(`${clienteData.apellidoPaterno} ${clienteData.apellidoMaterno} ${clienteData.nombres}`);
            },
            error: (error) => {
              console.error(error);
              Swal.fire('Error', 'No se pudo obtener los datos del DNI', 'error');
            }
          });
    }
  
    cerrarModalCliente(): void {
      this.mostrarModalCliente = false;
    }
  
    guardarCliente(): void {
      if (this.nuevoClienteForm.invalid) {
        this.nuevoClienteForm.markAllAsTouched();
        return;
      }
  
      const nuevoCliente = this.nuevoClienteForm.value;
  
      this.clientesService.createCliente(nuevoCliente).subscribe({
        next: (clienteCreado) => {
          this.clientes.push(clienteCreado);
          this.reservaForm.get('cliente')?.setValue(clienteCreado.idCliente);
          this.cerrarModalCliente();
          Swal.fire('Cliente agregado', 'Se agregó correctamente el cliente.', 'success');
        },
        error: err => {
          Swal.fire('Error', 'No se pudo registrar el cliente: ' + err.message, 'error');
        }
      });
    }

  toggleSalon(salon: Salones): void {
    const index = this.salonesArray.controls.findIndex(ctrl => ctrl.value.id_salon === salon.id_salon);

    if (index !== -1 && this.salonesArray.length <= 1) {
      Swal.fire('No puedes quitar este salón', 'Debe haber al menos un salón seleccionado', 'warning');
      return;
    }

    if (index === -1) {
      // Agregar salón
      this.salonesArray.push(this.fb.control(salon));
  } else {
      // Quitar salón
      this.salonesArray.removeAt(index);
      
      // Si estamos editando y quitamos un salón original, marcarlo como disponible
      if (this.isEditing && this.salonesOriginales.some(s => s.id_salon === salon.id_salon)) {
          salon.estado_salon = 'Disponible';
          // No necesitamos actualizar inmediatamente, se hará al guardar
      }
  }

    this.salonesService.updateSalon(salon).subscribe({
      next: () => console.log(`Estado actualizado: ${salon.nombre} => ${salon.estado_salon}`),
      error: err => console.error(`Error actualizando salón: ${err.message}`)
    });
  }

  loadClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: data => this.clientes = [...data],
      error: err => this.error = 'Error al cargar clientes: ' + err.message
    });
  }

  loadSalones(): void {
    this.salonesService.getSalones().subscribe({
        next: data => {
            const idsOriginales = this.salonesOriginales.map(s => s.id_salon);
            this.salones = data.filter(s =>
                s.estado === 1 &&  // Solo salones activos
                (s.estado_salon === 'Disponible' || idsOriginales.includes(s.id_salon!))
            );
        },
        error: err => this.error = 'Error al cargar los salones: ' + err.message
    });
  }
  

  loadReserva(id: number): void {
    this.loading = true;
    this.reservasService.getReservaById(id).subscribe({
        next: reserva => {
            // Filtrar solo relaciones con estado=1 (activas)
            const relacionesActivas = (reserva.salonesXReserva || [])
                .filter(sr => sr.estado === 1);

            relacionesActivas.forEach(sr => {
                this.salonesArray.push(this.fb.control(sr.salon));
                this.salonesOriginales.push({
                    id_salon: sr.salon.id_salon!,
                    id_salonreserva: sr.id_salon_reserv!
                });
            });

            this.reservaForm.patchValue({
                fecha_inicio: this.formatDateForInput(reserva.fecha_inicio as string),
                fecha_fin: this.formatDateForInput(reserva.fecha_fin as string),
                estado_reserva: reserva.estado_reserva,
                comentarios: reserva.comentarios,
                cliente: reserva.cliente.idCliente
            });

            this.loadSalones();
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
        nro_persona: formValue.nro_persona,
        tipo: 'Salón',
        cliente
    };

    const action$ = this.isEditing && this.id
        ? this.reservasService.updateReserva(this.id, { ...reserva, id_reserva: this.id })
        : this.reservasService.createReserva(reserva);

    action$.subscribe({
        next: res => this.manejarSalones(res),
        error: err => this.mostrarError('Error al guardar la reserva: ' + err.message)
    });
}

private manejarSalones(reserva: Reserva): void {
  const salonesSeleccionados = this.salonesArray.value as Salones[];
  
  // Filtramos para asegurar que solo tenemos IDs numéricos
  const idsSeleccionados = salonesSeleccionados
      .map(s => s.id_salon)
      .filter((id): id is number => id !== undefined);

  // 1. Identificar salones a actualizar
  const salonesParaReservar = salonesSeleccionados.map(salon => {
      salon.estado_salon = 'Reservado';
      return salon;
  });

  // 2. Identificar salones a liberar (solo en edición)
  const salonesParaLiberar = this.isEditing 
      ? this.salonesOriginales
          .filter(original => !idsSeleccionados.includes(original.id_salon))
          .map(original => {
              const salon = this.salones.find(s => s.id_salon === original.id_salon)!;
              salon.estado_salon = 'Disponible';
              return salon;
          })
      : [];

  // 3. Actualizar estados de todos los salones
  forkJoin([
      ...salonesParaReservar.map(s => this.salonesService.updateSalon(s)),
      ...salonesParaLiberar.map(s => this.salonesService.updateSalon(s))
  ]).subscribe({
      next: () => this.manejarRelacionesSalones(reserva, idsSeleccionados),
      error: err => this.mostrarError('Error al actualizar estados de salón: ' + err.message)
  });
}

private manejarRelacionesSalones(reserva: Reserva, idsSeleccionados: number[]): void {
  if (!this.isEditing) {
      // Caso creación: crear todas las relaciones nuevas
      const nuevasRelaciones = this.salonesArray.value.map((salon: Salones) => ({
          salon,
          reserva,
          estado: 1
      }));

      forkJoin(
          nuevasRelaciones.map((sr: SalonReserva) => this.salonesService.createSalonReserva(sr))
      ).subscribe({
          next: () => this.finalizarGuardado(),
          error: err => this.mostrarError('Error al crear relaciones: ' + err.message)
      });
  } else {
      // Caso edición:
      // a) Relaciones a eliminar (las que estaban pero ya no están)
      const relacionesAEliminar = this.salonesOriginales
          .filter(original => !idsSeleccionados.includes(original.id_salon));

      // b) Relaciones a crear (las nuevas que no estaban)
      const relacionesACrear = this.salonesArray.value
          .filter((salon: Salones) => salon.id_salon !== undefined && 
                !this.salonesOriginales.some(o => o.id_salon === salon.id_salon))
          .map((salon: Salones) => ({
              salon,
              reserva,
              estado: 1
          }));

      // Primero eliminar las que ya no deben estar
      if (relacionesAEliminar.length === 0) {
          this.crearNuevasRelaciones(relacionesACrear);
      } else {
          forkJoin(
              relacionesAEliminar.map(rel => 
                  this.salonesService.deleteSalonReserva(rel.id_salonreserva)
              )
          ).subscribe({
              next: () => this.crearNuevasRelaciones(relacionesACrear),
              error: err => this.mostrarError('Error al eliminar relaciones: ' + err.message)
          });
      }
  }
}

private crearNuevasRelaciones(relaciones: SalonReserva[]): void {
  if (relaciones.length === 0) {
      this.finalizarGuardado();
      return;
  }

  forkJoin(
      relaciones.map((sr: SalonReserva) => this.salonesService.createSalonReserva(sr))
  ).subscribe({
      next: () => this.finalizarGuardado(),
      error: err => this.mostrarError('Error al crear nuevas relaciones: ' + err.message)
  });
}


private finalizarGuardado(): void {
    this.submitting = false;
    Swal.fire('Éxito', 'Reserva guardada correctamente', 'success');
    this.router.navigate(['/admin/reservas']);
}

private mostrarError(mensaje: string): void {
    this.error = mensaje;
    this.submitting = false;
    Swal.fire('Error', mensaje, 'error');
}

  guardarNuevosSalones(reserva: Reserva): void {
    // Actualizar estado de salones
    const salonesParaActualizar = this.salonesArray.value.map((salon: Salones) => {
        salon.estado_salon = 'Reservado';
        return salon;
    });

    // Actualizar todos los salones
    forkJoin(
        salonesParaActualizar.map((salon: Salones) => 
            this.salonesService.updateSalon(salon)
        )
    ).subscribe({
        next: () => {
            // Crear relaciones de reserva
            const nuevosSalones: SalonReserva[] = this.salonesArray.value
                .filter((salon: Salones) => !this.salonesOriginales.some(s => s.id_salon === salon.id_salon))
                .map((salon: Salones) => ({
                    salon,
                    reserva,
                    estado: 1
                }));

            if (nuevosSalones.length === 0) {
                this.finalizarGuardado();
                return;
            }

            forkJoin(
                nuevosSalones.map((sr: SalonReserva) => 
                    this.salonesService.createSalonReserva(sr)
                )
            ).subscribe({
                next: () => this.finalizarGuardado(),
                error: err => this.mostrarError('Error al asociar salones: ' + err.message)
            });
        },
        error: err => this.mostrarError('Error al actualizar salones: ' + err.message)
    });
}

  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
    });
  }

  isSalonSelected(salon: Salones): boolean {
    return this.salonesArray.value.some((s: Salones) => s.id_salon === salon.id_salon);
  }

  salonesFiltrados(): Salones[] {
    const filtro = this.filtroSalones?.toLowerCase() || '';

    return this.salones.filter(h =>
          h.nombre?.toLowerCase().includes(filtro) ||
          h.precio_hora?.toString().toLowerCase().includes(filtro) ||
          h.precio_diario?.toString().toLowerCase().includes(filtro) ||
          h.capacidad?.toString().toLowerCase().includes(filtro) );
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

  compareClientes(c1: any, c2: any): boolean {
    return c1 === c2;
  }
}

function fechaNoPasada(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    const ahora = new Date();
    const fecha = new Date(control.value);
    return fecha < ahora ? { fechaPasada: true } : null;
  };
}

function fechaFinMayorQueInicio(): ValidatorFn {
  return (group: AbstractControl): { [key: string]: any } | null => {
    const inicio = group.get('fecha_inicio')?.value;
    const fin = group.get('fecha_fin')?.value;
    if (!inicio || !fin) return null;
    return new Date(fin) > new Date(inicio) ? null : { fechaFinInvalida: true };
  };
}
