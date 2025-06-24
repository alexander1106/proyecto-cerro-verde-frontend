import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalonesService, Salones } from '../../../../../service/salones.service';
import { SucursalService, Sucursal } from '../../../../../service/sucursal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-salones-form',
  templateUrl: './salones-form.component.html',
  styleUrls: ['./salones-form.component.css'],
  standalone: false,
})
export class SalonesFormComponent implements OnInit {
  salonForm!: FormGroup;
  isEditing = false;
  id?: number;
  submitted = false;
  loading = false;
  error = '';

  estadosSalon: string[] = [];
  salones: Salones[] = [];
  salon?: Salones;
  sucursales: Sucursal[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private salonService: SalonesService,
    private sucursalService: SucursalService

  ) {}

  ngOnInit(): void {
    this.loadData();
    this.id = +this.route.snapshot.params['id'];
    this.isEditing = !!this.id;

    if (this.isEditing) {
      this.loadHabitacion();
    }
  }

  get f() { return this.salonForm.controls; }

  initForm(): void {
    this.salonForm = this.formBuilder.group({
      nombre: [
        null,
        [
          Validators.required,
          this.nombreDuplicadoValidator()
        ]
      ],
      precio_hora: [null, Validators.required],
      precio_diario: [null, Validators.required],
      estado_salon: ["Disponible"],
      capacidad: [null, Validators.required],
      estado: [1],
      sucursal: [{ value: null, disabled: !this.isEditing }, Validators.required]
    });
  }



  loadData(): void {
    this.loading = true;

    this.estadosSalon = this.salonService.getEstadosSalon();

    this.salonService.getSalones().subscribe({
    next: (data) => {
      this.salones = data;

      if (!this.salonForm) return;

      this.salonForm.get('nombre')?.updateValueAndValidity();
    },
    error: (err) => {
      this.error = 'Error al cargar salones existentes';
      console.error('Error:', err);
    }
  });


    this.initForm();

  if (!this.isEditing) {
    this.salonForm.patchValue({
      estado_salon: 'Disponible'
    });

  }

    this.sucursalService.getSucursales().subscribe({
      next: (data) => {
      this.sucursales = data;
      if (!this.isEditing && this.sucursales.length > 0) {
        this.salonForm.patchValue({
          sucursal: this.sucursales[0]
        });
      }
      },
      error: (err) => {
        this.error = 'Error al cargar las sucursales';
        console.error(err);
      }
    });

  }

  loadHabitacion(): void {
    if (!this.id) return;

    this.loading = true;
    this.salonService.getSalon(this.id).subscribe({
      next: (salon) => {
        this.salon = salon;
        this.salonForm.patchValue(salon);
      },
      error: (err) => {
        this.error = 'Error al cargar el salón';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    const salon: Salones = this.salonForm.value;

    this.loading = true;

    const obs = this.isEditing
      ? this.salonService.updateSalon({ ...salon, id_salon: this.id })
      : this.salonService.createSalon(salon);

    obs.subscribe({
      next: (resp) => {
        this.loading = false;
        this.router.navigate(['/admin/salones']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al guardar el salón.';
      }
    });

    const msg = this.isEditing ? 'Salón actualizado correctamente' : 'Salón creado correctamente';

  Swal.fire({
    icon: 'success',
    title: msg,
    showConfirmButton: false,
    timer: 2000
  });
  }

  volver(): void {
    this.router.navigate(['/admin/salones']);
  }

  nombreDuplicadoValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.salones || control.value === null) {
        return null;
      }

      const normalizar = (valor: string) =>
        valor.toLowerCase().replace(/\s+/g, '');

      const nombre = normalizar(control.value);
      const duplicado = this.salones.some(h =>
        normalizar(h.nombre) === nombre && h.id_salon !== this.salon?.id_salon
      );

      return duplicado ? { nombreDuplicado: true } : null;
    };
  }


}
