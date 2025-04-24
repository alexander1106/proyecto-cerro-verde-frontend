import { Component } from '@angular/core';
import { UserService } from '../../../../service/user.service';
import { ProveedoresService } from '../../../../service/proveedores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-proveedor',
  standalone: false,
  templateUrl: './list-proveedor.component.html',
  styleUrl: './list-proveedor.component.css'
})
export class ListProveedorComponent {
  proveedores:any[]=[]
  proveedoresFiltrados: any[] = [];
  filtroBusqueda: string = '';

  constructor( private proveedoresService:ProveedoresService){}

  ngOnInit(): void {
      this.proveedoresService.listarProveedores().subscribe(
        (data:any)=> {
          this.proveedores = data;
          console.log(this.proveedores);
        },(error)=>{
          console.log(error);
          Swal.fire("error !!","Al cargar el listado de los Proveedores",'error')
        }
      )
  }

  buscarTrabajadores() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(p =>
      p.razon_social.toLowerCase().includes(filtro) ||
      p.ruc_proveedor.toLowerCase().includes(filtro)
    );
  }
}
