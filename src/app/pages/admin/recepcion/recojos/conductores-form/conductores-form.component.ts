import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConductoresService, Conductores } from '../../../../../service/conductores.service';
import { ClientesService } from '../../../../../service/clientes.service';
import { HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-conductores-form',
  standalone: false,
  templateUrl: './conductores-form.component.html',
  styleUrls: ['./conductores-form.component.css']
})
export class ConductoresFormComponent implements OnInit {
  conductorForm!: FormGroup;
  isEditing = false;
  id?: number;
  submitted = false;
  loading = false;
  error = '';
  resultado: any = null;
  conductores: Conductores[] = [];
  conductor?: Conductores;

  constructor(
    private clientesService: ClientesService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private conductorService: ConductoresService
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.params['id'];
    this.isEditing = !!this.id;

    this.initForm();

    this.conductorService.getConductores().subscribe((conductores) => {
      this.conductores = conductores;

      if (this.isEditing) {
        this.conductorService.getConductor(this.id!).subscribe({
          next: (conductor) => {
            this.conductor = conductor;
            this.conductorForm.patchValue({
              nombre: conductor.nombre,
              dni: conductor.dni,
              placa: conductor.placa,
              modelo_vehiculo: conductor.modelo_vehiculo,
              telefono: conductor.telefono,
              estado_conductor: conductor.estado_conductor
            });
            this.setCustomValidators();
          },
          error: () => this.error = 'Error al cargar el conductor'
        });
      } else {
        this.setCustomValidators();
      }
    });
  }

  initForm(): void {
    this.conductorForm = this.formBuilder.group({
      nombre: [null, Validators.required],
      placa: [null, Validators.required],
      modelo_vehiculo: [null, Validators.required],
      dni: [null, [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono: [null, [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
      estado_conductor: ['Disponible'],
      estado: [1]
    });
  }

  setCustomValidators(): void {
    this.f['placa'].setValidators([Validators.required, this.placaDuplicadaValidator()]);
    this.f['dni'].setValidators([Validators.required, Validators.pattern(/^\d{8}$/), this.dniDuplicadoValidator()]);
    this.f['placa'].updateValueAndValidity();
    this.f['dni'].updateValueAndValidity();
  }

  get f() { return this.conductorForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.conductorForm.invalid) return;

    const conductor: Conductores = {
      ...this.conductorForm.getRawValue(),
      ...(this.isEditing ? { id_conductor: this.id } : {})
    };

    const guardar = () => {
      this.loading = true;
      const saveConductor = this.isEditing
        ? this.conductorService.updateConductor(conductor)
        : this.conductorService.createConductor(conductor);

      saveConductor.subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: this.isEditing ? 'Conductor actualizado' : 'Conductor creado',
            showConfirmButton: false,
            timer: 1500
          });
          this.router.navigate(['/admin/conductores']);
        },
        error: (err) => {
          this.error = `Error al ${this.isEditing ? 'actualizar' : 'crear'} el conductor`;
          this.loading = false;
          console.error('Error:', err);
        }
      });
    };

    if (this.isEditing) {
      Swal.fire({
        title: '¿Deseas actualizar el conductor?',
        text: 'Se guardarán los cambios realizados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
      }).then(result => result.isConfirmed && guardar());
    } else {
      guardar();
    }
  }

  volver(): void {
    this.router.navigate(['/admin/conductores']);
  }

  buscarDni(): void {
    const dni = this.f['dni'].value;
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
        this.f['nombre'].setValue(`${clienteData.apellidoPaterno} ${clienteData.apellidoMaterno} ${clienteData.nombres}`);
      },
      error: (error) => {
        console.error(error);
        Swal.fire('Error', 'No se pudo obtener los datos del DNI', 'error');
      }
    });
  }

  buscarPlaca(): void {
    const placa = this.f['placa'].value?.trim().toUpperCase();
    if (!placa) {
      Swal.fire('Error', 'Ingrese una placa válida', 'warning');
      return;
    }

    this.conductorService.buscarPlaca(placa).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data) {
          this.resultado = response.data;
          this.f['modelo_vehiculo'].setValue(`${response.data.marca} ${response.data.modelo} COLOR: ${response.data.color}`);
        } else {
          Swal.fire('Error', 'No se encontró información de la placa', 'error');
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo obtener información de la placa', 'error');
      }
    });
  }

  placaDuplicadaValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const placa = control.value?.trim().toLowerCase();
      const duplicado = this.conductores.some(c =>
        c.placa.trim().toLowerCase() === placa &&
        c.id_conductor !== this.conductor?.id_conductor && c.estado === 1
      );
      return duplicado ? { placaDuplicada: true } : null;
    };
  }

  dniDuplicadoValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const dni = control.value?.trim();
      const duplicado = this.conductores.some(c =>
        c.dni.trim() === dni &&
        c.id_conductor !== this.id && c.estado === 1
      );
      return duplicado ? { dniDuplicado: true } : null;
    };
  }
}
