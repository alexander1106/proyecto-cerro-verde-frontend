import { Component } from '@angular/core';
import { ProveedoresService } from '../../../../service/proveedores.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-list-proveedor',
  standalone: false,
  templateUrl: './list-proveedor.component.html',
  styleUrl: './list-proveedor.component.css'
})

export class ListProveedorComponent {
  proveedores: any[] = []
  proveedoresFiltrados: any[] = [];
  proveedoresFiltros: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;
  public proveedor = {
    ruc_proveedor: '',
    razon_social: '',
    direccion: '',
    estado: '1'
  };
  proveedorData: any;
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private proveedoresService: ProveedoresService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.listarProveedor();
  }

  //ACCIONES DEL MODAL
  verModal() {
    this.mostrarModal = true;
  }
  cerrarModal() {
    this.proveedor.razon_social = '';
    this.proveedor.direccion = '';
    this.proveedor.ruc_proveedor = '';
    this.mostrarModal = false;
  }

  //MOSTRAR LOS PROVEEDORES
  listarProveedor() {
    this.proveedoresService.listarProveedoresActivo().subscribe(
      (data: any) => {
        this.proveedores = data;
        this.proveedoresFiltrados = [...this.proveedores];
        this.actualizarPaginacion();
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de los Proveedores", 'error')
      }
    )
  }

  //REGISTRAR PROVEEDOR
  formSubmit() {
    this.proveedoresService.registrarProveedor(this.proveedor).subscribe(
      (data) => {
        Swal.fire("Excelente", "El proveedor fue registrado con éxito", "success");
        this.listarProveedor();
        this.cerrarModal();
      }, (error) => {
        console.log(error);
        this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
          duration: 3000,
        });
      }
    )
  }

  //EDITAR PROVEEDOOR
  editarProveedor(id: string) {
    this.proveedoresService.buscarProveedorId(id).subscribe({
      next: (data: any) => {
        this.proveedor = data;
        this.verModal();
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos del proveedor", "error");
      }
    });
  }

  //ELIMINAR PROVEEDORES
  eliminarProveedor(id: string) {
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
        this.proveedoresService.eliminarProveedor(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: "Eliminado",
              text: response.mensaje,
              icon: "success"
            });
            this.listarProveedor();
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el proveedor",
              icon: "error"
            });
            console.log(error);
          }
        });
      }
    });
  }

  //BUSCADOR
  buscarProveedores() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    if (filtro === '') {
      this.proveedores;
      this.paginaActual = 1; // Volver a la primera página
      this.actualizarPaginacion(); // Volver a paginar normal
    } else {
      this.proveedoresFiltrados = this.proveedores.filter(proveedor =>
        proveedor.ruc_proveedor.toLowerCase().includes(filtro) ||
        proveedor.razon_social.toLowerCase().includes(filtro) ||
        proveedor.direccion.toLowerCase().includes(filtro)
      );
    }
  }

  //API Ruc
  buscarRuc(ruc: string) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })

    this.proveedoresService.buscarRuc(ruc, headers).subscribe({
      next: (data) => {
        const proveedorData = JSON.parse(data.datos);
        this.proveedor.razon_social = proveedorData.razonSocial;
        this.proveedor.direccion = proveedorData.direccion;
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos del RUC", "error");
      }
    })
  }

  // Actualiza los proveedores por página
  actualizarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.proveedoresFiltrados = this.proveedores.slice(inicio, fin);
  }

  // Obtener proveedores de la página actual
  get proveedoresPaginados() {
    return this.proveedoresFiltrados;
  }

  get totalPaginas(): number {
    return Math.ceil(this.proveedores.length / this.elementosPorPagina);
  }

  // Cambiar de página
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }

  // Validación de solo números en el RUC
  soloNumeros(event: KeyboardEvent) {
    const tecla = event.key;
    const esNumero = /[0-9]/.test(tecla);
    const esTeclaPermitida = [
      'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'
    ].includes(tecla);
    const esCombinacionCtrl = event.ctrlKey && ['c', 'v', 'x'].includes(tecla.toLowerCase());
    if (!esNumero && !esTeclaPermitida && !esCombinacionCtrl) {
      event.preventDefault();
    }
  }
}
