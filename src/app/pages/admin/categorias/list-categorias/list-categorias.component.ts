import { Component } from '@angular/core';
import { CategoriasService } from '../../../../service/categorias.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  mostrarModal: boolean = false;
  public categoria = {
    id_categoria: '',
    nombre: '',
    estado: '1'
  };
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private categoriasService: CategoriasService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.listarCategorias();
  }

  //ACCIONES DEL MODAL
  verModal() {
    this.mostrarModal = true;
  }
  cerrarModal() {
    this.categoria.nombre = '';
    this.categoria.id_categoria = '';
    this.mostrarModal = false;
  }

  //MOSTRAR LAS CATEGORIAS
  listarCategorias() {
    this.categoriasService.listarCategoriasActivos().subscribe(
      (data: any) => {
        this.categorias = data;
        this.categoriasFiltrados = [...this.categorias];
        this.actualizarPaginacion();
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de las categorias", 'error')
      }
    )
  }

  //REGISTRAR CATEGORIA
  formSubmit() {
    this.categoriasService.registrarCategoria(this.categoria).subscribe(
      (data) => {
        Swal.fire("Excelente", "La Categoria fue registrado con éxito", "success");
        this.listarCategorias();
        this.cerrarModal();
      }, (error) => {
        console.log(error);
        this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
          duration: 3000,
        });
      }
    )
  }

  //EDITAR CATEGORIA
  editarCategoria(id: number) {
    this.categoriasService.buscarCategoriaId(id).subscribe({
      next: (data: any) => {
        this.categoria = data;
        this.verModal();
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos de la categoria", "error");
      }
    });
  }

  //ELIMINAR CATEGORIAS
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

  //BUSCADOR
  buscarCategorias() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.categorias;
      this.paginaActual = 1; // Volver a la primera página
      this.actualizarPaginacion(); // Volver a paginar normal
    } else {
      this.categoriasFiltrados = this.categorias.filter(categoria =>
        categoria.nombre.toLowerCase().includes(filtro)
      );
    }
  }

  // Actualiza las categorias por página
  actualizarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.categoriasFiltrados = this.categorias.slice(inicio, fin);
  }

  // Obtener categorias de la página actual
  get categoriasPaginados() {
    return this.categoriasFiltrados;
  }

  get totalPaginas(): number {
    return Math.ceil(this.categorias.length / this.elementosPorPagina);
  }

  // Cambiar de página
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }
}
