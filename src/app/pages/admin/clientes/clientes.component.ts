import { Component } from '@angular/core';
import { Cliente, ClientesService } from '../../../service/clientes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { HttpHeaders } from '@angular/common/http';
import { ProveedoresService } from '../../../service/proveedores.service';

@Component({
  selector: 'app-clientes',
  standalone: false,
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent {
  clientes: any[] = []
  clientesFiltrados: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;
  public cliente = {
    idCliente: null,
    dniRuc: '',
    nombre: '',
    telefono: '',
    correo: '',
    pais: '',
    estado: 1
  };
  paginaActual = 1;
  elementosPorPagina = 5;
  tipo: string = "DNI";
  longitud: number = 8;
  patronNumerico = '^[0-9]*$';
  patronCorreo: string = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  esEditar: boolean = false;

  constructor(
    private clientesService: ClientesService,
    private snack: MatSnackBar,
    private proveedoresService: ProveedoresService
  ) { }

  ngOnInit(): void {
    this.listarClientes();
  }

  dniORuc(auxiliar: string){
    if(auxiliar === "DNI"){
      this.tipo = "DNI";
      this.longitud = 8;
    } else {
      this.tipo = "RUC";
      this.longitud = 11;
    }
  }

  buscar(tipo: string, id: string){
    if(tipo === "DNI"){
      this.buscarDni(id);
    } else if (tipo === "RUC") {
      this.buscarRuc(id);
    }
  }

  //ACCIONES DEL MODAL
  verModal() {
    this.mostrarModal = true;
  }
  cerrarModal() {
    this.cliente.idCliente = null;
    this.cliente.correo = '';
    this.cliente.dniRuc = '';
    this.cliente.nombre = '';
    this.cliente.pais = '';
    this.cliente.telefono = '';
    this.mostrarModal = false;
    this.esEditar = false;
    this.tipo = 'DNI';
  }

  //MOSTRAR LOS CLIENTES
  listarClientes() {
    this.clientesService.getClientes().subscribe(
      (data: any) => {
        this.clientes = data;
        this.clientesFiltrados = [...this.clientes];
        this.actualizarPaginacion();
      }, (error) => {
        console.log(error);
        Swal.fire("error !!", "Al cargar el listado de los clientes", 'error')
      }
    )
  }

  //REGISTRAR CLIENTE
  formSubmit() {
    let aux = 'registrado'
    if(this.esEditar){
      aux = 'editado'
    }
    this.clientesService.createCliente(this.cliente).subscribe(
      (data) => {
        Swal.fire("Excelente", `El cliente fue ${aux} con éxito`, "success");
        this.listarClientes();
        this.cerrarModal();
      }, (error) => {
        console.log(error);
        this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
          duration: 3000,
        });
      }
    )
  }

  //EDITAR CLIENTE
  editarCliente(id: number) {
    this.clientesService.getClienteById(id).subscribe({
      next: (data: any) => {
        this.esEditar = true;
        this.cliente = data;
        const auxiliar = this.cliente.dniRuc
        if(auxiliar.length == 11){
          this.tipo = 'RUC'
        }
        this.verModal();
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos del cliente", "error");
      }
    });
  }

  //ELIMINAR CLIENTE
  eliminarCliente(id: number) {
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
        this.clientesService.deleteCliente(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: "Eliminado",
              text: response.mensaje,
              icon: "success"
            });
            this.listarClientes();
          },
          error: (error) => {
            Swal.fire({
              title: "Aviso",
              text: error.error.mensaje,
              icon: "warning"
            });
          }
        });
      }
    });
  }

  //BUSCAR DNI
  buscarDni(dni: string) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })

    this.clientesService.buscarDni(dni, headers).subscribe({
      next: (data) => {
        const clienteData = JSON.parse(data.datos);
        this.cliente.nombre = clienteData.apellidoPaterno + " " + clienteData.apellidoMaterno + " " + clienteData.nombres ;
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos del DNI", "error");
      }
    })
  }

  //BUSCAR ruc
  buscarRuc(ruc: string) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })

    this.proveedoresService.buscarRuc(ruc, headers).subscribe({
      next: (data) => {
        const proveedorData = JSON.parse(data.datos);
        this.cliente.nombre = proveedorData.razonSocial;
      },
      error: (error) => {
        console.log(error);
        Swal.fire("Error", "No se pudo obtener los datos del RUC", "error");
      }
    })
  }

//BUSCADOR
buscarCliente() {
  const filtro = this.filtroBusqueda.trim().toLowerCase();
  if (filtro === '') {
    this.clientes;
    this.paginaActual = 1; // Volver a la primera página
    this.actualizarPaginacion(); // Volver a paginar normal
  } else {
    this.clientesFiltrados = this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(filtro) ||
      c.dniRuc.toLowerCase().includes(filtro) ||
      c.telefono.toLowerCase().includes(filtro) ||
      c.correo.toLowerCase().includes(filtro) ||
      c.pais.toLowerCase().includes(filtro)
    );
  }
}

// Actualiza las categorias por página
actualizarPaginacion() {
  const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
  const fin = inicio + this.elementosPorPagina;
  this.clientesFiltrados = this.clientes.slice(inicio, fin);
}

  // Obtener categorias de la página actual
  get categoriasPaginados() {
  return this.clientesFiltrados;
}

  get totalPaginas(): number {
  return Math.ceil(this.clientes.length / this.elementosPorPagina);
}

// Cambiar de página
cambiarPagina(pagina: number) {
  if (pagina >= 1 && pagina <= this.totalPaginas) {
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }
}
}
