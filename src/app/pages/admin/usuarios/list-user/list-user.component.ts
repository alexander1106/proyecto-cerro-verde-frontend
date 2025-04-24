import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../service/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-user',
  standalone: false,
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css'
})
export class ListUserComponent implements OnInit{

  usuarios:any[]=[]
  trabajadoresFiltrados: any[] = [];
  filtroBusqueda: string = '';

  constructor( private usuariosService:UserService){}
  ngOnInit(): void {
    this.usuariosService.listarTrabajadores().subscribe(
      (data:any)=> {
        this.usuarios = data;
        console.log(this.usuarios);
      },(error)=>{
        console.log(error);
        Swal.fire("error !!","Al cargar el listado de los trabajadores",'error')
      }
    )
  }

  buscarTrabajadores() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.trabajadoresFiltrados = this.usuarios.filter(t =>
      t.nombre.toLowerCase().includes(filtro) ||
      t.username.toLowerCase().includes(filtro)
    );
  }
}
