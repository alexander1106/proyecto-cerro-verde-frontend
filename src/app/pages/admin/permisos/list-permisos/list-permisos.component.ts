import { Component, OnInit } from '@angular/core';
import { PermisosService } from '../../../../service/permisos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-permisos',
  standalone: false,
  templateUrl: './list-permisos.component.html',
  styleUrl: './list-permisos.component.css'
})
export class ListPermisosComponent implements OnInit {
  permisos:any=[
  ]


  constructor( private permisosSerivice:PermisosService){}
  ngOnInit(): void {
    this.permisosSerivice.listarPermisos().subscribe(
      (data:any)=> {
        this.permisos = data;
        console.log(this.permisos);
      },(error)=>{
        console.log(error);
        Swal.fire("error !!","Al cargar el listado de los trabajadores",'error')
      }

    )
  }


}
