import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionesService, Habitacion } from '../../../../../service/habitaciones.service';
import { TipoHabitacionService, TipoHabitacion } from '../../../../../service/tipo-habitacion.service';
import { SucursalService, Sucursal } from '../../../../../service/sucursal.service';
import { PisosService, Pisos } from '../../../../../service/pisos.service';
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
  pisos: Pisos[] = [];
  habitaciones: Habitacion[] = [];
  habitacion?: Habitacion;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private habitacionesService: HabitacionesService,
    private tipoHabitacionService: TipoHabitacionService,
    private sucursalService: SucursalService,
    private pisosService: PisosService
  ) {}

  ngOnInit(): void {
    this.loadData(); // Esto incluye initForm()
  
    this.id = +this.route.snapshot.params['id'];
    this.isEditing = !!this.id;
  
    // Espera a que el formulario esté listo antes de cargar los datos de edición
    setTimeout(() => {
      if (this.isEditing) {
        this.loadHabitacion();
      }
    }, 0);
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

    this.pisosService.getPisos().subscribe({
      next: (data) => {
        this.pisos = data.filter((piso) => piso.estado === 1);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pisos';
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

  }

  loadHabitacion(): void {
    if (!this.id) return;

    this.loading = true;
    this.habitacionesService.getHabitacion(this.id).subscribe({
      next: (habitacion) => {
        this.habitacion = habitacion;
        const waitForData = () => {
          if(this.tiposHabitacion.length ){
            
            this.habitacionForm.patchValue({
              numero: habitacion.numero,
              tipo_habitacion: this.tiposHabitacion.find(h => h.id_tipo_habitacion === habitacion.tipo_habitacion.id_tipo_habitacion),
              piso: this.pisos.find(h => h.id_piso === habitacion.piso.id_piso),

            });
            
            this.loading=false;
          } else{
            setTimeout(waitForData,100);
          }
        };

        waitForData();

      },
      error: (err) => {
        this.error = 'Error al cargar el recojo';
        this.loading = false;
        console.error('Error:', err);
      }
      });
      

  }

  onSubmit(): void {
    this.submitted = true;
  
    if (this.habitacionForm.invalid) {
      console.warn('❌ Formulario inválido:', this.habitacionForm.value);
      return;
    }
  
    const habitacion: Habitacion = this.habitacionForm.value;
    console.log('✅ Preparando habitación:', habitacion);
  
    const guardar = () => {
      this.loading = true;
  
      const obs = this.isEditing
        ? this.habitacionesService.updateHabitacion({ ...habitacion, id_habitacion: this.id })
        : this.habitacionesService.createHabitacion(habitacion);
  
      obs.subscribe({
        next: (resp) => {
          console.log('✅ Respuesta del backend:', resp);
          this.loading = false;
  
          const msg = this.isEditing
            ? 'Habitación actualizada correctamente'
            : 'Habitación creada correctamente';
  
          Swal.fire({
            icon: 'success',
            title: '¡Registro guardado!',
            text: msg,
            showConfirmButton: false,
          customClass: {
            popup: 'border shadow rounded-4',
            confirmButton: 'btn btn-success px-4',
            title: 'fs-4 text-success',
            htmlContainer: 'fs-6 text-secondary'
          },
          buttonsStyling: false,
            timer: 2000
          }).then(() => {
            this.router.navigate(['/admin/habitaciones']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al guardar la habitación.';
          console.error('❌ Error:', err);
        }
      });
    };
  
    // Confirmar si es edición
    if (this.isEditing) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Se actualizarán los datos de la habitación.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      }).then((result) => {
        if (result.isConfirmed) {
          guardar();
        }
      });
    } else {
      guardar(); // Si no es edición, guardar directamente
    }
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
        h.numero === numero && h.id_habitacion !== this.habitacion?.id_habitacion && h.estado===1
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
