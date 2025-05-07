import { Component } from '@angular/core';
import { ModulosService } from '../../../service/modulos.service';
import { LoginService } from '../../../service/login.service';
import { Router } from '@angular/router';
import { UserService } from '../../../service/user.service';

@Component({
  selector: 'app-perfil-user',
  standalone: false,
  templateUrl: './perfil-user.component.html',
  styleUrl: './perfil-user.component.css'
})
export class PerfilUserComponent {

  modulos: any[] = [];

  isLoggedIn = false;
  user:any = null;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private userService: UserService  // <--- Agregado
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

  }

  cerrar(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
  passwordActual: string = '';
  nuevaPassword: string = '';
  mostrarFormularioCambio: boolean = false;
  mensajeCambio: string = '';

  cambiarPassword(): void {
    if (!this.passwordActual || !this.nuevaPassword) {
      this.mensajeCambio = 'Debe completar ambos campos.';
      return;
    }

    const userId = this.user?.idUsuario;

    if (!userId) {
      this.mensajeCambio = 'Usuario no identificado.';
      return;
    }

    // Aquí te aseguras de que el cuerpo de la solicitud esté bien formado
    this.userService.cambiarPassword(userId, this.nuevaPassword)
      .subscribe({
        next: (resp: any) => {
          this.mensajeCambio = 'Contraseña actualizada exitosamente.';
          this.passwordActual = '';
          this.nuevaPassword = '';
          this.mostrarFormularioCambio = false;
        },
        error: (err) => {
          console.error('Error al cambiar la contraseña', err);  // Agrega un log para ver detalles
          if (err.status === 400) {
            this.mensajeCambio = 'La contraseña actual es incorrecta.';
          } else if (err.status === 500) {
            this.mensajeCambio = 'Error en el servidor al cambiar la contraseña.';
          } else {
            this.mensajeCambio = 'Error desconocido al cambiar la contraseña.';
          }
        }

      });
  }



}

