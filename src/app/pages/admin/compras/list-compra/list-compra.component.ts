import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ComprasService } from '../../../../service/compras.service';
import { Router } from '@angular/router';
import { ProductosService } from '../../../../service/productos.service';

@Component({
  selector: 'app-list-compra',
  standalone: false,
  templateUrl: './list-compra.component.html',
  styleUrl: './list-compra.component.css'
})
export class ListCompraComponent {
  compras: any[] = [];
  comprasFiltrados: any[] = [];
  filtroBusqueda: string = '';
  productos: any[] = [];
  productosFiltrados: any[] = [];
  mostrarModal: boolean = false;
  compraSeleccionada: any = null;
  paginaActual = 1;
  elementosPorPagina = 5;

  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  customers: any;

  constructor(private comprasService: ComprasService, private router: Router, private productosService: ProductosService) { }

  ngOnInit(): void {
    this.listarCompras();
  }

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

  editarCompra(id: number) {
    this.router.navigate(['/admin/edit-compra', id])
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

}
