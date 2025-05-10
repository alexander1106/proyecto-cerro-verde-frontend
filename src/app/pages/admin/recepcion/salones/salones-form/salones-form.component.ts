import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalonesService, Salones, SalonImagen, Imagen } from '../../../../../service/salones.service';
import { SucursalService, Sucursal } from '../../../../../service/sucursal.service';
import { ImagenesService } from '../../../../../service/imagen.service';
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
  imagenes: Imagen[] = [];
  selectedImagenes: Imagen[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private salonService: SalonesService,
    private sucursalService: SucursalService,
    private imagenesService: ImagenesService

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


    this.imagenesService.getImagen().subscribe({
      next: (data) => {
        this.imagenes = data;
      },
      error: (err) => {
        this.error = 'Error al cargar las imágenes';
        console.error('Error:', err);
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

        this.salonService.getSalonImagenes().subscribe({
          next: (data) => {
            const salonImagenes = data.filter(hi => hi.salon.id_salon === this.id);
            this.selectedImagenes = salonImagenes.map(hi => hi.imagen);
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al cargar las imágenes asociadas';
            this.loading = false;
            console.error('Error:', err);
          }
        });
      },
      error: (err) => {
        this.error = 'Error al cargar el salón';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  toggleImagenSelection(imagen: Imagen): void {
    const index = this.selectedImagenes.findIndex(i => i.id_imagen === imagen.id_imagen);
    if (index === -1) {
      this.selectedImagenes.push(imagen);
    } else {
      this.selectedImagenes.splice(index, 1);
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.salonForm.invalid) {
      console.warn('❌ Formulario inválido:', this.salonForm.value);
      return;
    }

    const salon: Salones = this.salonForm.value;
    console.log('✅ Enviando habitación:', salon);

    this.loading = true;

    const obs = this.isEditing
      ? this.salonService.updateSalon({ ...salon, id_salon: this.id })
      : this.salonService.createSalon(salon);

    obs.subscribe({
      next: (resp) => {
        console.log('✅ Respuesta del backend:', resp);
        this.loading = false;
        this.router.navigate(['/admin/salones']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al guardar el salón.';
        console.error('❌ Error al crear:', err);
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



  saveImagenes(salon: Salones): void {
    this.salonService.getSalonImagenes().subscribe({
      next: (data) => {
        const salonImagenes = data.filter(hi => hi.salon.id_salon === salon.id_salon);

        const deletionPromises = salonImagenes
          .filter(hi => !this.selectedImagenes.some(img => img.id_imagen === hi.imagen.id_imagen))
          .map(hi => this.salonService.deleteSalonImagen(hi.id_sal_img!).toPromise());

        const creationPromises = this.selectedImagenes
          .filter(img => !salonImagenes.some(hi => hi.imagen.id_imagen === img.id_imagen))
          .map(img => {
            const newAssociation: SalonImagen = {
              salon: salon,
              imagen: img
            };
            return this.salonService.createSalonImagen(newAssociation).toPromise();
          });

        Promise.all([...deletionPromises, ...creationPromises])
          .then(() => {
            this.loading = false;
            this.router.navigate(['/salones']);
          })
          .catch(err => {
            this.error = 'Error al guardar las asociaciones de imágenes';
            this.loading = false;
            console.error('Error:', err);
          });
      },
      error: (err) => {
        this.error = 'Error al obtener las asociaciones de imágenes actuales';
        this.loading = false;
        console.error('Error:', err);
      }
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
