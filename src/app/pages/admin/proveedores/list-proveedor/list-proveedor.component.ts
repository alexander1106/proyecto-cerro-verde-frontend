import { Component } from '@angular/core';
import { UserService } from '../../../../service/user.service';
import { ProveedoresService } from '../../../../service/proveedores.service';
import Swal from 'sweetalert2';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-list-proveedor',
  standalone: false,
  templateUrl: './list-proveedor.component.html',
  styleUrl: './list-proveedor.component.css'
})
export class ListProveedorComponent {
  proveedores: any[] = []
  proveedoresFiltrados: any[] = [];
  filtroBusqueda: string = '';

  constructor(private proveedoresService: ProveedoresService, private router: Router) { }

  ngOnInit(): void {
    this.listarProveedor();
  }

  listarProveedor(){
    this.proveedoresService.listarProveedores().subscribe(
      (data: any) => {
        this.proveedores = data;
        console.log("Proveedores:" + this.proveedores);
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de los Proveedores", 'error')
      }
    )
  }

  editarProveedor(ruc: string){
    this.router.navigate(['/admin/edit-proveedor', ruc])
  }

  eliminarProveedor(id: string) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás recuperar el registro",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.proveedoresService.eliminarProveedor(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: "Eliminado",
              text: response.mensaje,
              icon: "success"
            });
            this.listarProveedor();
          }, 
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el proveedor",
              icon: "error"
            });
            console.log(error);
          }
        });
      }
    });
  }

  buscarProveedores() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(p =>
      p.razon_social.toLowerCase().includes(filtro) ||
      p.ruc_proveedor.toLowerCase().includes(filtro)
    );
  }
}
