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
  
    this.initForm();
    this.validarPrecioDiarioMayor();
  
    // para que si cambia precio_hora, vuelva a validar precio_diario
    this.salonForm.get('precio_hora')?.valueChanges.subscribe(() => {
      this.salonForm.get('precio_diario')?.updateValueAndValidity();
    });
  
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
  
    this.initForm(); 
    this.validarPrecioDiarioMayor();
  
    this.salonService.getSalones().subscribe({
      next: (data) => {
        this.salones = data;
  
        // Aquí fuerza a recalcular el validador de nombre
        this.salonForm.get('nombre')?.updateValueAndValidity();
      },
      error: (err) => {
        this.error = 'Error al cargar salones existentes';
        console.error('Error:', err);
      }
    });
  
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
  
    // fuerza validación de nombre duplicado por si cambió después del load
    this.salonForm.get('nombre')?.updateValueAndValidity();
  
    if (this.salonForm.invalid) {
      console.warn('Formulario inválido:', this.salonForm.value);
      return; // 🚫 DETIENE el submit
    }
  
    const salon: Salones = this.salonForm.value;
    this.loading = true;
  
    const obs = this.isEditing
      ? this.salonService.updateSalon({ ...salon, id_salon: this.id })
      : this.salonService.createSalon(salon);
  
    obs.subscribe({
      next: (resp) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: '¡Registro guardado!',
          text: this.isEditing ? 'Salón actualizado correctamente' : 'Salón creado correctamente',
          showConfirmButton: false,
          timer: 2000,
          customClass: {
            popup: 'border shadow rounded-4',
            confirmButton: 'btn btn-success px-4',
            title: 'fs-4 text-success',
            htmlContainer: 'fs-6 text-secondary'
          },
          buttonsStyling: false
        }).then(() => {
          this.router.navigate(['/admin/salones']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al guardar el salón.';
        console.error('Error:', err);
      }
    });
  }
  volver(): void {
    this.router.navigate(['/admin/salones']);
  }

  nombreDuplicadoValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.salones.length || control.value === null) {
        return null;
      }
  
      const normalizarPalabras = (valor: string) =>
        valor.toLowerCase()
             .replace(/\s+/g, ' ')
             .trim()
             .split(' ')
             .filter(w => w.length);
  
      const palabrasActual = normalizarPalabras(control.value);
  
      // Si está editando y el nombre no cambió, no validar
      if (this.isEditing && this.salon && normalizarPalabras(this.salon.nombre).join() === palabrasActual.join()) {
        return null;
      }
  
      // Permitir duplicar solo si es exactamente "auditorio" o "salon"
      if (palabrasActual.length === 1 && (palabrasActual[0] === 'auditorio' || palabrasActual[0] === 'salon')) {
        return null;
      }
  
      const tienePalabraRepetida = this.salones.some(h => {
        if (this.salon?.id_salon === h.id_salon) return false; // Ignorar el mismo registro al editar
        const palabrasExistente = normalizarPalabras(h.nombre);
        return palabrasActual.some(palabra => palabrasExistente.includes(palabra));
      });
  
      return tienePalabraRepetida ? { nombreDuplicado: true } : null;
    };
  }
  
  
  validarPrecioDiarioMayor(): void {
    this.salonForm.get('precio_diario')?.setValidators([
      Validators.required,
      Validators.min(0.01),
      (control) => {
        const precioHora = this.salonForm?.get('precio_hora')?.value;
        if (control.value !== null && precioHora !== null && control.value <= precioHora) {
          return { menorQueHora: true };
        }
        return null;
      }
    ]);
    this.salonForm.get('precio_diario')?.updateValueAndValidity();
  }
  
  
  

}
