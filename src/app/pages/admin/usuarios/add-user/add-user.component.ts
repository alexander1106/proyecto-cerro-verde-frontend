import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../service/user.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RolesService } from '../../../../service/roles.service';
import { ModulosService } from '../../../../service/modulos.service';
import { NgForm } from '@angular/forms';

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


  mostrarPassword: boolean = false;

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
        console.log('Roles recibidos:', this.roles); // Agrega esta línea para depuración
        if (this.roles.length > 0) {
          this.rolSeleccionado = this.roles[0].id; // Selecciona el primer rol si no hay valor previo
        }
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
  formSubmit(form: NgForm) {

   if (!form.valid) {
    this.snack.open('Por favor complete todos los campos obligatorios', 'Aceptar', {
      duration: 3000,
    });
    return;
  }
  // Validación de la contraseña
  const password = this.user.password;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(this.user.password)) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña no válida',
      text: 'La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un símbolo.',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

    // Asegúrate de que el rol seleccionado es el correcto
    const selectedRole = this.roles.find((role: any) => role.id === this.rolSeleccionado);

    if (selectedRole) {
      this.user.rol.id = this.rolSeleccionado ?? 0;

      this.user.rol.nombreRol = selectedRole.nombreRol;
      this.user.rol.descripcion = selectedRole.descripcion;

    }



    console.log('Usuario con permisos:', this.user); // Verifica el objeto `user` con los permisos agregados
    this.userService.añadirUsuario(this.user).subscribe(
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
