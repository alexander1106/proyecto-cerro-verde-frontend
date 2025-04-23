import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../../../service/roles.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { AddRolComponent } from '../add-rol/add-rol.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActualizarRolComponent } from '../actualizar-rol/actualizar-rol.component';

@Component({
  selector: 'app-list-roles',
  standalone: false,
  templateUrl: './list-roles.component.html',
  styleUrl: './list-roles.component.css'
})
export class ListRolesComponent  implements OnInit {
eliminarRol(_t28: any) {
throw new Error('Method not implemented.');
}
rol:any

  roles:any=[
  ]
  constructor( private rolesService:RolesService, private dialog:MatDialog, private snack:MatSnackBar){}

  ngOnInit(): void {
    this.rolesService.listarRoles().subscribe(
      (data:any)=> {
        this.roles = data;
        console.log(this.roles);
      },(error)=>{
        console.log(error);
        Swal.fire("error !!","Al cargar el listado de los roles",'error')
      }
    )
  }



}

