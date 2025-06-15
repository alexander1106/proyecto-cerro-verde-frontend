import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ComprasService } from '../../../../service/compras.service';
import { ProductosService } from '../../../../service/productos.service';
import { ProveedoresService } from '../../../../service/proveedores.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DetalleComprasService } from '../../../../service/detalle-compras.service';

@Component({
  selector: 'app-list-compra',
  standalone: false,
  templateUrl: './list-compra.component.html',
  styleUrl: './list-compra.component.css',
})
export class ListCompraComponent {
  //Compras
  compras: any[] = [];
  comprasFiltrados: any[] = [];
  filtroBusqueda: string = '';
  //Productos
  productos: any[] = [];
  productosFiltrados: any[] = [];
  productoBusqueda: string = '';
  columnasTabla: string[] = [
    'nombre',
    'unidad',
    'cantidad',
    'precio',
    'subtotal',
    'acciones',
  ];
  dataSource = new MatTableDataSource<any>();
  //Proveedores
  proveedores: any[] = [];
  proveedorFiltrado: any[] = [];
  proveedorBusqueda: string = '';
  //Modal
  mostrarModal: boolean = false;
  modalRegistro: boolean = false;
  compraSeleccionada: any = null;
  public compra = {
    id_compra: '',
    correlativo: '',
    numeroDoc: 'C001',
    fecha_compra: '',
    total: '',
    flete: '',
    descuento: '',
    igv: '',
    estado: 1,
    proveedor: {
      ruc_proveedor: '',
      razon_social: '',
      direccion: '',
      estado: 1,
    },
    detallecompra: [] as Array<{
      id_detalle_compra: any;
      cantidad: any;
      precio: any;
      subtotal: any;
      estado: 1;
      producto?: {
        id_producto: any;
        nombre: any;
        descripcion: any;
        estado: 1;
        categoriaproducto: {
          id_categoria: '';
          nombre: '';
          estado: 1;
        };
        unidad: {
          idUnidad: '';
          nombre: '';
          abreviatura: '';
          equivalencia: '';
          estado: 1;
        };
      };
    }>,
  };
  customers: any;
  paginaActual = 1;
  elementosPorPagina = 5;
  paginaActualCompra = 1;
  elementosPorPaginaCompra = 5;

  constructor(
    private comprasService: ComprasService,
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService,
    private snack: MatSnackBar,
    private detalleComprasService: DetalleComprasService
  ) {}

  ngOnInit(): void {
    this.listarCompras();
    this.cargarProveedores();
    this.cargarProductos();
    this.dataSource.data = this.compra.detallecompra;
  }

  //MODAL DE DETALLE COMPRA
  verModal(id: number) {
    this.comprasService.buscarCompraId(id).subscribe({
      next: (compra) => {
        this.compraSeleccionada = compra;
        this.paginaActual = 1;
        this.mostrarModal = true;
      },
      error: (error) => {
        console.log(error);
        Swal.fire(
          'Error',
          'No se pudo obtener el detalle de la compra',
          'error'
        );
      },
    });
  }
  cerrarModal() {
    this.mostrarModal = false;
  }

  //MODAL DE REGISTRO O EDICION
  abrirModalRegistro() {
    this.modalRegistro = true;
    this.cargarDatosCompra();
  }
  cerrarMordalRegistro() {
    this.compra.id_compra = '';
    this.compra.correlativo = '';
    this.compra.numeroDoc = 'C001';
    this.compra.fecha_compra = '';
    this.compra.proveedor.razon_social = '';
    this.compra.proveedor.ruc_proveedor = '';
    this.compra.descuento = '';
    this.compra.flete = '';
    this.compra.igv = '';
    this.compra.total = '0';
    this.dataSource.data = [];
    this.compra.detallecompra = [];
    this.modalRegistro = false;
    this.cargarProveedores();
  }

  cargarDatosCompra() {
    this.comprasService.obtenerDatosNuevaCompra().subscribe({
      next: (data) => {
        this.compra.correlativo = data.correlativo;
      },
      error: (err) => {
        console.error('Error al obtener datos de nueva compra', err);
      },
    });
  }

  //LISTAR COMPRAS
  listarCompras() {
    this.comprasService.listarCompra().subscribe(
      (data: any) => {
        this.compras = data;
        this.comprasFiltrados = [...this.compras];
        this.actualizarPaginacion();
      },
      (error) => {
        console.log(error);
        Swal.fire('error !!', 'Al cargar el listado de las compras', 'error');
      }
    );
  }

  //REGISTRAR COMPRA
  formSubmit() {
    const sumaSubTotales = Number(
      this.compra.detallecompra.reduce((acc, item) => acc + item.subtotal, 0)
    );
    const flete = Number(this.compra.flete) || 0;
    const descuento = Number(this.compra.descuento) || 0;

    if (descuento > sumaSubTotales + flete) {
      this.snack.open(
        'Error: El descuento no puede ser mayor al total',
        'Aceptar',
        {
          duration: 3000,
        }
      );
      return;
    }
    const fecha = new Date(this.compra.fecha_compra);
    const fechaFormateada = fecha.toISOString().split('T')[0]; // "2025-05-15"
    this.compra.fecha_compra = fechaFormateada;
    this.comprasService.registrarCompra(this.compra).subscribe(
      (data) => {
        Swal.fire('Excelente', 'La compra fue registrado con éxito', 'success');
        this.listarCompras();
        this.cerrarMordalRegistro();
        console.log(this.compra);
      },
      (error) => {
        console.log(error);
        this.snack.open('Rellene el formulario', 'Aceptar', {
          duration: 3000,
        });
      }
    );
  }

  //EDITAR COMPRA
  editarCompra(id: number) {
    this.comprasService.buscarCompraId(id).subscribe({
      next: (data: any) => {
        this.compra = data;
        this.dataSource.data = this.compra.detallecompra;
        this.abrirModalRegistro();
      },
      error: (error) => {
        console.log(error);
        Swal.fire(
          'Error',
          'No se pudo obtener los datos de la categoria',
          'error'
        );
      },
    });
  }

  eliminarDetalle(id: number) {
    this.detalleComprasService.eliminarCategoria(id).subscribe({
      next: (data: any) => {
        console.log('eliminado');
      },
    });
  }

  //ELIMINAR COMPRAS
  eliminarCompra(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás recuperar el registro',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.comprasService.eliminarCompra(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: 'Eliminado',
              text: response.mensaje,
              icon: 'success',
            });
            this.listarCompras();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar la compra',
              icon: 'error',
            });
            console.log(error);
          },
        });
      }
    });
  }

  //BUSQUEDA DE COMPRAS
  buscarCompras() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.comprasFiltrados = this.compras.filter(
      (c) =>
        c.numeroDoc.toLowerCase().includes(filtro) ||
        c.proveedor.razon_social.toLowerCase().includes(filtro)
    );
  }

  // Actualiza las compras por página
  actualizarPaginacion() {
    const inicio =
      (this.paginaActualCompra - 1) * this.elementosPorPaginaCompra;
    const fin = inicio + this.elementosPorPaginaCompra;
    this.comprasFiltrados = this.compras.slice(inicio, fin);
    console.log(this.comprasFiltrados);
  }
  // Obtener productos de la página actual
  get comprasPaginados() {
    return this.comprasFiltrados;
  }
  get totalPagina(): number {
    return Math.ceil(this.compras.length / this.elementosPorPaginaCompra);
  }

  // Cambiar de página
  cambiarPaginaCompra(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPagina) {
      this.paginaActualCompra = pagina;
      this.actualizarPaginacion();
    }
  }

  //PAGINACION DE COMPRA
  productosPaginados() {
    if (!this.compraSeleccionada || !this.compraSeleccionada.detallecompra) {
      return [];
    }
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.compraSeleccionada.detallecompra.slice(inicio, fin);
  }
  get totalPaginas(): number {
    if (!this.compraSeleccionada || !this.compraSeleccionada.detallecompra) {
      return 0;
    }
    return Math.ceil(
      this.compraSeleccionada.detallecompra.length / this.elementosPorPagina
    );
  }
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  //CARGAR PROVEEDORES
  cargarProveedores() {
    this.proveedoresService.listarProveedores().subscribe((data) => {
      this.proveedores = data;
      this.proveedorFiltrado = [...this.proveedores];
    });
  }
  filtrarProveedores() {
    const filtro = String(this.compra.proveedor).trim().toLowerCase();
    if (filtro === '') {
      this.proveedorFiltrado = [...this.proveedores];
      this.cargarProveedores();
    } else {
      this.proveedorFiltrado = this.proveedores.filter(
        (proveedor) =>
          proveedor.ruc_proveedor.toLowerCase().includes(filtro) ||
          proveedor.razon_social.toLowerCase().includes(filtro)
      );
    }
  }
  seleccionarProveedor(proveedorSeleccionado: string) {
    const seleccionada = this.proveedores.find(
      (p) => p.ruc_proveedor === proveedorSeleccionado
    );
    if (seleccionada) {
      this.compra.proveedor.ruc_proveedor = seleccionada.ruc_proveedor;
      this.compra.proveedor.razon_social = seleccionada.razon_social;
      this.compra.proveedor.direccion = seleccionada.direccion;
    }
    console.log(seleccionada);
  }
  mostrarProveedor = (proveedor: any): string => {
    if (!proveedor || !proveedor.ruc_proveedor || !proveedor.razon_social) {
      return '';
    }
    return `${proveedor.ruc_proveedor} | ${proveedor.razon_social}`;
  };

  //CARGAR PRODUCTOS
  cargarProductos() {
    this.productosService.listarProductos().subscribe((data) => {
      this.productos = data;
      this.productosFiltrados = [...this.productos];
    });
  }
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
  agregarProducto(producto: any) {
    const yaExiste = this.compra.detallecompra.find(
      (d) => d.producto && d.producto.id_producto == producto.id_producto
    );
    if (!yaExiste) {
      this.compra.detallecompra.push({
        id_detalle_compra: null,
        cantidad: 1,
        precio: 0,
        subtotal: 0,
        estado: 1,
        producto: producto,
      });
      this.dataSource.data = this.compra.detallecompra;
    }
    this.cargarProductos();
    this.productoBusqueda = '';
    this.productosFiltrados = [];
    this.actualizarTotales();
  }
  actualizarSubtotal(item: any) {
    item.subtotal = item.cantidad * item.precio || 0;
    this.actualizarTotales();
  }
  eliminarProducto(index: number) {
    this.compra.detallecompra.splice(index, 1);
    this.dataSource.data = this.compra.detallecompra;
    this.actualizarTotales();
  }
  actualizarTotales() {
    let sumaSubTotales = Number(
      this.compra.detallecompra.reduce((acc, item) => acc + item.subtotal, 0)
    );
    let flete = this.compra.flete || 0;
    let descuento = this.compra.descuento || 0;
    let igv = this.compra.igv || 0;
    if (Number(descuento) > sumaSubTotales + Number(flete)) {
      this.snack.open(
        'Error: El descuento no puede ser mayor al total',
        'Aceptar',
        {
          duration: 3000,
        }
      );
      return;
    }
    if (Number(igv) > 0) {
      let conIgv =
        Number(sumaSubTotales + Number(flete) - Number(descuento)) *
        (Number(igv) / 100);
      this.compra.total = String(
        sumaSubTotales + Number(flete) - Number(descuento) + conIgv
      );
    } else {
      this.compra.total = String(
        sumaSubTotales + Number(flete) - Number(descuento)
      );
    }
  }
  mostrarNombreProducto(producto: any): string {
    return producto ? producto.nombre : '';
  }
}
