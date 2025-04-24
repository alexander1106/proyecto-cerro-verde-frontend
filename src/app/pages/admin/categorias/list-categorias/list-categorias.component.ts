import { Component } from '@angular/core';
import { CategoriasService } from '../../../../service/categorias.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-categorias',
  standalone: false,
  templateUrl: './list-categorias.component.html',
  styleUrl: './list-categorias.component.css'
})
export class ListCategoriasComponent {
  categorias: any[] = []
  categoriasFiltrados: any[] = [];
  filtroBusqueda: string = '';

  constructor(private categoriasService: CategoriasService, private router: Router) { }

  ngOnInit(): void {
    this.listarCategorias();
  }

  listarCategorias() {
    this.categoriasService.listarCategoria().subscribe(
      (data: any) => {
        this.categorias = data;
        console.log("Proveedores:" + this.categorias);
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de los Proveedores", 'error')
      }
    )
  }

  editarCategoria(id: number) {
    this.router.navigate(['/admin/edit-categoria', id])
  }

  eliminarCategoria(id: number) {
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
        this.categoriasService.eliminarCategoria(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: "Eliminado",
              text: response.mensaje,
              icon: "success"
            });
            this.listarCategorias();
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la categoria",
              icon: "error"
            });
            console.log(error);
          }
        });
      }
    });
  }

  buscarCategorias() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.categoriasFiltrados = this.categorias.filter(c =>
      c.nombre.toLowerCase().includes(filtro)
    );
  }
}
