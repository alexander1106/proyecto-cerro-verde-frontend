import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { MovimientoInventarioService } from '../../../service/movimiento-inventario.service';
import { ProductosService } from '../../../service/productos.service';

@Component({
  selector: 'app-movimiento-inventario',
  standalone: false,
  templateUrl: './movimiento-inventario.component.html',
  styleUrl: './movimiento-inventario.component.css',
})
export class MovimientoInventarioComponent {
  movimientos: any[] = [];
  movimientosFiltrados: any[] = [];
  filtroBusqueda: string = '';
  paginaActual = 1;
  elementosPorPagina = 5;
  productos: any[] = [];
  productosFiltrados: any[] = [];
  productoBusqueda: any;
  fechaInicio: Date | null = null;
  fechaFinal: Date | null = null;

  constructor(
    private movimientoService: MovimientoInventarioService,
    private snack: MatSnackBar,
    private productosService: ProductosService
  ) {}

  ngOnInit(): void {
    this.listarMovimientos();
    this.cargarProductos();
  }

  //BUSCAR
  buscar() {
    this.movimientosFiltrados = this.movimientos
      .filter((m) => {
        const nombreCoincide = this.productoBusqueda
          ? m.producto.nombre
              .toLowerCase()
              .includes(this.productoBusqueda.nombre?.toLowerCase())
          : true;

        const fechaMovimiento = new Date(m.fecha);
        fechaMovimiento.setHours(0, 0, 0, 0);

        const desde = this.fechaInicio ? new Date(this.fechaInicio) : null;
        desde?.setHours(0, 0, 0, 0);
        desde?.setDate(desde.getDate() - 1); // restar 1 día

        const hasta = this.fechaFinal ? new Date(this.fechaFinal) : null;
        hasta?.setHours(0, 0, 0, 0);
        hasta?.setDate(hasta.getDate() - 1);

        const fechaCoincide =
          (!desde || fechaMovimiento >= desde) &&
          (!hasta || fechaMovimiento <= hasta);

        return nombreCoincide && fechaCoincide;
      })
      .sort((a, b) => {
        // Ordenar por fecha descendente (más reciente primero)
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      });
  }
  //LIMPIAR
  limpiar() {
    this.productoBusqueda = '';
    this.fechaInicio = null;
    this.fechaFinal = null;
  }

  //MOSTRAR LOS METODOS DE PAGO
  listarMovimientos() {
    this.movimientoService.listarMovimientosInventario().subscribe(
      (data: any) => {
        this.movimientos = data;
      },
      (error) => {
        console.log(error);
        Swal.fire(
          'Error',
          'No se pudo cargar los movimientos de inventario',
          'error'
        );
      }
    );
  }

  // Actualiza los metodos de pago por página
  actualizarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.movimientosFiltrados = this.movimientos.slice(inicio, fin);
  }

  // Obtener metodos de pago de la página actual
  get categoriasPaginados() {
    return this.movimientosFiltrados;
  }

  get totalPaginas(): number {
    return Math.ceil(this.movimientos.length / this.elementosPorPagina);
  }

  // Cambiar de página
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }

  //CARGAR PRODUCTOS
  cargarProductos() {
    this.productosService.listarProductosActivos().subscribe((data) => {
      this.productos = data.filter((p) => p.precioVenta != null);
      this.productosFiltrados = [...this.productos];
    });
  }
  //FILTRAR PRODUCTOS
  filtrarProductos() {
    const filtro = this.productoBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.productosFiltrados = [...this.productos];
      this.cargarProductos();
    } else {
      this.productosFiltrados = this.productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(filtro)
      );
    }
  }
  //MOSTRAR NOMBRE DE PRODUCTOS
  mostrarNombreProducto(producto: any): string {
    return producto ? producto.nombre : '';
  }
}
