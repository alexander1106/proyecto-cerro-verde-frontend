import { Component } from '@angular/core';
import { MetodoPagoService } from '../../../service/metodo-pago.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-metodo-pago',
  standalone: false,
  templateUrl: './metodo-pago.component.html',
  styleUrl: './metodo-pago.component.css'
})
export class MetodoPagoComponent {
  metodos: any[] = []
  metodosFiltrados: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;
  public metodo = {
    idMetodoPago: '',
    nombre: '',
    estado: 1
  };
  paginaActual = 1;
  elementosPorPagina = 5;
  habilitado: boolean = true;
  esEditar: boolean = false;

  constructor(
    private metodosService: MetodoPagoService,
    private snack: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.listarMetodos();
  }

  //ACCIONES DEL MODAL
  verModal() {
    this.mostrarModal = true;
  }
  cerrarModal() {
    this.metodo.idMetodoPago = '';
    this.metodo.nombre = '';
    this.mostrarModal = false;
    this.esEditar = false;
  }

  //MOSTRAR LOS METODOS DE PAGO
  listarMetodos() {
    this.metodosService.listarMetodosPago().subscribe(
      (data: any) => {
        this.metodos = data;
        this.metodosFiltrados = [...this.metodos];
        this.actualizarPaginacion();
      }, (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo cargar los métodos de pago", 'error')
      }
    )
  }

  //REGISTRAR METODO DE PAGO
  formSubmit() {
    let auxiliar = this.esEditar ? "editado" : "registrado";
    this.metodosService.registrarMetodoPago(this.metodo).subscribe(
      (data) => {
        Swal.fire("Excelente", `El Método de Pago fue ${auxiliar} con éxito`, "success");
        this.listarMetodos();
        this.cerrarModal();
      }, (error) => {
        this.snack.open('Ha ocurrido un error en el sistema!', 'Aceptar', {
          duration: 3000,
        });
      }
    )
  }

  //EDITAR METODO DE PAGO
  editarMetodoPago(id: number) {
    this.esEditar = true;
    this.metodosService.buscarMetodoPagoId(id).subscribe({
      next: (data: any) => {
        this.metodo = data;
        this.verModal();
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos del método de pago", "error");
      }
    });
  }

  //ELIMINAR METODO DE PAGO
  eliminarMetodoPago(id: number) {
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
        this.metodosService.eliminarMetodoPago(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: "Eliminado",
              text: response.mensaje,
              icon: "success"
            });
            this.listarMetodos();
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: error.error.mensaje,
              icon: "error"
            });
          }
        });
      }
    });
  }

  //BUSCADOR
  buscarMetodoPago() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.metodos;
      this.paginaActual = 1; // Volver a la primera página
      this.actualizarPaginacion(); // Volver a paginar normal
    } else {
      this.metodosFiltrados = this.metodos.filter(m =>
        m.nombre.toLowerCase().includes(filtro)
      );
    }
  }

  // Actualiza los metodos de pago por página
  actualizarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.metodosFiltrados = this.metodos.slice(inicio, fin);
  }

  // Obtener metodos de pago de la página actual
  get categoriasPaginados() {
    return this.metodosFiltrados;
  }

  get totalPaginas(): number {
    return Math.ceil(this.metodos.length / this.elementosPorPagina);
  }

  // Cambiar de página
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }
}
