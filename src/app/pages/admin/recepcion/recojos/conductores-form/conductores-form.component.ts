import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConductoresService, Conductores } from '../../../../../service/conductores.service';
import { HttpHeaders } from '@angular/common/http';
import { ClientesService } from '../../../../../service/clientes.service';
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
  
    // Paso 1: crea el form sin validadores personalizados aún
    this.conductorForm = this.formBuilder.group({
      nombre: [null, Validators.required],
      placa: [null, Validators.required],
      modelo_vehiculo: [null, Validators.required],
      dni: [null, [Validators.required, Validators.pattern(/^\d{8}$/)]],
      estado: [1]
    });
  
    // Paso 2: carga lista completa de conductores
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
              modelo_vehiculo: conductor.modelo_vehiculo
            });
  
            // Paso 3: aplicar validadores personalizados con contexto ya disponible
            this.setCustomValidators();
          },
          error: (err) => {
            this.error = 'Error al cargar el conductor';
          }
        });
      } else {
        // Para nuevo conductor: aplicar validadores también
        this.setCustomValidators();
      }
    });
  }
  
  
  setCustomValidators(): void {
    this.f['nombre'].setValidators([
      Validators.required,
    ]);
    this.f['placa'].setValidators([
      Validators.required,
      this.placaDuplicadaValidator()
    ]);
    this.f['dni'].setValidators([
      Validators.required,
      Validators.pattern(/^\d{8}$/),
      this.dniDuplicadoValidator()
    ]);
  
    this.f['nombre'].updateValueAndValidity();
    this.f['placa'].updateValueAndValidity();
    this.f['dni'].updateValueAndValidity();
  }
  

  get f() { return this.conductorForm.controls; }

  initForm(): void {
    this.conductorForm = this.formBuilder.group({
      nombre: [
        null,
        [Validators.required]
      ],
      placa: [
        null,
        [Validators.required, this.placaDuplicadaValidator()]
      ],
      modelo_vehiculo: [null, [Validators.required]],
      dni: [
        null,
        [Validators.required, Validators.pattern(/^\d{8}$/), this.dniDuplicadoValidator()]
      ],
      estado: [1]
    });
  }
  

  loadConductor(): void {
    if (!this.id) return;

    this.loading = true;
    this.conductorService.getConductor(this.id).subscribe({
      next: (conductor) => {
        if (conductor) {
          this.conductorForm.patchValue({
            nombre: conductor.nombre,
            dni: conductor.dni,
            placa: conductor.placa,
            modelo_vehiculo: conductor.modelo_vehiculo
          });
        } else {
          this.error = 'No se encontró el conductor';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el conductor';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }


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
        ? this.conductorService.updateConductor({ ...conductor, id_conductor: this.id })
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
          this.router.navigate(['/admin/recepcion/conductores']);
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
      }).then((result) => {
        if (result.isConfirmed) {
          guardar();
        }else{
          this.router.navigate(['/admin/recepcion/conductores']);
        }
      });
    } else {
      guardar();
    }
  }
  

  volver(): void {
    this.router.navigate(['/admin/recepcion/conductores']);
  }

  buscarDni(): void {
    const dni = this.conductorForm.get('dni')?.value;
  
    if (!dni || !/^\d{8}$/.test(dni)) {
      Swal.fire("Advertencia", "Ingrese un DNI válido de 8 dígitos", "warning");
      return;
    }
  
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    this.clientesService.buscarDni(dni, headers).subscribe({
      next: (data) => {
        const clienteData = JSON.parse(data.datos);
        const nombreCompleto = `${clienteData.apellidoPaterno} ${clienteData.apellidoMaterno} ${clienteData.nombres}`;
        this.conductorForm.patchValue({ nombre: nombreCompleto });
        this.conductorForm.get('nombre')?.updateValueAndValidity();
        this.conductorForm.markAsDirty();
      },
      error: (error) => {
        console.error(error);
        Swal.fire("Error", "No se pudo obtener los datos del DNI", "error");
      }
    });
  }
  

  buscarPlaca() {
    const placa = this.conductorForm.get('placa')?.value;
  
    if (!placa || placa.trim() === '') {
      Swal.fire("Error", "Ingrese una placa válida", "warning");
      return;
    }
  
    this.conductorService.buscarPlaca(placa.trim().toUpperCase()).subscribe({
      next: (response) => {
  
        if (response.status === 200 && response.data) {
          this.resultado = response.data;  // guarda toda la data si quieres
  
          // Actualiza el campo modelo_vehiculo con el valor recibido
          this.conductorForm.patchValue({
            modelo_vehiculo: response.data.marca + " " + response.data.modelo + " COLOR: "  + response.data.color
          });
          this.conductorForm.get('modelo_vehiculo')?.updateValueAndValidity();
  
        } else {
          Swal.fire("Error", "No se encontró información de la placa", "error");
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire("Error", "No se pudo obtener información de la placa", "error");
      }
    });
  }
  
  placaDuplicadaValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.conductores || control.value === null) return null;
  
      const placa = control.value.trim().toLowerCase();
      const duplicado = this.conductores.some(c =>
        c.placa.trim().toLowerCase() === placa &&
        c.id_conductor !== this.conductor?.id_conductor && c.estado === 1
      );
  
      return duplicado ? { placaDuplicada: true } : null;
    };
  }
  
  dniDuplicadoValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.conductores || !control.value) return null;
  
      const dni = control.value.trim();
      const idActual = this.id; // 👈 asegúrate de comparar con `this.id`, no con `this.conductor`
  
      const duplicado = this.conductores.some(c =>
        c.dni.trim() === dni &&
        c.id_conductor !== idActual && c.estado === 1
      );
  
      return duplicado ? { dniDuplicado: true } : null;
    };
  }
  
  
  
}
