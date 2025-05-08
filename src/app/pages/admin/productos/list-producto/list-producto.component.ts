import { Component } from '@angular/core';
import { ProductosService } from '../../../../service/productos.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriasService } from '../../../../service/categorias.service';
import { UnidadService } from '../../../../service/unidad.service';

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
  mostrarModal: boolean = false;
  mostarInput: boolean = false;
  aux: string = '';
  public producto = {
    id_producto: '',
    nombre: '',
    estado: 1,
    descripcion: '',
    stock: 0,
    precioVenta: '',
    categoriaproducto: {
      id_categoria: '',
      nombre: '',
      estado: 1
    },
    unidad: {
      idUnidad: '',
      nombre: '',
      abreviatura: '',
      equivalencia: '',
      estado: '1'
    }
  }
  categorias: any[] = [];
  categoriaFiltrado: any[] = [];
  busquedaCategoria: string = '';
  unidades: any[] = [];
  unidadFiltrado: any[] = [];
  busquedaUnidad: string = '';
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private productosService: ProductosService,
    private snack: MatSnackBar,
    private categoriasService: CategoriasService,
    private unidadesService: UnidadService
  ) { }

  ngOnInit(): void {
    this.listarProductos();
    this.cargarCategorias();
    this.cargarUnidades();
  }

  //ACCIONES DEL INPUT
  accionInput(event: any) {
    this.mostarInput = event.checked;
    const aux = this.producto.precioVenta;
    if (this.mostarInput === false) {
      this.producto.precioVenta = '';
    }
    if (this.mostarInput === true){
      this.producto.precioVenta = aux;
    }
  }

  //ACCIONES DEL MODAL
  verModal() {
    this.mostrarModal = true;
    this.cargarCategorias();
    console.log(this.aux)
    if(this.aux !== null){
      this.mostarInput = true;
    }
  }
  cerrarModal() {
    this.producto.nombre = '';
    this.producto.descripcion = '';
    this.producto.categoriaproducto.nombre = '';
    this.producto.unidad.nombre = '';
    this.mostrarModal = false;
    this.mostarInput = false;
    this.aux = '';
  }

  //MOSTRAR LOS PRODUCTOS
  listarProductos() {
    this.productosService.listarProductosActivos().subscribe(
      (data: any) => {
        this.productos = data;
        this.productosFiltrados = [...this.productos];
        this.actualizarPaginacion();
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de las categorias", 'error')
      }
    )
  }

  //REGISTRAR PRODUCTO
  formSubmit() {
    if (this.mostarInput) {
      this.producto.precioVenta = this.aux;
    } else {
      this.producto.precioVenta = '';
    }

    this.productosService.registrarProductos(this.producto).subscribe(
      (data) => {
        Swal.fire("Excelente", "El Producto fue registrado con éxito", "success");
        this.listarProductos();
        this.cerrarModal();
      }, (error) => {
        console.log(error);
        this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
          duration: 3000,
        });
      }
    )
  }

  //EDITAR PRODUCTO
  editarProducto(id: number) {
    this.productosService.buscarProductoId(id).subscribe({
      next: (data: any) => {
        this.producto = data;
        this.aux = this.producto.precioVenta;
        this.verModal();
        console.log(this.producto.precioVenta)
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos de la categoria", "error");
      }
    });
  }

  //ELIMINAR PRODUCTOS
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

  //BUSCADOR DE PRODUCTO
  buscarProductos() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.productos;
      this.paginaActual = 1; // Volver a la primera página
      this.actualizarPaginacion(); // Volver a paginar normal
    } else {
      this.productosFiltrados = this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(filtro) ||
        producto.descripcion.toLowerCase().includes(filtro) ||
        producto.categoriaproducto.nombre.toLowerCase().includes(filtro)
      );
    }
  }

  // Actualiza los productos por página
  actualizarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.productosFiltrados = this.productos.slice(inicio, fin);
  }

  // Obtener productos de la página actual
  get productosPaginados() {
    return this.productosFiltrados;
  }

  get totalPaginas(): number {
    return Math.ceil(this.productos.length / this.elementosPorPagina);
  }

  // Cambiar de página
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }

  //CARGAR CATEGORIAS
  cargarCategorias() {
    this.categoriasService.listarCategoriasActivos().subscribe((data) => {
      this.categorias = data;
      this.categoriaFiltrado = [...this.categorias];
    })
  }

  filtrarCategorias() {
    const filtro = this.producto.categoriaproducto.nombre.trim().toLowerCase();
    if (filtro === '') {
      this.categoriaFiltrado = [...this.categorias];
      this.cargarCategorias();
    } else {
      this.categoriaFiltrado = this.categorias.filter(categoria =>
        categoria.nombre.toLowerCase().includes(filtro)
      );
    }
  }

  seleccionarCategoria(nombreSeleccionado: string) {
    const seleccionada = this.categorias.find(c => c.nombre === nombreSeleccionado);
    if (seleccionada) {
      this.producto.categoriaproducto.id_categoria = seleccionada.id_categoria;
      this.producto.categoriaproducto.nombre = seleccionada.nombre;
    }
  }

  //CARGAR UNIDADES
  cargarUnidades() {
    this.unidadesService.listarUnidadActivos().subscribe((data) => {
      this.unidades = data;
      this.unidadFiltrado = [...this.unidades];
    })
  }

  filtrarUnidades() {
    const filtro = this.producto.unidad.nombre.trim().toLowerCase();
    if (filtro === '') {
      this.unidadFiltrado = [...this.unidades];
      console.log(this.unidadFiltrado)
      this.cargarUnidades();
    } else {
      console.log(this.unidadFiltrado)
      this.unidadFiltrado = this.unidades.filter(unidad =>
        unidad.nombre.toLowerCase().includes(filtro)
      );
    }
  }

  seleccionarUnidad(nombreSeleccionado: string) {
    const seleccionada = this.unidades.find(u => u.nombre === nombreSeleccionado);
    if (seleccionada) {
      this.producto.unidad = seleccionada;
    }
  }
}
