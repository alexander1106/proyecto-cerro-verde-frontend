import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PisosService, Pisos } from '../../../../../service/pisos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pisos-form',
  standalone: false,
  templateUrl: './pisos-form.component.html',
  styleUrls: ['./pisos-form.component.css']
})
export class PisosFormComponent implements OnInit {
  pisoForm!: FormGroup;
  isEditing = false;
  id?: number;
  submitted = false;
  loading = false;
  error = '';
  resultado: any = null;
  pisos: Pisos[] = [];
  piso?: Pisos;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pisoService: PisosService
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.params['id'];
    this.isEditing = !!this.id;

    this.pisoForm = this.formBuilder.group({
      numero: [null, Validators.required],
      estado: [1]
    });

    this.pisoService.getPisos().subscribe((pisos) => {
      this.pisos = pisos;

      if (this.isEditing) {
        this.pisoService.getPiso(this.id!).subscribe({
          next: (piso) => {
            this.piso = piso;

            this.pisoForm.patchValue({
              numero: piso.numero
            });

            this.setCustomValidators();
          },
          error: (err) => {
            this.error = 'Error al cargar el piso';
          }
        });
      } else {
        this.setCustomValidators();
      }
    });
  }


  setCustomValidators(): void {
    this.f['numero'].setValidators([
      Validators.required,
    ]);
  }


  get f() { return this.pisoForm.controls; }

  initForm(): void {
    this.pisoForm = this.formBuilder.group({
      numero: [
        null,
        [Validators.required]
      ],
      estado: [1]
    });
  }


  loadPisos(): void {
    if (!this.id) return;

    this.loading = true;
    this.pisoService.getPiso(this.id).subscribe({
      next: (piso) => {
        if (piso) {
          this.pisoForm.patchValue({
            numero: piso.numero
          });
        } else {
          this.error = 'No se encontró el piso';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el piso';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }


  onSubmit(): void {
    this.submitted = true;
    if (this.pisoForm.invalid) return;

    const piso: Pisos = {
      ...this.pisoForm.getRawValue(),
      ...(this.isEditing ? { id_piso: this.id } : {})
    };

    const guardar = () => {
      this.loading = true;

      const savePiso = this.pisoService.createPiso(piso);

      savePiso.subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Piso creado',
            showConfirmButton: false,
            timer: 1500
          });
          this.router.navigate(['/admin/pisos']);
        },
        error: (err) => {
          this.error = `Error al crear el piso`;
          this.loading = false;
          console.error('Error:', err);
        }
      });
    };

    guardar();
  }


  volver(): void {
    this.router.navigate(['/admin/pisos']);
  }


  numeroDuplicadoValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.pisos || control.value === null) {
        return null;
      }

      const piso = control.value;
      const duplicado = this.pisos.some(h =>
        h.numero === piso && h.id_piso !== this.piso?.id_piso && h.estado===1
      );

      return duplicado ? { numeroDuplicado: true } : null;
    };
  }

}
