import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecojosService, Recojos } from '../../../../../service/recojos.service';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';
import { ConductoresService, Conductores } from '../../../../../service/conductores.service';
import Swal from 'sweetalert2';

declare var google: any;

@Component({
  selector: 'app-recojos-form',
  templateUrl: './recojos-form.component.html',
  styleUrls: ['./recojos-form.component.css'],
  standalone: false,
})
export class RecojosFormComponent implements OnInit, AfterViewInit {
  recojoForm!: FormGroup;
  isEditing = false;
  id?: number;
  submitted = false;
  loading = false;
  error = '';
  reservas: Reserva[] = [];
  conductores: Conductores[] = [];
  recojos: Recojos[] = [];
  recojo?: Recojos;
  estado_recojos: string[] = ['Pendiente','En ruta','Completo']

  @ViewChild('autoInput') autoInput!: ElementRef<HTMLInputElement>;
  autocomplete!: google.maps.places.Autocomplete;
  selectedAddress: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private recojosService: RecojosService,
    private reservaService: ReservasService,
    private conductorService: ConductoresService,
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.id = +this.route.snapshot.params['id'];
    this.isEditing = !!this.id;

    // 💡 Esta suscripción debe ir después de que se inicialice el formulario (lo hace loadData → initForm)
    setTimeout(() => {
      this.recojoForm.get('conductor')?.valueChanges.subscribe(() => {
        this.recojoForm.get('fecha_hora')?.updateValueAndValidity();
      });
    }, 0); // Usamos setTimeout para asegurarnos de que `this.recojoForm` ya está definido

    if (this.isEditing) {
      this.loadRecojos();
    }

    this.loadGoogleMapsScript().then(() => {
      this.initAutocomplete();
    }).catch(err => console.error('Error loading Google Maps', err));
  }


  ngAfterViewInit(): void {
    this.initAutocomplete();
  }

  initForm(): void {
    this.recojoForm = this.formBuilder.group({
      destino: [null, Validators.required],
      fecha_hora: ['', [Validators.required, fechaNoPasada()]],
      estado: [1],
      conductor: [null, Validators.required],
      reserva: [null, Validators.required],
      estado_recojo: ['Pendiente']
    });

  }

  initAutocomplete(): void {
    this.autocomplete = new google.maps.places.Autocomplete(this.autoInput.nativeElement, {
      componentRestrictions: { country: 'pe' },
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(-7.7, -76.3),  // Sur-Oeste San Martín aprox
        new google.maps.LatLng(-5.8, -74.8)   // Norte-Este San Martín aprox
      ),
      strictbound: true,
      types: ['geocode', 'establishment']

    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (!place.address_components) {
        // No hay dirección válida
        return;
      }

      let streetNumber = '';
      let route = '';

      place.address_components.forEach((comp: any) => {
        if (comp.types.includes('street_number')) {
          streetNumber = comp.long_name;
        }
        if (comp.types.includes('route')) {
          route = comp.long_name;
        }
      });

      const fullAddress = route + (streetNumber ? ' ' + streetNumber : '');

      // Actualiza el formulario con la dirección completa
      this.recojoForm.patchValue({
        destino: fullAddress || place.formatted_address

      });
    });
  }

  get f() { return this.recojoForm.controls; }

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAkYQPOVZbjvIwodhGqeD0GvBIruF76hxQ&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  loadData(): void {
    this.loading = true;

    this.recojos = [];
    this.reservas = [];
    this.conductores = [];

    this.recojosService.getRecojos().subscribe({
      next: (data) => {
        this.recojos = data;

        if (this.recojoForm) {
          this.recojoForm.get('fecha_hora')?.setValidators([
            Validators.required,
            fechaNoPasada(),
            this.fechaDuplicadaValidator()
          ]);
          this.recojoForm.get('fecha_hora')?.updateValueAndValidity();
        }
      }
    });


    this.initForm();

    this.conductorService.getConductores().subscribe({
      next: (data) => {
        this.conductores = data.filter((conductor) => conductor.estado === 1);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los conductores';
        this.loading = false;
        console.error('Error:', err);
      }
    });

    this.reservaService.getReservas().subscribe({
      next: (data) => {
        this.reservas = data.filter((reserva) => reserva.estado === 1 && reserva.estado_reserva === "Pendiente" && reserva.tipo === "Habitación"   );
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los reservas';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  loadRecojos(): void {
    if (!this.id) return;

    this.loading = true;
    this.recojosService.getRecojo(this.id).subscribe({
      next: (recojo) => {
        this.recojo = recojo;

        // 2. Espera a que reservas y conductores se carguen
        const waitForData = () => {
          if (this.reservas.length && this.conductores.length) {
            this.recojoForm.patchValue({
              destino: recojo.destino,
              fecha_hora: recojo.fecha_hora,
              reserva: this.reservas.find(r => r.id_reserva === recojo.reserva.id_reserva),
              conductor: this.conductores.find(c => c.id_conductor === recojo.conductor.id_conductor),
              estado_recojo: recojo.estado_recojo
            });
            this.loading = false;
          } else {
            setTimeout(waitForData, 100); // vuelve a intentar en 100ms
          }
        };
        console.log('Valor actualizado:', this.recojoForm.get('estado_recojo')?.value);

        waitForData(); // inicia la espera
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

    if (this.recojoForm.invalid) {
      console.warn('❌ Formulario inválido:', this.recojoForm.value);
      return;
    }

    const recojo: Recojos = this.recojoForm.value;
    console.log('✅ Enviando recojo:', recojo);

    const guardar = () => {
      this.loading = true;

      const obs = this.isEditing
        ? this.recojosService.updateRecojo({ ...recojo, id_recojo: this.id })
        : this.recojosService.createRecojo(recojo);

      obs.subscribe({
        next: (resp) => {
          console.log('✅ Respuesta del backend:', resp);
          this.loading = false;

          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso',
            text: this.isEditing ? 'Recojo actualizado correctamente' : 'Recojo creado correctamente',
            showConfirmButton: false,
          customClass: {
            popup: 'border shadow rounded-4',
            confirmButton: 'btn btn-success px-4',
            title: 'fs-4 text-success',
            htmlContainer: 'fs-6 text-secondary'
          },
          buttonsStyling: false,
            timer: 2000
          });

          this.router.navigate(['/admin/programar-recojo']);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al guardar el recojo.';
          console.error('❌ Error al crear/actualizar:', err);
        }
      });
    };

    if (this.isEditing) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Estás a punto de actualizar este recojo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          guardar();
        }
      });
    } else {
      guardar();
    }
  }


  volver(): void {
    this.router.navigate(['/admin/programar-recojo']);
  }

  fechaDuplicadaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !this.recojos || !this.recojoForm) return null;

      const inputFecha = new Date(control.value).toISOString();
      const conductor = this.recojoForm.get('conductor')?.value;
      if (!conductor) return null;

      const existe = this.recojos.some((r) => {
        if (this.isEditing && r.id_recojo === this.recojo?.id_recojo) return false;
        const mismaFecha = new Date(r.fecha_hora).toISOString() === inputFecha;
        const mismoConductor = r.conductor?.id_conductor === conductor.id_conductor;
        return mismaFecha && mismoConductor;
      });

      return existe ? { fechaDuplicada: true } : null;
    };
  }


}

function fechaNoPasada(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    const ahora = new Date();
    const fechaHora = new Date(control.value);
    return fechaHora < ahora ? { fechaPasada: true } : null;
  };
}
