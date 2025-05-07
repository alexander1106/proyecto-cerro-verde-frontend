import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ComprasService } from '../../../../service/compras.service';
import { Router } from '@angular/router';
import { ProductosService } from '../../../../service/productos.service';
import { ProveedoresService } from '../../../../service/proveedores.service';

@Component({
  selector: 'app-list-compra',
  standalone: false,
  templateUrl: './list-compra.component.html',
  styleUrl: './list-compra.component.css'
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
  //Proveedores
  proveedores: any[] = [];
  proveedorFiltrado: any[] = [];
  proveedorBusqueda: string = '';
  //Modal
  mostrarModal: boolean = false;
  modalRegistro: boolean = false;
  compraSeleccionada: any = null;
  paginaActual = 1;
  elementosPorPagina = 5;
  public compra = {
    id_compra: '',
    numeroDoc: '',
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
      estado: 1
    },
    detallecompra: [] as Array<{
      id_detalle_compra: any,
      cantidad: any,
      precio: any,
      subtotal: any,
      estado: 1,
      producto?: {
        id_producto: any,
        nombre: any,
        descripcion: any,
        estado: 1,
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
          estado: 1
        }
      }
    }>
  }
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  customers: any;

  constructor(
    private comprasService: ComprasService, 
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService
  ) { }

  ngOnInit(): void {
    this.listarCompras();
  }

  //MODAL DE DETALLE COMPRA
  verModal(id: number) {
    console.log("Si")
    this.comprasService.buscarCompraId(id).subscribe({
      next: (compra) => {
        this.compraSeleccionada = compra;
        this.paginaActual = 1;
        this.mostrarModal = true;
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener el detalle de la compra", "error");
      }
    });
  }
  cerrarModal() {
    this.mostrarModal = false;
  }

  //MODAL DE REGISTRO O EDICION
  abrirModalRegistro() {
    this.modalRegistro = true;
  }
  cerrarMordalRegistro() {
    this.modalRegistro = false;
  }

  //LISTAR COMPRAS
  listarCompras() {
    this.comprasService.listarCompra().subscribe(
      (data: any) => {
        this.compras = data;
        console.log("Compras:" + this.compras);
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de las compras", 'error')
      }
    )
  }

  formSubmit(){

  }

  //REGISTRAR COMPRA
  registrarCompra(){
    this.comprasService.registrarCompra(this.compra).subscribe(

    )
  }

  eliminarCompra(id: number) {
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
        this.comprasService.eliminarCompra(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: "Eliminado",
              text: response.mensaje,
              icon: "success"
            });
            this.listarCompras();
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la compra",
              icon: "error"
            });
            console.log(error);
          }
        });
      }
    });
  }

  buscarCompras() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.comprasFiltrados = this.compras.filter(c =>
      c.correlativo.toLowerCase().includes(filtro)
    );
  }

  filtrarPorFechar() {
    if (!this.fechaDesde || !this.fechaHasta) return;
    const desde = new Date(this.fechaDesde);
    const hasta = new Date(this.fechaHasta);

    this.comprasFiltrados = this.compras.filter(f => {
      const fechaItem = new Date(f.fecha_compra);
      return fechaItem >= desde && fechaItem <= hasta;
    })
  }

  

  
  
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

    return Math.ceil(this.compraSeleccionada.detallecompra.length / this.elementosPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }


  //CARGAR PROVEEDORES
  cargarProveedores() {
    this.proveedoresService.listarProveedoresActivo().subscribe((data) => {
      this.proveedores = data;
      this.proveedorFiltrado = [...this.proveedores];
    })
  }

  filtrarProveedores() {
    const filtro = this.proveedorBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.proveedorFiltrado = [...this.proveedores];
      this.cargarProveedores();
    } else {
      this.proveedorFiltrado = this.proveedores.filter(proveedor =>
        proveedor.ruc_proveedor.toLowerCase().includes(filtro) ||
        proveedor.razon_social.toLowerCase().includes(filtro)
      );
      console.log(this.proveedorFiltrado)
    }
  }

  seleccionarProveedor(proveedorSeleccionado: string) {
    const seleccionada = this.proveedores.find(p => p.razon_social === proveedorSeleccionado);
    if (seleccionada) {
      this.compra.proveedor.ruc_proveedor = seleccionada.ruc_proveedor;
      this.compra.proveedor.razon_social = seleccionada.razon_social;
      this.compra.proveedor.direccion = seleccionada.direccion;
    }
  }
}
