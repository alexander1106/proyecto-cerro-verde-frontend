    import { Component, OnInit } from '@angular/core';
    import { MatSnackBar } from '@angular/material/snack-bar';
    import { LoginService } from '../../service/login.service';
    import { Router } from '@angular/router';
    import Swal from 'sweetalert2';

    @Component({
      selector: 'app-login',
      standalone: false,
      templateUrl: './login.component.html',
      styleUrls: ['./login.component.css']
    })
    export class LoginComponent implements OnInit{
      loginData = {
        "username": "",
        "password": ""
      }
      hide: any = true;
      mensajeError: string = '';

      constructor(private snack: MatSnackBar, private loginService: LoginService, private router: Router) {}

      ngOnInit(): void {}

      formSubmit() {
        if (this.loginData.username.trim() === '' || this.loginData.username.trim() == null) {
          this.snack.open("El nombre de usuario es requerido", "Aceptar", {
            duration: 3000
          });
          return;
        }

        if (this.loginData.password.trim() === '' || this.loginData.password.trim() == null) {
          this.snack.open("La contraseña es requerida", "Aceptar", {
            duration: 3000
          });
          return;
        }

        this.loginService.generarToken(this.loginData).subscribe(
          (data: any) => {
            this.loginService.loginUser(data.token);

            this.loginService.getCurrentUser().subscribe(
              (user: any) => {
                this.loginService.setUser(user);

                // Validar si el usuario está habilitado
                if (!user.enabled) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Usuario deshabilitado',
                    text: 'Su cuenta está deshabilitada. Contacte al administrador.',
                    confirmButtonText: 'Aceptar'
                  });
                  localStorage.clear();
                  return;
                }

                // Validar si el rol está habilitado
                if (!user.rol.estado) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Rol deshabilitado',
                    text: 'El rol asignado a su cuenta está deshabilitado. Contacte al administrador.',
                    confirmButtonText: 'Aceptar'
                  });
                  localStorage.clear();
                  return;
                }

                // Si todo está bien, redirigir
                this.router.navigate(['admin']);
              },
              (error) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error al obtener datos del usuario',
                  text: 'No se pudo obtener la información del usuario.',
                  confirmButtonText: 'Aceptar'
                });
              }
            );
          },
          (error) => {
            if (error.error.error === 'USUARIO DESHABILITADO') {
              Swal.fire({
                icon: 'error',
                title: 'Usuario deshabilitado',
                text: 'Su cuenta ha sido deshabilitada. Por favor, contacte con el administrador.',
                confirmButtonText: 'Aceptar'
              });

            } else {
              Swal.fire({
                icon: 'error',
                title: 'Credenciales inválidas',
                text: 'Por favor, verifique su usuario y contraseña.',
                confirmButtonText: 'Aceptar'
              });
            }
          }
        );
      }

    }
