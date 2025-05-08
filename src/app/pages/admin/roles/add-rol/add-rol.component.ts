import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../../../service/roles.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ModulosService } from '../../../../service/modulos.service';

@Component({
  selector: 'app-add-rol',
  standalone: false,
  templateUrl: './add-rol.component.html',
  styleUrls: ['./add-rol.component.css']
})
export class AddRolComponent implements OnInit {
  modulos: any[] = [];

  public rol = {
    nombreRol: '',
    descripcion: '',
    estado: '',
    rolesPermisos: [] as { permisos: { id: number } }[]
  }

  constructor(
    private rolesService: RolesService,
    private snack: MatSnackBar,
    private router: Router,
    private moduloService: ModulosService
  ) {}

  ngOnInit(): void {
    this.cargarModulos();
  }
  formSubmit(form: any) {
    if (!form.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Por favor, complete todos los campos obligatorios.',
        confirmButtonText: 'Cerrar'
      });
      return;
    }

    this.rol.rolesPermisos = [];

    this.modulos.forEach((modulo) => {
      modulo.permisos.forEach((permiso: any) => {
        if (permiso.seleccionado) {
          this.rol.rolesPermisos.push({
            permisos: { id: permiso.id }
          });
        }
      });
    });

    console.log(this.rol);
    console.log(this.rol.rolesPermisos);

    this.rolesService.agregarRol(this.rol).subscribe(
      (data) => {
        Swal.fire("Excelente", "El rol fue registrado con éxito en el sistema", "success");
        this.router.navigate(["/admin/roles"]);
      },
      (error) => {
        if (error.status === 409) {
          Swal.fire("Error", error.error || "El nombre del rol ya existe en el sistema", "error");
        } else {
          Swal.fire("Error", "Ocurrió un error al registrar el rol", "error");
          console.error("Error al registrar el rol:", error);
        }
      }
    );
  }

  cargarModulos(): void {
    this.moduloService.listarModulos().subscribe(
      (modulos) => {
        const modulosConPermisos = modulos.map((modulo: any) => {
          return this.moduloService.obtenerPermisosPorModulo(modulo.idModulo).toPromise()
            .then((permisos) => {
              console.log(`Permisos del módulo ${modulo.idModulo}:`, permisos);
              modulo.permisos = permisos;
              return modulo;
            });
        });

        Promise.all(modulosConPermisos).then((result) => {
          this.modulos = result;
        });
      },
      (error) => {
        console.error('Error al cargar los módulos:', error);
      }
    );
  }

  onSubmoduloChange(modulo: any): void {
    const todosSeleccionados = modulo.permisos.every((per: any) => per.seleccionado);
    modulo.seleccionado = todosSeleccionados;
  }


  onModuloChange(modulo: any): void {
    modulo.permisos.forEach((sub: any) => {
      sub.seleccionado = modulo.seleccionado;
    });
  }


}
