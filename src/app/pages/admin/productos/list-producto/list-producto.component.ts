import { Component } from '@angular/core';
import { ProductosService } from '../../../../service/productos.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-producto',
  standalone: false,
  templateUrl: './list-producto.component.html',
  styleUrl: './list-producto.component.css'
})
export class ListProductoComponent {

  productos: any[] = [];
  productosFiltrados: any[] = [];
  filtroBusqueda: string = '';

  constructor(private productosService: ProductosService, private router: Router) { }

  ngOnInit(): void {
    this.listarProductos();
  }

  listarProductos() {
    this.productosService.listarProductos().subscribe(
      (data: any) => {
        this.productos = data;
        console.log("Productos:" + this.productos);
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de los Productos", 'error')
      }
    )
  }

  editarProducto(id: number) {
    this.router.navigate(['/admin/edit-producto', id])
  }

  eliminarProducto(id: number) {
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
        this.productosService.eliminarProducto(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: "Eliminado",
              text: response.mensaje,
              icon: "success"
            });
            this.listarProductos();
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el producto",
              icon: "error"
            });
            console.log(error);
          }
        });
      }
    });
  }

  buscarProductos() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.productosFiltrados = this.productos.filter(c =>
      c.nombre.toLowerCase().includes(filtro) ||
      c.categoriaproducto.nombre.toLowerCase().includes(filtro)
    );
  }
}
