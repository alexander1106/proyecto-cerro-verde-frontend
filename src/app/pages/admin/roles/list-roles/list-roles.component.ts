import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../../../service/roles.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-roles',
  standalone: false,
  templateUrl: './list-roles.component.html',
  styleUrl: './list-roles.component.css'
})
export class ListRolesComponent implements OnInit {
  filtroBusqueda: string = '';  // Iniciar con valor vacío
  roles: any[] = [];
  rolesFiltrados: any[] = [];

  constructor(
    private rolesService: RolesService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private router:Router,
  ) {}
  editarCategoria(id: number) {
    this.router.navigate(['/admin/edit-categoria', id])
  }

  ngOnInit(): void {
    this.rolesService.listarRoles().subscribe(
      (data: any) => {
        try {
          this.roles = data;
          this.rolesFiltrados = data;
          console.log(this.roles);  // Verifica que los roles tengan la propiedad id_rol
        } catch (error) {
          console.error('Error al parsear los datos:', error);
          Swal.fire("Error", "Los datos recibidos no son válidos", 'error');
        }
      },
      (error) => {
        console.error(error);
        Swal.fire("Error", "Al cargar el listado de los roles", 'error');
      }
    );
  }


  // Método para filtrar roles
  buscarRoles(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.rolesFiltrados = this.roles.filter((rol: any) =>
      rol.nombreRol?.toLowerCase().includes(filtro)  // Asegurarse de que se use el nombreRol
    );
  }
  cambiarEstadoRol(rol: any): void {
    const nuevoEstado = !rol.estado;

    this.rolesService.actualizarEstado(rol.idRol, nuevoEstado).subscribe({
      next: () => {
        rol.estado = nuevoEstado;
        this.snack.open('Estado actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error(err);
        this.snack.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
      }
    });
  }


  // Método para eliminar un rol (si es necesario)
  eliminarRol(rol: any): void {
    // Implementar lógica para eliminar un rol
    console.log(`Eliminar rol: ${rol}`);
  }

  // Método para asignar servicios a un rol (si es necesario)
  asignarServicios(rol: any): void {
    // Implementar lógica para asignar servicios a un rol
    console.log(`Asignar servicios a rol: ${rol}`);
  }
}
