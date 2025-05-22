import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionesService, Habitacion, HabitacionImagen, Imagen } from '../../../../../service/habitaciones.service';
import { TipoHabitacionService, TipoHabitacion } from '../../../../../service/tipo-habitacion.service';
import { SucursalService, Sucursal } from '../../../../../service/sucursal.service';
import { ImagenesService } from '../../../../../service/imagen.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-habitaciones-form',
  templateUrl: './habitaciones-form.component.html',
  styleUrls: ['./habitaciones-form.component.css'],
  standalone: false,
})
export class HabitacionesFormComponent implements OnInit {
  habitacionForm!: FormGroup;
  isEditing = false;
  id?: number;
  submitted = false;
  loading = false;
  error = '';


  tiposHabitacion: TipoHabitacion[] = [];
  sucursales: Sucursal[] = [];
  estadosHabitacion: string[] = [];
  imagenes: Imagen[] = [];
  selectedImagenes: Imagen[] = [];
  habitaciones: Habitacion[] = [];
  habitacion?: Habitacion;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private habitacionesService: HabitacionesService,
    private tipoHabitacionService: TipoHabitacionService,
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

  get f() { return this.habitacionForm.controls; }

  initForm(): void {
    this.habitacionForm = this.formBuilder.group({
      numero: [
        null,
        [
          Validators.required,
          this.numeroDuplicadoValidator()
        ]
      ],
      piso: [null, Validators.required],
      estado_habitacion: ["disponible"],
      estado: [1],
      tipo_habitacion: [null, Validators.required],
      sucursal: [{ value: null, disabled: !this.isEditing }, Validators.required]
    });
  }



  loadData(): void {
    this.loading = true;

    this.estadosHabitacion = this.habitacionesService.getEstadosHabitacion();


    this.habitacionesService.getHabitaciones().subscribe({
  next: (data) => {
    this.habitaciones = data;

    if (!this.habitacionForm) return;

    // Forzar actualización del validador
    this.habitacionForm.get('numero')?.updateValueAndValidity();
  },
  error: (err) => {
    this.error = 'Error al cargar habitaciones existentes';
    console.error('Error:', err);
  }
  });


    this.initForm();

  if (!this.isEditing) {
  this.habitacionForm.patchValue({
    estado_habitacion: 'Disponible'
  });

  }


  this.tipoHabitacionService.getTiposHabitacion().subscribe({
    next: (data) => {
      // Filtrar solo los tipos con estado = 1
      this.tiposHabitacion = data.filter((tipo) => tipo.estado === 1);
      this.loading = false;
    },
    error: (err) => {
      this.error = 'Error al cargar los tipos de habitación';
      this.loading = false;
      console.error('Error:', err);
    }
  });


    this.sucursalService.getSucursales().subscribe({
      next: (data) => {
      this.sucursales = data;
      if (!this.isEditing && this.sucursales.length > 0) {
        this.habitacionForm.patchValue({
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
    this.habitacionesService.getHabitacion(this.id).subscribe({
      next: (habitacion) => {
        this.habitacion = habitacion;
        this.habitacionForm.patchValue({
          piso: habitacion.piso,
          numero: habitacion.numero,
          tipo: habitacion.tipo_habitacion
        });

        this.habitacionesService.getHabitacionesImagenes().subscribe({
          next: (data) => {
            const habitacionImagenes = data.filter(hi => hi.habitacion.id_habitacion === this.id);
            this.selectedImagenes = habitacionImagenes.map(hi => hi.imagen);
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
        this.error = 'Error al cargar la habitación';
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

    if (this.habitacionForm.invalid) {
      console.warn('❌ Formulario inválido:', this.habitacionForm.value);
      return;
    }

    const habitacion: Habitacion = this.habitacionForm.value;
    console.log('✅ Enviando habitación:', habitacion);

    this.loading = true;

    const obs = this.isEditing
      ? this.habitacionesService.updateHabitacion({ ...habitacion, id_habitacion: this.id })
      : this.habitacionesService.createHabitacion(habitacion);

    obs.subscribe({
      next: (resp) => {
        console.log('✅ Respuesta del backend:', resp);
        this.loading = false;
        this.router.navigate(['/admin/habitaciones']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al guardar la habitación.';
        console.error('❌ Error al crear:', err);
      }
    });

    const msg = this.isEditing ? 'Habitación actualizada correctamente' : 'Habitación creada correctamente';

  Swal.fire({
    icon: 'success',
    title: msg,
    showConfirmButton: false,
    timer: 2000
  });
  }



  saveImagenes(habitacion: Habitacion): void {
    this.habitacionesService.getHabitacionesImagenes().subscribe({
      next: (data) => {
        const habitacionImagenes = data.filter(hi => hi.habitacion.id_habitacion === habitacion.id_habitacion);

        const deletionPromises = habitacionImagenes
          .filter(hi => !this.selectedImagenes.some(img => img.id_imagen === hi.imagen.id_imagen))
          .map(hi => this.habitacionesService.deleteHabitacionImagen(hi.id_hab_img!).toPromise());

        const creationPromises = this.selectedImagenes
          .filter(img => !habitacionImagenes.some(hi => hi.imagen.id_imagen === img.id_imagen))
          .map(img => {
            const newAssociation: HabitacionImagen = {
              habitacion: habitacion,
              imagen: img
            };
            return this.habitacionesService.createHabitacionImagen(newAssociation).toPromise();
          });

        Promise.all([...deletionPromises, ...creationPromises])
          .then(() => {
            this.loading = false;
            this.router.navigate(['/habitaciones']);
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
    this.router.navigate(['/admin/habitaciones']);
  }

  numeroDuplicadoValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.habitaciones || control.value === null) {
        return null;
      }

      const numero = control.value;
      const duplicado = this.habitaciones.some(h =>
        h.numero === numero && h.id_habitacion !== this.habitacion?.id_habitacion
      );

      return duplicado ? { numeroDuplicado: true } : null;
    };
  }

  editarTipoHabitacion(): void {
    const tipoControl = this.habitacionForm.get('tipo_habitacion');

    if (tipoControl && tipoControl.value) {
      // Obtén el objeto seleccionado (se supone que es un objeto tipo)
      const tipoSeleccionado = tipoControl.value;

      // Verifica si el objeto contiene la propiedad id_tipo_habitacion
      if (tipoSeleccionado && tipoSeleccionado.id_tipo_habitacion) {
        // Redirige a la ruta con el ID del tipo de habitación
        this.router.navigate(['/admin/recepcion/tipos/editar/', tipoSeleccionado.id_tipo_habitacion]);
      } else {
        this.error = 'El tipo de habitación seleccionado no tiene un ID válido.';
      }
    } else {
      this.error = 'Debes seleccionar un tipo de habitación para editar.';
    }
  }






}
