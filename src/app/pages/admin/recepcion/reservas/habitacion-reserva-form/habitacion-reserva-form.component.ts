import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';
import { HabitacionesService, Habitacion, HabitacionReserva } from '../../../../../service/habitaciones.service';
import { ClientesService, Cliente } from '../../../../../service/clientes.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { TipoHabitacionService } from '../../../../../service/tipo-habitacion.service';

@Component({
  selector: 'app-habitacion-reserva-form',
  standalone:false,
  templateUrl: './habitacion-reserva-form.component.html',
  styleUrls: ['./habitacion-reserva-form.component.css']
})
export class HabitacionReservaFormComponent implements OnInit {
  reservaForm!: FormGroup;
  nuevoClienteForm!: FormGroup;
  habitaciones: Habitacion[] = [];
  clientes: Cliente[] = [];
  habitacionesOriginales: { id_habitacion: number, id_habitacionreserva: number }[] = [];
  filtroHabitaciones = '';
  loading = false;
  submitting = false;
  isEditing = false;
  id: number | null = null;
  error = '';
  mostrarModalCliente = false;
  habitacionesConError: number[] = [];
  habitacionesSeleccionadasPorTipo: { [tipo: string]: number } = {};
  tiposDisponibles: { tipo: string, cantidadtipo: number, disponibles: number }[] = [];
  mostrarTablaHabitaciones = false;
  filtroTipo = '';
  filtroPiso = '';
  tiposUnicos: string[] = [];
  pisosUnicos: number[] = [];
  buscandoDni = false;

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private habitacionesService: HabitacionesService,
    private tipoHabitacionService: TipoHabitacionService,
    private clientesService: ClientesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    
  this.filtroTipo = '';
  this.filtroPiso = '';
    this.createForm();
    this.loadClientes();

    this.nuevoClienteForm = this.fb.group({
      dniRuc: ['', [Validators.required, Validators.pattern(/^\d{8}$|^\d{11}$/)]],
      nombre: ['', Validators.required],
      telefono: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^\d{9}$/)
      ])],
            pais: ['', Validators.required]
    });

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
      nro_persona: [1],
      estado_reserva: ['Pendiente', Validators.required],
      comentarios: [''],
      tipos: this.fb.group({}),
      habitaciones: this.fb.array([])
    }, {
      validators: [
        fechaFinMayorQueInicio()// ← AQUÍ
      ]
    });

    this.reservaForm.get('fecha_inicio')?.valueChanges.subscribe(() => {
      this.reservaForm.get('fecha_fin')?.updateValueAndValidity();
    });
  }

  
  abrirModalCliente(): void {
    this.mostrarModalCliente = true;
    this.nuevoClienteForm.reset();
  }

  buscarDni() {
    const dniRuc = this.nuevoClienteForm.get('dniRuc')?.value;
  
    if (!dniRuc || !(dniRuc.length === 8 || dniRuc.length === 11)) {
      Swal.fire('Documento inválido', 'Debe tener 8 (DNI) o 11 (RUC) dígitos.', 'warning');
      return;
    }
  
    const yaExiste = this.clientes.some(c => c.dniRuc === dniRuc);
    if (yaExiste) {
      Swal.fire('Documento duplicado', 'Este DNI o RUC ya está registrado.', 'error');
      return;
    }
  
    this.buscandoDni = true;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    this.clientesService.buscarDni(dniRuc, headers).subscribe({
      next: (data) => {
        try {
          const datos = JSON.parse(data.datos);
  
          this.nuevoClienteForm.patchValue({
            nombre: dniRuc.length === 8 ? (datos.nombreCompleto || '') : (datos.razonSocial || ''),
            pais: 'Perú'
          });
  
        } catch (e) {
          console.error('Error al parsear datos:', e);
          Swal.fire('Error', 'No se pudo procesar la respuesta.', 'error');
        }
  
        this.buscandoDni = false;
      },
      error: (err) => {
        console.error('Error al buscar:', err);
        Swal.fire('Error', 'No se pudo buscar el documento.', 'error');
        this.buscandoDni = false;
      }
    });
  }
  

  cerrarModalCliente(): void {
    this.mostrarModalCliente = false;
  }

  guardarCliente() {
    if (this.nuevoClienteForm.invalid) {
      this.nuevoClienteForm.markAllAsTouched();
      return;
    }
  
    const clienteData = {
      ...this.nuevoClienteForm.value,
      estado: 1 // O el valor que uses por defecto
    };
  
    this.clientesService.createCliente(clienteData).subscribe({
      next: (nuevoCliente) => {
        // Agrega a la lista de clientes y selecciona
        this.clientes.push(nuevoCliente);
        this.reservaForm.patchValue({ cliente: nuevoCliente.idCliente });
  
        this.cerrarModalCliente();
  
        Swal.fire('Éxito', 'Cliente creado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al guardar cliente:', error);
        Swal.fire('Error', 'No se pudo guardar el cliente', 'error');
      }
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

    this.actualizarConteoPorTipo();
    this.actualizarNumeroPersonas(); // <----

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

      this.tiposUnicos = [...new Set(this.habitaciones.map(h => h.tipo_habitacion.nombre))];
      this.pisosUnicos = [...new Set(this.habitaciones.map(h => h.piso.numero))];

      this.calcularTiposDisponibles();
    },
    error: err => this.error = 'Error al cargar las habitaciones: ' + err.message
  });
}

  
  calcularTiposDisponibles(): void {
    this.tipoHabitacionService.getTiposHabitacion().subscribe({
      next: tipos => {
        this.tiposDisponibles = tipos.map(tipo => {
          const habitacionesDeEsteTipo = this.habitaciones.filter(h => h.tipo_habitacion.nombre === tipo.nombre);
          const disponibles = habitacionesDeEsteTipo.filter(h => h.estado === 1 && h.estado_habitacion === 'Disponible').length;
  
          return {
            tipo: tipo.nombre,
            cantidadtipo: tipo.cantidadtipo,
            disponibles
          };
        });
        console.log('TIPOS DISPONIBLES:', this.tiposDisponibles);
      },
      error: err => console.error('Error al cargar tipos:', err)
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
  
        // 1. Cargamos valores en el formulario
        this.reservaForm.patchValue({
          fecha_inicio: this.formatDateForInput(reserva.fecha_inicio as string),
          fecha_fin: this.formatDateForInput(reserva.fecha_fin as string, true),
          estado_reserva: reserva.estado_reserva,
          comentarios: reserva.comentarios,
          cliente: reserva.cliente.idCliente
        });
  
        // 2. Deshabilitamos el campo solo después de cargar el valor
        if (this.isEditing) {
          this.reservaForm.get('fecha_inicio')?.disable({ onlySelf: true });
        }
  
        this.loadHabitaciones();
        this.mostrarTablaHabitaciones = true;
        this.actualizarConteoPorTipo(); 
        this.loading = false;
      },
      error: err => {
        this.error = 'Error al cargar la reserva: ' + err.message;
        this.loading = false;
      }
    });
  }
  

  formatDateForInput(date: string, onlyDate = false): string {
    const d = new Date(date);
    if (onlyDate) {
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}T${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  

  onSubmit(): void {
    if (this.reservaForm.invalid || this.habitacionesArray.length === 0) {
      this.markFormGroupTouched(this.reservaForm);
      this.error = 'Complete todos los campos requeridos y seleccione al menos una habitación.';
      return;
    }
  
    this.submitting = true;
    const formValue = this.reservaForm.getRawValue();
    const cliente = this.clientes.find(c => c.idCliente === formValue.cliente)!;
  
    const fechaFinParts = formValue.fecha_fin.split('-').map(Number);
    const fechaFinLocal = new Date(fechaFinParts[0], fechaFinParts[1] - 1, fechaFinParts[2], 8, 0, 0);
      
    const reserva: Reserva = {
      fecha_inicio: formValue.fecha_inicio,
      fecha_fin: fechaFinLocal,
      estado_reserva: formValue.estado_reserva,
      comentarios: formValue.comentarios,
      estado: 1,
      nro_persona: formValue.nro_persona,
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
    const filtroActivo = this.filtroTipo !== '' || this.filtroPiso !== '';
  
    if (!filtroActivo) {
      return this.habitacionesArray.value; // solo seleccionadas
    }
  
    return this.habitaciones.filter(h =>
      (this.filtroTipo === '' || h.tipo_habitacion.nombre === this.filtroTipo) &&
      (this.filtroPiso === '' || h.piso.numero.toString() === this.filtroPiso)
    );
  }
  
  
  limpiarFiltros(): void {
    this.filtroTipo = '';
    this.filtroPiso = '';
  }

  customSearch(term: string, item: any): boolean {
    term = term.toLowerCase();
    return (item.nombre?.toLowerCase().includes(term) ||
            item.dniRuc?.toString().toLowerCase().includes(term));
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

  verificarCapacidadHabitaciones(): boolean {
    const nroPersonas = this.reservaForm.get('nro_persona')?.value;
    this.habitacionesConError = [];
  
    this.habitacionesArray.controls.forEach((control: AbstractControl) => {
      const habitacion: Habitacion = control.value;
      const capacidad = habitacion.tipo_habitacion?.cantidadtipo || 0;
      if (nroPersonas > capacidad) {
        this.habitacionesConError.push(habitacion.id_habitacion!);
      }
    });
  
    return this.habitacionesConError.length === 0;
  }

  asignarHabitacionesPorTipo(): void {
  this.mostrarTablaHabitaciones = true;

  for (const tipo in this.habitacionesSeleccionadasPorTipo) {
    const cantidadDeseada = this.habitacionesSeleccionadasPorTipo[tipo];

    // Habitaciones ya seleccionadas de ese tipo
    const seleccionadasActuales = this.habitacionesArray.value.filter(
      (h: Habitacion) => h.tipo_habitacion.nombre === tipo
    );

    const diferencia = cantidadDeseada - seleccionadasActuales.length;

    if (diferencia > 0) {
      // Agregar habitaciones faltantes
      const disponibles = this.habitaciones.filter(h =>
        h.tipo_habitacion.nombre === tipo &&
        h.estado_habitacion === 'Disponible' &&
        !this.isHabitacionSelected(h)
      ).slice(0, diferencia);

      disponibles.forEach(h => {
        h.estado_habitacion = 'Reservada';
        this.habitacionesArray.push(this.fb.control(h));
      });

    } else if (diferencia < 0) {
      // Quitar habitaciones sobrantes (últimas agregadas)
      let aEliminar = -diferencia;

      for (let i = this.habitacionesArray.length - 1; i >= 0 && aEliminar > 0; i--) {
        const habitacion: Habitacion = this.habitacionesArray.at(i).value;
        if (habitacion.tipo_habitacion.nombre === tipo) {
          this.habitacionesArray.removeAt(i);
          habitacion.estado_habitacion = 'Disponible';
          aEliminar--;
        }
      }
    }

  }

  this.actualizarConteoPorTipo();
  this.actualizarNumeroPersonas(); // <----
 // <- importante mantener actualizado
}
  
  
  eliminarHabitacionSeleccionada(habitacion: Habitacion): void {
    const index = this.habitacionesArray.controls.findIndex(ctrl => ctrl.value.id_habitacion === habitacion.id_habitacion);
    if (index !== -1) {
      this.habitacionesArray.removeAt(index);
      habitacion.estado_habitacion = 'Disponible';
    }
    this.actualizarConteoPorTipo();
    this.actualizarNumeroPersonas(); // <----

  }
  
  toggleHabitacionDesdeTabla(habitacion: Habitacion): void {
    const index = this.habitacionesArray.controls.findIndex(ctrl => ctrl.value.id_habitacion === habitacion.id_habitacion);
  
    if (index === -1) {
      this.habitacionesArray.push(this.fb.control(habitacion));
      habitacion.estado_habitacion = 'Reservada';
    } else {
      this.habitacionesArray.removeAt(index);
      habitacion.estado_habitacion = 'Disponible';
    }
  
    this.habitacionesService.updateHabitacion(habitacion).subscribe();
    this.actualizarConteoPorTipo();
    this.actualizarNumeroPersonas(); // <---- suma autom.
  }
  
  
  
  actualizarConteoPorTipo(): void {
    const conteo: { [tipo: string]: number } = {};
    this.habitacionesArray.value.forEach((h: Habitacion) => {
      const tipo = h.tipo_habitacion.nombre;
      conteo[tipo] = (conteo[tipo] || 0) + 1;
    });
    this.habitacionesSeleccionadasPorTipo = conteo;
  }
  
  actualizarNumeroPersonas(): void {
    let totalPersonas = 0;
    this.habitacionesArray.value.forEach((h: Habitacion) => {
      totalPersonas += h.tipo_habitacion?.cantidadtipo || 0;
    });
    this.reservaForm.patchValue({ nro_persona: totalPersonas });
  }
  
  
}

function fechaNoPasada(): ValidatorFn {
return (control: AbstractControl) => {
const fecha = new Date(control.value);
return fecha < new Date() ? { fechaPasada: true } : null;
};
}

function fechaFinMayorQueInicio(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const fechaInicioCtrl = group.get('fecha_inicio');
    const fechaFinCtrl = group.get('fecha_fin');

    if (!fechaInicioCtrl || !fechaFinCtrl) return null;

    const inicio = new Date(fechaInicioCtrl.value);
    const fin = new Date(fechaFinCtrl.value);

    if (!inicio || !fin || isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return null;
    }

    return fin <= inicio ? { fechaInvalida: true } : null;
  };
}

