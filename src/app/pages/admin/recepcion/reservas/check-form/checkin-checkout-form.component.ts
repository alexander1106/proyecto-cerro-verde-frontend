import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckinCheckoutService } from '../../../../../service/checkin-checkout.service';
import { ReservasService } from '../../../../../service/reserva.service';
import Swal from 'sweetalert2';
import { NotificacionesService } from '../../../../../service/notificaciones.service';

interface CheckinCheckout {
  id_check?: number;
  fecha_checkin: string;
  fecha_checkout: string;
  estado: number;
  reserva: { id_reserva: number };
}

@Component({
  standalone:false,
  selector: 'app-checkin-checkout-form',
  templateUrl: './checkin-checkout-form.component.html',
  styleUrls: ['./checkin-checkout-form.component.css']
})
export class CheckinCheckoutFormComponent implements OnInit {
  checkForm!: FormGroup;
  isEditing = false;
  id?: number;
  submitted = false;
  loading = false;
  error = '';
  reservas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private checkService: CheckinCheckoutService,
    private reservasService: ReservasService,
      private notificationService: NotificacionesService

  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.params['id'];
    this.isEditing = !!this.id;

    this.initForm();
    this.loadReservas();

    if (this.isEditing) {
      this.loadCheckData();
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

  loadCheckData(): void {
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

          console.log('Check data cargado:', check);
          console.log('Formulario después del patch:', this.checkForm.value);


          // Deshabilitar fecha_checkin
          this.checkForm.get('fecha_checkin')?.disable();

          // Habilitar y añadir validador a fecha_checkout
          const checkoutCtrl = this.checkForm.get('fecha_checkout');
          checkoutCtrl?.enable();
          checkoutCtrl?.setValidators(Validators.required);
          checkoutCtrl?.updateValueAndValidity();
        }
      });
    }

  }


  loadReservas(): void {
    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas.filter((r: any) => r.estado === 1 && r.estado_reserva != "Completada" && r.estado_reserva != "Check-in" );

        // Si estás editando, asegúrate de que la reserva actual esté en la lista
        if (this.isEditing && this.checkForm?.value?.reserva) {
          const idReservaActual = this.checkForm.value.reserva;
          const yaIncluida = this.reservas.some(r => Number(r.id_reserva) === Number(idReservaActual));
          if (!yaIncluida) {
            this.checkService.buscarId(this.id!).subscribe(resp => {
              this.reservas.push(resp.reserva);
            });
          }
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

    const formData = this.checkForm.getRawValue(); // Usa getRawValue() para campos deshabilitados

    const reservaSeleccionada = this.reservas.find(r => Number(r.id_reserva) === Number(formData.reserva));
    if (!reservaSeleccionada) {
      this.error = 'Reserva no válida.';
      return;
    }

    const fechaCheckin = new Date(formData.fecha_checkin);
    const fechaInicio = new Date(reservaSeleccionada.fecha_inicio);
    if (fechaCheckin.toDateString() !== fechaInicio.toDateString()) {
      this.error = 'La fecha de check-in debe coincidir con la fecha de inicio de la reserva ' + fechaInicio.toDateString();
      return;
    }

    // ✅ Solo validar checkout si es edición
    if (this.isEditing) {
      if (!formData.fecha_checkout) {
        this.error = 'Fecha de check-out es requerida.';
        return;
      }

      const fechaCheckout = new Date(formData.fecha_checkout);
      const fechaFin = new Date(reservaSeleccionada.fecha_fin);
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
        timer: 1500
      }).then(() => {
        if (this.isEditing) {
          const reserva = this.reservas.find(
            r => Number(r.id_reserva) === Number(checkData.reserva.id_reserva)
          );
          const habitacion = reserva?.habitacion?.numero || 'desconocida';

          // ✅ GUARDAR NOTIFICACIÓN
          this.notificationService.agregar(
            `La habitación #${habitacion} fue liberada y está lista para mantenimiento`
          );

          // ✅ Mostrar mensaje informativo
          Swal.fire({
            icon: 'info',
            title: 'Habitación liberada',
            text: `La habitación #${habitacion} fue liberada y está lista para mantenimiento`,
            confirmButtonText: 'Aceptar'
          });
        }

        // ✅ Redirigir al listado
        this.router.navigate(['/admin/checks']);
      });
    },

    error: (err) => {
      const backendMessage =
        err.error?.message ||
        (typeof err.error === 'string' ? err.error : null) ||
        'No se puede hacer check-in a una reserva no pagada';

      this.error = `Error al ${this.isEditing ? 'actualizar' : 'crear'} el registro: ${backendMessage}`;
      this.loading = false;

      Swal.fire('Error', backendMessage, 'error');
    }
  });
}


  volver(): void {
    this.router.navigate(['/admin/checks']);
  }

  get f() { return this.checkForm.controls; }
}
