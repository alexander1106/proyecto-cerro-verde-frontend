import { Component } from '@angular/core';
import { ModulosService } from '../../../service/modulos.service';
import { LoginService } from '../../../service/login.service';
import { Router } from '@angular/router';
import { UserService } from '../../../service/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil-user',
  standalone: false,
  templateUrl: './perfil-user.component.html',
  styleUrl: './perfil-user.component.css'
})
export class PerfilUserComponent {

  isLoggedIn = false;
  user:any = null;
  verActual: boolean = false;
  verNueva: boolean = false;
  verRepetir: boolean = false;

  passwordActual: string = '';
  nuevaPassword: string = '';
  repetirPassword: string = '';

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
    });

  }



  cerrar(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
    mostrarFormularioCambio: boolean = false;
  mensajeCambio: string = '';

  cambiarPassword(): void {
    if (!this.passwordActual || !this.nuevaPassword || !this.repetirPassword) {
      this.mensajeCambio = 'Debe completar todos los campos.';
      return;
    }

    if (this.nuevaPassword !== this.repetirPassword) {
      this.mensajeCambio = 'Las contraseñas nuevas no coinciden.';
      return;
    }

    const userId = this.user?.idUsuario;

    if (!userId) {
      this.mensajeCambio = 'Usuario no identificado.';
      return;
    }

    this.userService.cambiarPassword(userId, this.nuevaPassword)
      .subscribe({
        next: (resp: any) => {
          this.mensajeCambio = 'Contraseña actualizada exitosamente.';
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: this.mensajeCambio
          });
          this.passwordActual = '';
          this.nuevaPassword = '';
          this.repetirPassword = '';
          this.mostrarFormularioCambio = false;
        },
        error: (err) => {
          console.error('Error al cambiar la contraseña', err);
          if (err.status === 400) {
            this.mensajeCambio = 'La contraseña actual es incorrecta.';
          } else if (err.status === 500) {
            this.mensajeCambio = 'Error en el servidor al cambiar la contraseña.';
          } else {
            this.mensajeCambio = 'Error desconocido al cambiar la contraseña.';
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.mensajeCambio
          });
        }
      });
  }
}
