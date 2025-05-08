import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../service/user.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolesService } from '../../../../service/roles.service';
import { ModulosService } from '../../../../service/modulos.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-actualizar-user',
  standalone: false,
  templateUrl: './actualizar-user.component.html',
  styleUrl: './actualizar-user.component.css'
})
export class ActualizarUserComponent implements OnInit {
  idUser=0;
  usuario:any;

  rolSeleccionado: number | null = null;
          roles: any;
          permisos:any[]=[];
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
              id: 0,
              nombreRol: '',
              descripcion: '',
              estado: true,
              rolesPermisos: [{
                  permisos: {
                    id: 0
                  }
              }
            ]
            },
            usuariosPermisos:[
              {
              permisos:{
                id:0
              }
            }]
          };

          constructor(
            private userService: UserService,
            private snack: MatSnackBar,
            private route:ActivatedRoute,
            private router: Router,
            private rolesService: RolesService,
            private modulosService: ModulosService
          ) {}
          ngOnInit(): void {
            this.idUser = this.route.snapshot.params['id'];

            // Cargar los roles
            this.rolesService.listarRoles().subscribe(
              (data: any) => {
                this.roles = data;
                if (this.roles.length > 0) {
                  this.rolSeleccionado = this.roles[0].id;
                }
              },
              (error) => {
                console.log(error);
                Swal.fire('Error !!', 'Al cargar el listado de los roles', 'error');
              }
            );

                  // Luego de tener módulos cargados, obtenemos al usuario
                  this.userService.obtenerUsuario(this.idUser).subscribe(
                    (data: any) => {
                      this.user = data;
                      this.rolSeleccionado = this.user.rol?.id ?? null;


                    },
                    (error) => {
                      console.log(error);
                      this.snack.open('Error al cargar los datos del usuario', 'Cerrar', { duration: 3000 });
                    }
                  );

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
            });}

          formSubmit() {
            // Verifica si el rol seleccionado no es válido
            if (!this.rolSeleccionado) {
              this.snack.open('Debe seleccionar un rol', 'Aceptar', {
                duration: 3000,
              });
              return;
            }

            // Asegúrate de que el rol seleccionado es el correcto
            const selectedRole = this.roles.find((role: any) => role.id === this.rolSeleccionado);

            if (selectedRole) {
              this.user.rol.id = this.rolSeleccionado;
              this.user.rol.nombreRol = selectedRole.nombreRol;
              this.user.rol.descripcion = selectedRole.descripcion;
              this.user.rol.rolesPermisos = [];



            }

            console.log('Usuario con permisos:', this.user); // Verifica el objeto `user` con los permisos agregados
            this.userService.editarUsuario(this.user).subscribe(
              (data) => {
                Swal.fire('Usuario guardado', 'Usuario registrado con éxito', 'success');
                this.router.navigate(['/admin/usuarios']);
              },
              (error) => {
                if (error.status === 409) {
                  const mensaje = error.error;

                  if (mensaje.includes('correo') || mensaje.includes('Correo')) {
                    Swal.fire({
                      icon: 'error',
                      title: 'Correo ya registrado',
                      text: 'El correo electrónico ya está registrado, por favor intente con otro.',
                      confirmButtonText: 'Aceptar'
                    });
                  } else if (mensaje.includes('usuario') || mensaje.includes('Usuario')) {
                    Swal.fire({
                      icon: 'error',
                      title: 'Usuario ya registrado',
                      text: 'El nombre de usuario ya está en uso, por favor elija otro.',
                      confirmButtonText: 'Aceptar'
                    });
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Conflicto',
                      text: mensaje,
                      confirmButtonText: 'Aceptar'
                    });
                  }
                }
                 else {
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

        }
