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
  buscandoDni = false;
  id: number | null = null;
  error = '';
  salonesConError: number[] = [];
  filtroEstadoSalon: string = '';
filtroCapacidadMin: number = 0;
verSoloSeleccionados: boolean = false;

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
      modo_reserva: ['hora', Validators.required],
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

    if (!this.verificarCapacidadSalones()) {
      this.error = 'Uno o más salones no tienen capacidad suficiente para el número de personas.';
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

  const idsSeleccionados = salonesSeleccionados
    .map(s => s.id_salon)
    .filter((id): id is number => id !== undefined);

  const salonesParaReservar = salonesSeleccionados.map(salon => {
    salon.estado_salon = 'Reservado';
    return salon;
  });

  const salonesParaLiberar = this.isEditing
    ? this.salonesOriginales
        .filter(original => !idsSeleccionados.includes(original.id_salon))
        .map(original => {
          const salon = this.salones.find(s => s.id_salon === original.id_salon)!;
          salon.estado_salon = 'Disponible';
          return salon;
        })
    : [];

  const modo = this.reservaForm.get('modo_reserva')?.value;

  forkJoin([
    ...salonesParaReservar.map(s => this.salonesService.updateSalon(s)),
    ...salonesParaLiberar.map(s => this.salonesService.updateSalon(s))
  ]).subscribe({
    next: () => this.manejarRelacionesSalones(reserva, idsSeleccionados, modo),
    error: err => this.mostrarError('Error al actualizar estados de salón: ' + err.message)
  });
}

private calcularPrecioReserva(salon: Salones, modo: string, inicio: Date, fin: Date): number {
  if (modo === 'hora') {
    const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    return Math.round(horas * salon.precio_hora);
  } else {
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return dias * salon.precio_diario;
  }
}

private manejarRelacionesSalones(reserva: Reserva, idsSeleccionados: number[], modo: string): void {
  const inicio = new Date(this.reservaForm.get('fecha_inicio')?.value);
  const fin = new Date(this.reservaForm.get('fecha_fin')?.value);

  if (!this.isEditing) {
    const nuevasRelaciones = this.salonesArray.value.map((salon: Salones) => ({
      salon,
      reserva,
      estado: 1,
      precioreserva: this.calcularPrecioReserva(salon, modo, inicio, fin)
    }));

    forkJoin(
      nuevasRelaciones.map((sr: SalonReserva) =>
        this.salonesService.createSalonReserva(sr)
      )
    ).subscribe({
      next: () => this.finalizarGuardado(),
      error: err => this.mostrarError('Error al crear relaciones: ' + err.message)
    });

  } else {
    const relacionesAEliminar = this.salonesOriginales
      .filter(original => !idsSeleccionados.includes(original.id_salon));

    const relacionesACrear = this.salonesArray.value
      .filter((salon: Salones) => salon.id_salon !== undefined &&
        !this.salonesOriginales.some(o => o.id_salon === salon.id_salon))
      .map((salon: Salones) => ({
        salon,
        reserva,
        estado: 1,
        precioreserva: this.calcularPrecioReserva(salon, modo, inicio, fin)
      }));

    if (relacionesAEliminar.length === 0) {
      this.crearNuevasRelaciones(relacionesACrear, modo, inicio, fin);
    } else {
      forkJoin(
        relacionesAEliminar.map(rel =>
          this.salonesService.deleteSalonReserva(rel.id_salonreserva)
        )
      ).subscribe({
        next: () => this.crearNuevasRelaciones(relacionesACrear, modo, inicio, fin),
        error: err => this.mostrarError('Error al eliminar relaciones: ' + err.message)
      });
    }
  }
}

private crearNuevasRelaciones(relaciones: SalonReserva[], modo: string, inicio: Date, fin: Date): void {
  if (relaciones.length === 0) {
    this.finalizarGuardado();
    return;
  }

  const relacionesConPrecio = relaciones.map((sr: SalonReserva) => ({
    ...sr,
    precioreserva: this.calcularPrecioReserva(sr.salon, modo, inicio, fin)
  }));

  forkJoin(
    relacionesConPrecio.map((sr: SalonReserva) =>
      this.salonesService.createSalonReserva(sr)
    )
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

  verificarCapacidadSalones(): boolean {
    const nroPersonas = this.reservaForm.get('nro_persona')?.value;
    this.salonesConError = [];
  
    this.salonesArray.controls.forEach((control: AbstractControl) => {
      const salon = control.value;
      const capacidad = salon.capacidad || 0;
      if (nroPersonas > capacidad) {
        this.salonesConError.push(salon.id_salon); // Asegúrate de que cada salón tenga `id_salon`
      }
    });
  
    return this.salonesConError.length === 0;
  }

  salonesFiltradosAvanzado(): Salones[] {
    const filtro = this.filtroSalones?.toLowerCase() || '';
  
    return this.salones.filter(salon => {
      const coincideTexto =
        salon.nombre?.toLowerCase().includes(filtro) ||
        salon.precio_hora?.toString().includes(filtro) ||
        salon.precio_diario?.toString().includes(filtro) ||
        salon.capacidad?.toString().includes(filtro);
  
      const cumpleSeleccion =
        !this.verSoloSeleccionados || this.isSalonSelected(salon);
  
      return coincideTexto && cumpleSeleccion;
    });
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
    const inicioStr = group.get('fecha_inicio')?.value;
    const finStr = group.get('fecha_fin')?.value;
    if (!inicioStr || !finStr) return null;

    const inicio = new Date(inicioStr);
    const fin = new Date(finStr);

    // Mínimo de 1 hora de diferencia (en milisegundos)
    const diferenciaMinima = 60 * 60 * 1000;

    return fin.getTime() - inicio.getTime() >= diferenciaMinima
      ? null
      : { fechaInvalida: true };
  };
}


