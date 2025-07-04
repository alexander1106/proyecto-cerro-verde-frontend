import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoHabitacionService, TipoHabitacion } from '../../../../../../service/tipo-habitacion.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-tipo-habitacion-form',
  standalone: false,

  templateUrl: './tipo-habitacion-form.component.html',
  styleUrls: ['./tipo-habitacion-form.component.css']
})
export class TipoHabitacionFormComponent implements OnInit {
  tipoForm!: FormGroup;
  isEditing = false;
  id?: number;
  submitted = false;
  loading = false;
  error = '';
  tipos: TipoHabitacion[] = [];
    tipo?: TipoHabitacion;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tipoHabitacionService: TipoHabitacionService
  ) {}

  ngOnInit(): void {
    this.initForm();
  
    this.tipoHabitacionService.getTiposHabitacion().subscribe((tipos) => {
      this.tipos = tipos;
      this.id = +this.route.snapshot.params['id'];
      this.isEditing = !!this.id;
      if (this.isEditing) {
        this.loadTipo();
      }
    });
  }
  
  

  get f() { return this.tipoForm.controls; }

  initForm(): void {
    this.tipoForm = this.formBuilder.group({
      nombre: [
        null,
        [
          Validators.required,
          this.nombreDuplicadoValidator()
        ]
      ],
      precio: [null, [Validators.required, Validators.min(0)]],
      cantidadtipo:[null, [Validators.required, Validators.min(0)]],
      estado: [1]
    });
  }

  loadTipo(): void {
    if (!this.id) return;
  
    this.loading = true;
    this.tipoHabitacionService.getTipoHabitacion(this.id).subscribe({
      next: (tipo) => {
        if (tipo) {
          this.tipo = tipo; // <- Aquí asignas el tipo actual
          this.tipoForm.patchValue({
            nombre: tipo.nombre,
            precio: tipo.precio,
            cantidadtipo: tipo.cantidadtipo,
            estado: tipo.estado
          });
        } else {
          this.error = 'No se encontró el tipo de habitación';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el tipo de habitación';
        this.loading = false;
        console.error('Error:', err);
      }
    });
    this.tipoForm.get('nombre')?.updateValueAndValidity(); 
  }
  
  onSubmit(): void {
    this.submitted = true;
  
    if (this.tipoForm.invalid) {
      return;
    }
  
    this.loading = true;
    const tipo: TipoHabitacion = {
      ...this.tipoForm.value,
      ...(this.isEditing ? { id_tipo_habitacion: this.id } : {})
    };
  
    const saveTipo = this.isEditing
      ? this.tipoHabitacionService.updateTipoHabitacion({ ...tipo, id_tipo_habitacion: this.id })
      : this.tipoHabitacionService.createTipoHabitacion(tipo);
  
    saveTipo.subscribe({
      next: () => {
        this.loading = false;
  
        Swal.fire({
          icon: 'success',
          title: '¡Registro guardado!',
          text: 'El tipo de habitación fue creado correctamente.',
          showConfirmButton: false,
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'border shadow rounded-4',
            confirmButton: 'btn btn-success px-4',
            title: 'fs-4 text-success',
            htmlContainer: 'fs-6 text-secondary'
          },
          buttonsStyling: false
        }).then(() => {
          this.router.navigate(['/admin/tipos-habitaciones']);
        });
      },
      error: (err) => {
        this.error = `Error al ${this.isEditing ? 'actualizar' : 'crear'} el tipo de habitación`;
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }
  

  volver(): void {
    this.router.navigate(['/admin/tipos-habitaciones']);
  }

  nombreDuplicadoValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.tipos || control.value === null) {
        return null;
      }
  
      const normalizar = (valor: string) =>
        valor.toLowerCase().replace(/\s+/g, '');
  
      const nombre = normalizar(control.value);
  
      const duplicado = this.tipos.some(h =>
        normalizar(h.nombre) === nombre &&
        h.id_tipo_habitacion !== this.tipo?.id_tipo_habitacion // ← excluye el mismo
      );
  
      return duplicado ? { nombreDuplicado: true } : null;
    };
  }
  
}
