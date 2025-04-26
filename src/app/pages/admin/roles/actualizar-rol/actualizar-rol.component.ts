import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../../../service/roles.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-actualizar-rol',
  standalone: false,
  templateUrl: './actualizar-rol.component.html',
  styleUrl: './actualizar-rol.component.css'
})
export class ActualizarRolComponent implements OnInit {

  id_rol=0
  rol:any
  constructor(private router:ActivatedRoute, private rolesService:RolesService,
    private routerEnlace:Router, private snack:MatSnackBar
  ){}
  ngOnInit(): void {
    this.id_rol = this.router.snapshot.params['id'];  // Matching the 'id' parameter
    this.rolesService.obtenerRol(this.id_rol).subscribe(
      (data: any) => {
        this.rol = data;
      },
      (error) => {
        console.log(error);
        this.snack.open('Error al cargar los datos del rol', 'Cerrar', { duration: 3000 });
      }
    );

  }
  public cancelar() {
    this.routerEnlace.navigate(['/admin/roles']);
  }
  public actualizarDatos(){
    this.rolesService.actualizarRol(this.rol).subscribe(
      (data)=>{
        Swal.fire("Excelente", "El rol ha sido actualizado con exito", "success").then(
          (result)=>{
            this.routerEnlace.navigate(["/admin/roles"])
          }
        )
      },(error)=>{
        Swal.fire("Error", "Error al actualizar el rol", "error");
        console.log(error);
      }
    )
  }

}
