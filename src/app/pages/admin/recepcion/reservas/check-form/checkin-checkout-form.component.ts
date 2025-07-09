import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckinCheckoutService, CheckinCheckout } from '../../../../../service/checkin-checkout.service';
import { ReservasService } from '../../../../../service/reserva.service';
import { NotificacionesService } from '../../../../../service/notificaciones.service';
import { HabitacionReserva } from '../../../../../service/habitaciones.service';
import { ClientesService, Cliente } from '../../../../../service/clientes.service';
import Swal from 'sweetalert2';
import { HttpHeaders } from '@angular/common/http';
import { Huespedes, HuespedService, HabitacionReservaConHuespedes } from '../../../../../service/huesped.service';


@Component({
  standalone:false,
  selector: 'app-checkin-checkout-form',
  templateUrl: './checkin-checkout-form.component.html',
  styleUrls: ['./checkin-checkout-form.component.css']
})
export class CheckinCheckoutFormComponent implements OnInit {
  checkForm!: FormGroup;
  clientes: Cliente[] = [];
  isEditing = false;
  id?: number;
  submitted = false;
  loading = false;
  error = '';
  reservas: any[] = [];
  habitacionesReserva: HabitacionReservaConHuespedes[] = [];
  habitacionActualParaAsignar?: HabitacionReserva;
  mostrarModalCliente = false;
  buscandoDni = false;
  nuevoClienteForm!: FormGroup;
  clientesFiltrados: Cliente[] = [];
  busquedaCliente = '';
  mostrarFormularioNuevoCliente = false;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private checkService: CheckinCheckoutService,
    private reservasService: ReservasService,
    private notificationService: NotificacionesService,
    private clientesService: ClientesService,
    private huespedService: HuespedService


  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.params['id'];
    this.isEditing = !!this.id;
  
    this.initForm();
  
    this.nuevoClienteForm = this.fb.group({
      dniRuc: ['', [Validators.required, Validators.pattern(/^\d{8}|\d{11}$/)]],
      nombre: ['', Validators.required],
      correo: ['', [Validators.email]],
      telefono: ['', Validators.pattern(/^[0-9\-+()\s]*$/)],
      pais: ['', Validators.required]
    });
  
    // 👇 Aquí cargar todos los clientes existentes para buscarlos
    this.clientesService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: () => {
        console.error('Error al cargar clientes');
      }
    });
  
    if (this.isEditing) {
      this.loading = true;
      this.checkService.buscarId(this.id).subscribe({
        next: (check) => {
          this.checkForm.patchValue({
            reserva: check.reserva?.id_reserva ?? null,
            fecha_checkin: this.formatDateTime(check.fecha_checkin),
            fecha_checkout: this.formatDateTime(check.fecha_checkout),
            estado: check.estado
          });
          this.checkForm.get('fecha_checkin')?.disable();
          const checkoutCtrl = this.checkForm.get('fecha_checkout');
          checkoutCtrl?.enable();
          checkoutCtrl?.setValidators(Validators.required);
          checkoutCtrl?.updateValueAndValidity();
          this.loadReservas(check.reserva?.id_reserva);
        },
        complete: () => this.loading = false
      });
    } else {
      this.loadReservas();
    }
  }
  


  initForm(): void {
    this.checkForm = this.fb.group({
      reserva: [null, Validators.required],
      fecha_checkin: [null, Validators.required],
      fecha_checkout: [{ value: null, disabled: true }], // deshabilitado y sin validador
      estado: [1]
    });
  }

  loadCheckData(onLoaded?: () => void): void {
    this.loading = true;
    if (this.id) {
      this.checkService.buscarId(this.id).subscribe({
        next: (check) => {
          this.checkForm.patchValue({
            reserva: check.reserva?.id_reserva ?? null,
            fecha_checkin: this.formatDateTime(check.fecha_checkin),
            fecha_checkout: this.formatDateTime(check.fecha_checkout),
            estado: check.estado
          });
          this.checkForm.get('fecha_checkin')?.disable();
          const checkoutCtrl = this.checkForm.get('fecha_checkout');
          checkoutCtrl?.enable();
          checkoutCtrl?.setValidators(Validators.required);
          checkoutCtrl?.updateValueAndValidity();

          onLoaded?.(); // llama el callback
        }
      });
    }
  }


  loadReservas(idReservaActual?: number): void {
    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas.filter((r: any) => r.estado === 1 && r.estado_reserva === "Pagada");

        // si no está incluida, agregarla
        if (idReservaActual && !this.reservas.some(r => Number(r.id_reserva) === Number(idReservaActual))) {
          this.checkService.buscarId(this.id!).subscribe(resp => {
            this.reservas.push(resp.reserva);
          });
        }
      },
      error: () => {
        this.error = 'Error al cargar las reservas';
      }
    });
  }


  formatDateTime(dateTime: any): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.checkForm.invalid) return;

    const formData = this.checkForm.getRawValue();
    const reservaSeleccionada = this.reservas.find(r => Number(r.id_reserva) === Number(formData.reserva));
    if (!reservaSeleccionada) {
      this.error = 'Reserva no válida.';
      return;
    }

    const fechaCheckin = new Date(formData.fecha_checkin);
    const fechaInicio = new Date(reservaSeleccionada.fecha_inicio);
    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    if (!this.isEditing) {
      if (fechaCheckin < hoy) {
        this.error = 'La fecha de check-in no puede ser en el pasado. Solo se permite desde hoy.';
        return;
      }
    }

    if (fechaCheckin.toDateString() !== fechaInicio.toDateString()) {
      this.error = 'La fecha de check-in debe coincidir con la fecha de inicio de la reserva ' + fechaInicio.toDateString();
      return;
    }

    if (this.isEditing) {
      if (!formData.fecha_checkout) {
        this.error = 'Fecha de check-out es requerida.';
        return;
      }

      const fechaCheckout = new Date(formData.fecha_checkout);
      const fechaFin = new Date(reservaSeleccionada.fecha_fin);

      // 🚀 Nueva validación
      if (fechaCheckout > fechaFin) {
        this.error = `La fecha de check-out no puede ser después del fin de la reserva (${fechaFin.toDateString()}).`;
        return;
      }

      if (fechaCheckout.toDateString() !== fechaFin.toDateString()) {
        this.error = 'La fecha de check-out debe coincidir con la fecha de fin de la reserva.';
        return;
      }
    }

    const checkData: CheckinCheckout = {
      ...formData,
      reserva: { id_reserva: formData.reserva },
      ...(this.isEditing ? { id_check: this.id } : {})
    };

    this.saveCheck(checkData);
  }


  saveCheck(checkData: CheckinCheckout): void {
    this.loading = true;

    const operation = this.isEditing
      ? this.checkService.modificar(checkData)
      : this.checkService.guardar(checkData);

    operation.subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: this.isEditing ? 'Actualizado' : 'Registrado',
          text: `Checkin/Checkout ${this.isEditing ? 'actualizado' : 'registrado'} correctamente`,
          showConfirmButton: false,
          customClass: {
            popup: 'border shadow rounded-4',
            confirmButton: 'btn btn-success px-4',
            title: 'fs-4 text-success',
            htmlContainer: 'fs-6 text-secondary'
          },
          buttonsStyling: false,
          timer: 1500
        });
        this.router.navigate(['/admin/checks']);
      },
      error: (err) => {
        const backendMessage =
          err.error?.message ||
          (typeof err.error === 'string' ? err.error : null) || // si devuelve texto plano
          'No se puede hacer check-in a una reserva no pagada';

        this.error = `Error al ${this.isEditing ? 'actualizar' : 'crear'} el registro: ${backendMessage}`;
        this.loading = false;

        Swal.fire('Error', backendMessage, 'error'); // Puedes mostrar solo el mensaje del backend si prefieres
      }


    });
  }

  volver(): void {
    this.router.navigate(['/admin/checks']);
  }

  get f() { return this.checkForm.controls; }

  onReservaChange(event: any): void {
    const idReserva = Number(event.target.value);
    if (!idReserva) {
      this.habitacionesReserva = [];
      return;
    }
  
    this.reservasService.getReservaById(idReserva).subscribe({
      next: (reserva) => {
        console.log('Reserva cargada:', reserva);
  
        this.huespedService.getHuespedes().subscribe({
          next: (huespedes) => {
            console.log('Todos los huespedes:', huespedes);
        
            this.habitacionesReserva = (reserva.habitacionesXReserva ?? []).map(hr => ({
              ...hr,
              huespedes: huespedes.filter(h => h.habres?.id_hab_reserv === hr.id_hab_reserv)
            }));
          },
          error: (err) => {
            console.error('Error al cargar huespedes:', err);
            // Si hay error, puedes inicializar igual con huespedes vacíos
            this.habitacionesReserva = (reserva.habitacionesXReserva ?? []).map(hr => ({
              ...hr,
              huespedes: []
            }));
          }
        });
        
  
      },
      error: (err) => {
        console.error('Error al cargar habitaciones de la reserva:', err);
        this.habitacionesReserva = [];
      }
    });
  }
  
  
  
  

  abrirModalCliente(): void {
    this.nuevoClienteForm.reset();
    this.mostrarModalCliente = true;
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

  abrirModalClientePara(habitacion: HabitacionReserva): void {
    this.habitacionActualParaAsignar = habitacion;
    this.busquedaCliente = '';
    this.clientesFiltrados = [];
    this.mostrarFormularioNuevoCliente = false;
    this.mostrarModalCliente = true;
  }

  abrirFormularioNuevoCliente() {
    this.nuevoClienteForm.reset();
    this.mostrarFormularioNuevoCliente = true;
  }
  
  
  
    guardarCliente(): void {
      if (this.nuevoClienteForm.invalid) {
        this.nuevoClienteForm.markAllAsTouched();
        return;
      }
    
      const clienteData = {
        ...this.nuevoClienteForm.value,
        estado: 1
      };
    
      this.clientesService.createCliente(clienteData).subscribe({
        next: (nuevoCliente) => {
          console.log('✅ Cliente creado:', nuevoCliente);
    
        },
        error: () => Swal.fire('Error', 'No se pudo guardar el cliente', 'error')
      });
    }
    
  
    cerrarModalCliente(): void {
      this.mostrarModalCliente = false;
      this.habitacionActualParaAsignar = undefined;
    }

    buscarClientesExistentes() {
      const termino = this.busquedaCliente.trim().toLowerCase();
      if (!termino) {
        this.clientesFiltrados = [];
        return;
      }
    
      this.clientesFiltrados = this.clientes.filter(cliente =>
        (cliente.nombre?.toLowerCase().includes(termino) ||
        cliente.dniRuc?.includes(termino))
      );
    }

    asignarClienteAReserva(cliente: Cliente) {
      if (!this.habitacionActualParaAsignar) {
        Swal.fire('Error', 'No hay habitación actual para asignar.', 'error');
        return;
      }
    
      Swal.fire({
        title: '¿Asignar cliente?',
        html: `
          <b>${cliente.nombre}</b><br>
          DNI/RUC: ${cliente.dniRuc}<br>
          Tel: ${cliente.telefono}<br>
          Habitación: #${this.habitacionActualParaAsignar.habitacion.numero}
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, asignar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // 🚀 Payload con solo IDs
          const huespedData = {
            habres: { id_hab_reserv: this.habitacionActualParaAsignar?.id_hab_reserv },
            cliente: { idCliente: cliente.idCliente },
            estado: 1
          } as unknown as Huespedes;
          
          this.huespedService.createHuesped(huespedData).subscribe({
            next: () => {
              Swal.fire('Asignado', 'Cliente asignado correctamente', 'success');
              this.cerrarModalCliente();
            },
            error: (err) => {
              console.error('❌ Error al crear huésped:', err);
              Swal.fire('Error', 'No se pudo asignar el huésped', 'error');
            }
          });
          
        }
      });
    }
       
    
    
}
