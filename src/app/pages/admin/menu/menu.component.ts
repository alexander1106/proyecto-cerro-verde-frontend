import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../service/login.service';
import { Router } from '@angular/router';
import { ModulosService } from '../../../service/modulos.service';
import { A } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  modulos: any[] = [];

  isLoggedIn = false;
  user:any = null;

  constructor(
    private moduloService: ModulosService,
    private loginService: LoginService,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.user = this.loginService.getUser();

    this.loginService.loginStatusSubjec.asObservable().subscribe(() => {
      this.isLoggedIn = this.loginService.isLoggedIn();
      this.user = this.loginService.getUser();
      this.cargarModulos(); // Recargar cuando cambia el estado de login
    });

    if (this.user) {
      this.cargarModulos(); // Solo carga si hay usuario
    }
  }

  cargarModulos(): void {
    const permisosDelRol = this.user?.rol?.rolesPermisos?.map(
      (rp: any) => rp.permisos?.nombrePermiso
    ) || [];

    this.moduloService.listarModulos().subscribe({
      next: async (modulos) => {
        const modulosConPermisos = await Promise.all(
          modulos.map(async (modulo: any) => {
            const permisos = await this.moduloService
              .obtenerPermisosPorModulo(modulo.idModulo)
              .toPromise();

            // Filtra solo los permisos que están en el rol
            const permisosFiltrados = permisos.filter((permiso: any) =>
              permisosDelRol.includes(permiso.nombrePermiso)
            );

            return {
              ...modulo,
              permisos: permisosFiltrados,
            };
          })
        );

        // Muestra solo módulos con al menos un permiso
        this.modulos = modulosConPermisos.filter(mod => mod.permisos.length > 0);
      },
      error: (error) => {
        console.error('Error al cargar los módulos:', error);
      }
    });
  }

  cerrar(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

}
