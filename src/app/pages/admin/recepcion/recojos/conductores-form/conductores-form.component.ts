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
    this.conductorService.getConductores().subscribe((conductores) => {
      this.conductores = conductores;
      this.initForm(); 
      this.id = +this.route.snapshot.params['id'];
      this.isEditing = !!this.id;
      if (this.isEditing) {
        this.loadConductor();
      }
    });
  }
  

  get f() { return this.conductorForm.controls; }

  initForm(): void {
    this.conductorForm = this.formBuilder.group({
      nombre: [
        null,
        [
          Validators.required,
          this.nombreDuplicadoValidator()
        ]
      ],
      placa: [null, [Validators.required, Validators.min(0)]],
      modelo_vehiculo: [null, [Validators.required, Validators.min(0)]],
      dni: [null, [Validators.required, Validators.min(0)]],
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

    if (this.conductorForm.invalid) {
      return;
    }

    this.loading = true;
    const conductor: Conductores = {
      ...this.conductorForm.value,
      ...(this.isEditing ? { id_conductor: this.id } : {})
    };

    const saveConductor = this.isEditing ?
      this.conductorService.updateConductor({ ...conductor, id_conductor: this.id }) :
      this.conductorService.createConductor(conductor);

    saveConductor.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/recepcion/conductores']);
      },
      error: (err) => {
        this.error = `Error al ${this.isEditing ? 'actualizar' : 'crear'} el conductor`;
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/admin/recepcion/conductores']);
  }

  nombreDuplicadoValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.conductores || control.value === null) {
        return null;
      }

      const normalizar = (valor: string) =>
        valor.toLowerCase().replace(/\s+/g, '');

      const nombre = normalizar(control.value);
      const duplicado = this.conductores.some(h =>
        normalizar(h.nombre) === nombre && h.id_conductor !== this.conductor?.id_conductor
      );

      return duplicado ? { nombreDuplicado: true } : null;
    };
  }

  buscarDni(dni: string) {
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
  
        // Actualiza el campo 'nombre' del formulario reactivo
        this.conductorForm.patchValue({ nombre: nombreCompleto });
      },
      error: (error) => {
        console.error(error);
        Swal.fire("Error", "No se pudo obtener los datos del DNI", "error");
      }
    });
  }
  
}
