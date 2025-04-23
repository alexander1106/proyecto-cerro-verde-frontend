import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../../../service/roles.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-add-rol',
  standalone: false,
  templateUrl: './add-rol.component.html',
  styleUrl: './add-rol.component.css'
})
export class AddRolComponent implements OnInit  {

public rol={
    nombreRol:'',
    descripcion:'',
    estado:'',
  }

  constructor(private rolesService:RolesService, private snack:MatSnackBar, private router:Router){}
  ngOnInit(): void {
  }

  formSubmit(){
    console.log(this.rol);
    this.rolesService.agregarRol(this.rol).subscribe(
      (data)=>{
        Swal.fire("Excelente","El rol fue registrado con exito en el sistema", "success");
        this.router.navigate(["/admin/roles" ])
        console.log(data);
      },(error)=>{
        console.log(error);
        this.snack.open('Ha ocurrido un error en el sistema !!', 'Acpetar',{
          duration: 3000,
        });
      }
    )
  }

}
