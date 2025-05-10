import { Component } from '@angular/core';
import { UnidadService } from '../../../../service/unidad.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-unidad',
  standalone: false,
  templateUrl: './list-unidad.component.html',
  styleUrl: './list-unidad.component.css'
})
export class ListUnidadComponent {
  unidades: any[] = []
  unidadesFiltrados: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;
  public unidad = {
    idUnidad: '',
    nombre: '',
    abreviatura: '',
    equivalencia:'',
    estado: '1'
  };
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private unidadesService: UnidadService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.listarUnidades();
  }

  //ACCIONES DEL MODAL
  verModal() {
    this.mostrarModal = true;
  }
  cerrarModal() {
    this.unidad.idUnidad = '';
    this.unidad.nombre = '';
    this.unidad.abreviatura = '';
    this.unidad.equivalencia = '';
    this.mostrarModal = false;
  }

  //MOSTRAR LAS UNIDADES
  listarUnidades() {
    this.unidadesService.listarUnidadActivos().subscribe(
      (data: any) => {
        this.unidades = data;
        this.unidadesFiltrados = [...this.unidades];
        this.actualizarPaginacion();
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de las categorias", 'error')
      }
    )
  }

  //REGISTRAR UNIDAD
  formSubmit() {
    this.unidadesService.registrarUnidad(this.unidad).subscribe(
      (data) => {
        Swal.fire("Excelente", "La Unidad de Medida fue registrado con éxito", "success");
        this.listarUnidades();
        this.cerrarModal();
      }, (error) => {
        console.log(error);
        this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
          duration: 3000,
        });
      }
    )
  }

  //EDITAR UNIDAD
  editarUnidad(id: number) {
    this.unidadesService.buscarUnidadId(id).subscribe({
      next: (data: any) => {
        this.unidad = data;
        this.verModal();
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos de la Unidad de Medida", "error");
      }
    });
  }

  //ELIMINAR UNIDADES
  eliminarUnidad(id: number) {
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
        this.unidadesService.eliminarUnidad(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: "Eliminado",
              text: response.mensaje,
              icon: "success"
            });
            this.listarUnidades();
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la Unidad de Medida",
              icon: "error"
            });
            console.log(error);
          }
        });
      }
    });
  }

  //BUSCADOR
  buscarUnidad() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.unidades;
      this.paginaActual = 1; // Volver a la primera página
      this.actualizarPaginacion(); // Volver a paginar normal
    } else {
      this.unidadesFiltrados = this.unidades.filter(unidad =>
        unidad.nombre.toLowerCase().includes(filtro) ||
        unidad.equivalencia.toLowerCase().includes(filtro)
      );
    }
  }

  // Actualiza las categorias por página
  actualizarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.unidadesFiltrados = this.unidades.slice(inicio, fin);
  }

  // Obtener categorias de la página actual
  get unidadesPaginados() {
    return this.unidadesFiltrados;
  }

  get totalPaginas(): number {
    return Math.ceil(this.unidades.length / this.elementosPorPagina);
  }

  // Cambiar de página
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }
}
