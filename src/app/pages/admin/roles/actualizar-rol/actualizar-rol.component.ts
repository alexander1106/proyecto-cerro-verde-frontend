import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../../../service/roles.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ModulosService } from '../../../../service/modulos.service';

@Component({
  selector: 'app-actualizar-rol',
  standalone: false,
  templateUrl: './actualizar-rol.component.html',
  styleUrl: './actualizar-rol.component.css'
})
export class ActualizarRolComponent implements OnInit {
  modulos: any[] = [];
  id_rol = 0;

  rol: any;
  permiso: any;


  constructor(
    private router: ActivatedRoute,
    private rolesService: RolesService,
    private routerEnlace: Router,
    private snack: MatSnackBar,
    private moduloService: ModulosService
  ) {}

  ngOnInit(): void {
    this.id_rol = this.router.snapshot.params['id'];
    if (!this.id_rol) {
      console.error('ID de rol no proporcionado');
      this.snack.open('ID de rol no válido', 'Cerrar', { duration: 3000 });
      return;
    }

    this.rolesService.obtenerRol(this.id_rol).subscribe(
      (data: any) => {
        this.rol = data;
        console.log('Permisos del rol cargado:', this.rol.rolesPermisos);
        this.cargarModulos(); // luego de obtener el rol
      },
      (error) => {
        console.log(error);
        this.snack.open('Error al cargar el rol', 'Cerrar', { duration: 3000 });
      }
    );
  }

  cargarModulos(): void {
    this.moduloService.listarModulos().subscribe(
      (modulos) => {
        const promesas = modulos.map((modulo: any) =>
          this.moduloService.obtenerPermisosPorModulo(modulo.idModulo).toPromise().then((permisos) => {
            modulo.permisos = permisos;
            return modulo;
          })
        );
        Promise.all(promesas).then((modulosConPermisos) => {
          this.modulos = modulosConPermisos;
          this.marcarPermisosAsignados();
        });
      },
      (error) => {
        console.error('Error al cargar módulos:', error);
      }
    );
  }

  private marcarPermisosAsignados(): void {
    if (!this.rol || !this.rol.rolesPermisos || !this.modulos) return;
    for (const modulo of this.modulos) {
      let moduloSeleccionado = false;
      for (const permiso of modulo.permisos) {
        const estaAsignado = this.rol.rolesPermisos.some(
          (rp: any) => Number(rp.permisos?.id) === Number(permiso.id)
        );
        permiso.seleccionado = estaAsignado;
        if (estaAsignado) {
          moduloSeleccionado = true;
        }
      }
      modulo.seleccionado = moduloSeleccionado;
    }
  }

  onSubmoduloChange(modulo: any): void {
    const todosSeleccionados = modulo.permisos.every((permiso: any) => permiso.seleccionado);
    modulo.seleccionado = todosSeleccionados;
  }

  onModuloChange(modulo: any): void {
    modulo.permisos.forEach((permiso: any) => {
      permiso.seleccionado = modulo.seleccionado;
    });
  }

  public cancelar(): void {
    this.routerEnlace.navigate(['/admin/roles']);
  }
  actualizarRol() {
    // Limpiar y construir nueva lista de permisos
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

    console.log('Rol actualizado con permisos:', this.rol.rolesPermisos);

    this.rolesService.actualizarRol(this.rol).subscribe(
      (data) => {
        Swal.fire("Rol actualizado", "Los cambios fueron guardados exitosamente", "success");
        this.routerEnlace.navigate(['/admin/roles']);
      },
      (error) => {
        console.error('Error al actualizar el rol:', error);
        Swal.fire("Error", "Ocurrió un error al actualizar el rol", "error");
      }
    );
  }

}
