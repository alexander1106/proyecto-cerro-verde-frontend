      import { Component, OnInit } from '@angular/core';
      import { UserService } from '../../../../service/user.service';
      import Swal from 'sweetalert2';
      import { MatSnackBar } from '@angular/material/snack-bar';
      import { Router } from '@angular/router';
      import { RolesService } from '../../../../service/roles.service';
      import { ModulosService } from '../../../../service/modulos.service';

      @Component({
        selector: 'app-add-user',
        standalone: false,
        templateUrl: './add-user.component.html',
        styleUrl: './add-user.component.css'
      })
      export class AddUserComponent implements OnInit {
        rolSeleccionado: number | null = null;
        roles: any;
        modulos: any[] = [];
        imagenPrevia: string | ArrayBuffer | null = null;

        public user = {
          username: '',
          password: '',
          nombre: '',
          apellidos: '',
          email: '',
          telefono: '',
          perfil: '',
          enable: true,
          rol: {
            idRol: 0,
            nombreRol: '',
            descripcion: '',
            estado: true,
            rolesPermisos: [{
                roles: {
                  idRol: 0
                },
                permisos: {
                  idPermiso: 0
                }
            }
          ]
          }
        };

        constructor(
          private userService: UserService,
          private snack: MatSnackBar,
          private router: Router,
          private rolesService: RolesService,
          private modulosService: ModulosService
        ) {}

        ngOnInit(): void {
          this.rolesService.listarRoles().subscribe(
            (data: any) => {
              this.roles = data;
            },
            (error) => {
              console.log(error);
              Swal.fire('Error !!', 'Al cargar el listado de los roles', 'error');
            }
          );
          this.cargarModulos();
        }

        onFileSelected(event: any): void {
          const file = event.target.files[0];
          if (file) {
            this.user.perfil = 'assets/' + file.name;
            const reader = new FileReader();
            reader.onload = () => {
              this.imagenPrevia = reader.result;
            };
            reader.readAsDataURL(file);
          }
        }

        onSubmoduloChange(modulo: any): void {
          const todosSeleccionados = modulo.submodulos.every((sub: any) => sub.seleccionado);
          modulo.seleccionado = todosSeleccionados;
        }

        onModuloChange(modulo: any): void {
          modulo.submodulos.forEach((sub: any) => {
            sub.seleccionado = modulo.seleccionado;
          });
        }

        formSubmit() {
          if (!this.rolSeleccionado) {
            this.snack.open('Debe seleccionar un rol', 'Aceptar', {
              duration: 3000,
            });
            return;
          }
          // Asignar valores del rol
          const selectedRole = this.roles.find((role: any) => role.idRol === this.rolSeleccionado);
          if (selectedRole) {
            this.user.rol.idRol = this.rolSeleccionado;
            this.user.rol.nombreRol = selectedRole.nombreRol;
            this.user.rol.descripcion = selectedRole.descripcion;
            this.user.rol.rolesPermisos = [];

            // Recopilar los submódulos seleccionados
            this.modulos.forEach(modulo => {
              modulo.submodulos.forEach((sub: { seleccionado: boolean; idSubModulo: number }) => {
                if (sub.seleccionado) {
                  this.user.rol.rolesPermisos.push({
                    roles: {
                      idRol: this.user.rol.idRol
                    },
                    permisos: {
                      idPermiso: sub.idSubModulo
                    }
                  });
                }
              });
            });
          }
          console.log(this.user); // Verifica el objeto `user` con los permisos agregados
          this.userService.añadirUsuario(this.user).subscribe(
            (data) => {
              Swal.fire('Usuario guardado', 'Usuario registrado con éxito', 'success');
              this.router.navigate(['/admin/usuarios']);
            },
            (error) => {
              if (error.status === 409) {
                Swal.fire({
                  icon: 'error',
                  title: 'Correo ya registrado',
                  text: 'El correo electrónico ya está registrado, por favor intente con otro.',
                  confirmButtonText: 'Aceptar'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error en el sistema',
                  text: 'Ha ocurrido un error en el sistema, por favor intente nuevamente.',
                  confirmButtonText: 'Aceptar'
                });
              }
              console.error(error);
            }
          );
        }

        cargarModulos(): void {
          this.modulosService.listarModulos().subscribe(
            (modulos) => {
              const modulosConSubmodulos = modulos.map((modulo: any) => {
                return this.modulosService.obtenerSubmodulosPorModulo(modulo.idModulo).toPromise()
                  .then((submodulos) => {
                    modulo.submodulos = submodulos;
                    return modulo;
                  });
              });
              Promise.all(modulosConSubmodulos).then((result) => {
                this.modulos = result;
              });
            },
            (error) => {
              console.error('Error al cargar los módulos:', error);
            }
          );
        }
      }
