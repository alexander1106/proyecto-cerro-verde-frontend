import { Component } from '@angular/core';
import { VentasService } from '../../../service/ventas.service';
import { ProductosService } from '../../../service/productos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { ClientesService } from '../../../service/clientes.service';
import { CajaService } from '../../../service/caja.service';
import { Route, Router } from '@angular/router';
import { ReservasService } from '../../../service/reserva.service';
import { HttpHeaders } from '@angular/common/http';
import { ProveedoresService } from '../../../service/proveedores.service';
import { HabitacionesService } from '../../../service/habitaciones.service';
import { SalonesService } from '../../../service/salones.service';
import { MetodoPagoService } from '../../../service/metodo-pago.service';
import { ComprobantePagoService } from '../../../service/comprobante-pago.service';

@Component({
  selector: 'app-ventas',
  standalone: false,
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css',
})
export class VentasComponent {
  //Comprobantes
  comprobantes: any[] = [];
  //Ventas
  ventas: any[] = [];
  ventasFiltrados: any[] = [];
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
  //clientes
  clientes: any[] = [];
  clientesFiltrado: any[] = [];
  clienteBusqueda: string = '';
  //reservas
  reservas: any[] = [];
  reservasFiltrado: any[] = [];
  reservaBusqueda: string = '';
  reservaSeleccionada: any = null;
  tablaReserva: string[] = [
    'cliente',
    'tipo',
    'fechaInicio',
    'fechaFin',
    'acciones',
  ];
  dataReserva = new MatTableDataSource<any>();
  //metodos de pago
  metodos: any[] = [];
  metodosFiltrado: any[] = [];
  metodoBusqueda: string = '';
  metodoSeleccionada: any = null;
  tablaMetodo: string[] = ['nombre', 'pago', 'acciones'];
  dataMetodo = new MatTableDataSource<any>();
  //habitaciones
  habitaciones: any[] = [];
  habitacionesFiltrado: any[] = [];
  habitacionBusqueda: string = '';
  tablaHabitacion: string[] = [
    'numero',
    'tipo',
    'piso',
    'dias',
    'precio',
    'subtotal',
  ];
  dataHabitacion = new MatTableDataSource<any>();
  //salones
  salones: any[] = [];
  salonesFiltrado: any[] = [];
  salonBusqueda: string = '';
  tablaSalon: string[] = [
    'nombre',
    'tarifa',
    'dias/horas',
    'precio',
    'subtotal',
  ];
  dataSalon = new MatTableDataSource<any>();
  //Modal
  mostrarModal: boolean = false;
  modalRegistro: boolean = false;
  ventaSeleccionada: any = null;
  //Caja Abierta
  cajaAbierta: boolean = false;
  //Registrar cliente
  esNuevo: boolean = false;
  //Objeto Cliente
  public cliente = {
    idCliente: '',
    dniRuc: '',
    nombre: '',
    telefono: '',
    correo: '',
    pais: '',
    estado: 1,
  };
  //Objeto Venta
  public venta = {
    idVenta: '',
    fecha: '',
    total: '',
    descuento: 0,
    cargo: 0,
    igv: 0,
    estado: 1,
    cliente: {
      idCliente: '',
      dniRuc: '',
      nombre: '',
      telefono: '',
      correo: '',
      pais: '',
      estado: 1,
    },
    ventaXReserva: [] as Array<{
      idVentaReserva: any;
      reserva: {
        id_reserva: any;
        fecha_incio: any;
        fecha_fin: any;
        estado_reserva: any;
        comentarios: any;
        estado: 1;
        tipo: any;
        cliente: {
          idCliente: '';
          dniRuc: '';
          nombre: '';
          telefono: '';
          correo: '';
          pais: '';
          estado: 1;
        };
      };
    }>,
    detalleVenta: [] as Array<{
      idDetalleVenta: any;
      cantidad: any;
      precioUnit: any;
      subtotal: any;
      estado: 1;
      producto?: {
        id_producto: any;
        nombre: any;
        descripcion: any;
        estado: 1;
        stock: any;
        categoriaproducto: {
          id_categoria: '';
          nombre: '';
          estado: 1;
        };
      };
    }>,
    ventaHabitacion: [] as Array<{
      idVentaHabitacion: any;
      dias: any;
      subTotal: any;
      habitacion: {
        id_habitacion: any;
        numero: any;
        piso: any;
        estado_habitacion: any;
        estado: 1;
        tipo_habitacion: {
          id_tipo_habitacion: any;
          nombre: any;
          precio_publico: any;
          precio_corporativo: any;
          estado: 1;
        };
      };
    }>,
    ventaSalon: [] as Array<{
      idVentaSalon: any;
      horas: any;
      dias: any;
      subTotal: any;
      salon: {
        id_salon: any;
        precio_diario: any;
        precio_hora: any;
        nombre: any;
        estado_salon: any;
        estado: 1;
      };
    }>,
    ventaMetodoPago: [] as Array<{
      idVentaMetodoPago: any;
      pago: any;
      metodoPago: {
        idMetodoPago: any;
        nombre: any;
        estado: 1;
      };
    }>,
    comprobantePago: {
      idVenta: '',
      numSerieBoleta: '',
      numSerieFactura: '',
      pdfUrl: '',
      numComprobante: '',
      fechaEmision: '',
    },
  };
  customers: any;
  paginaActual = 1;
  elementosPorPagina = 5;
  paginaActualCompra = 1;
  elementosPorPaginaCompra = 5;
  tipo: string = 'Boleta';
  titulo: string = 'Directa';
  tipoCliente: string = 'DNI';
  longitud: number = 8;
  patronNumerico = '^[0-9]*$';
  fechaActual = new Date();
  subTotalHabitaciones: number = 0;
  vuelto: number = 0;
  fechaInicio = '';
  fechaFin = '';
  tipoIgv: number = 0;

  constructor(
    private ventasService: VentasService,
    private productosService: ProductosService,
    private snack: MatSnackBar,
    private cajaService: CajaService,
    private router: Router,
    private reservaService: ReservasService,
    private metodosService: MetodoPagoService,
    private comprobanteService: ComprobantePagoService
  ) {}

  ngOnInit(): void {
    this.listarVentas();
    this.cargarProductos();
    this.dataSource.data = this.venta.detalleVenta;
    this.boletaOFactura(this.tipo);
    this.cargarReservas();
    this.cargarMetodos();
    this.seleccionarIgv(this.tipoIgv);
  }

  //SELECCIONAR IGV
  seleccionarIgv(auxiliar: number) {
    this.tipoIgv = auxiliar;
    this.venta.igv = this.tipoIgv;
  }

  boletaOFactura(auxiliar: string) {
    if (auxiliar === 'Boleta') {
      this.tipo = 'Boleta';
      this.venta.comprobantePago.numComprobante = 'B001';
    } else {
      this.tipo = 'Factura';
      this.venta.comprobantePago.numComprobante = 'F001';
    }

    this.correlativo();
  }

  correlativo() {
    console.log(this.tipo);
    this.comprobanteService.numeroCorrelativo(this.tipo).subscribe(
      (response) => {
        const correlativo = response.correlativo;

        if (this.tipo === 'Boleta') {
          this.venta.comprobantePago.numSerieBoleta = correlativo;
        } else {
          this.venta.comprobantePago.numSerieFactura = correlativo;
        }
      },
      (error) => {
        console.error('Error obteniendo correlativo:', error);
      }
    );
  }

  //VERIFICAR ESTADO DE CAJA
  esAbierto(): void {
    this.cajaService.verificarEstadoCajaRaw().subscribe({
      next: (data: any) => {
        console.log('💡 Respuesta RAW completa: ', data);
        const estadoCaja = data?.estadoCaja ?? 'desconocido';

        if (estadoCaja === 'abierta') {
          this.cajaAbierta = true;
          console.log('✅ La caja está abierta');
          this.abrirModalRegistro();
        } else {
          console.log('🚫 Caja cerrada');
          Swal.fire({
            title: 'Caja Cerrada',
            text: '¿Deseas aperturar caja?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, aperturar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/admin/caja']);
            } else {
              this.router.navigate(['/admin/venta']);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener estado caja:', error);
        this.cajaAbierta = false; // manejar error marcando como cerrada
      },
    });
  }

  //MODAL DE DETALLE VENTA
  verModal(id: number) {
    this.ventasService.buscarVentaId(id).subscribe({
      next: (venta) => {
        this.ventaSeleccionada = venta;
        console.log(this.ventaSeleccionada.ventaXReserva);
        this.paginaActual = 1;
        this.mostrarModal = true;
        console.log(venta);
      },
      error: (error) => {
        console.log(error);
        Swal.fire(
          'Error',
          'No se pudo obtener el detalle de la venta',
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
  }
  cerrarMordalRegistro() {
    this.venta = {
      idVenta: '',
      fecha: '',
      total: '',
      descuento: 0,
      cargo: 0,
      igv: 0,
      estado: 1,
      cliente: {
        idCliente: '',
        dniRuc: '',
        nombre: '',
        telefono: '',
        correo: '',
        pais: '',
        estado: 1,
      },
      ventaXReserva: [],
      detalleVenta: [],
      ventaHabitacion: [],
      ventaSalon: [],
      ventaMetodoPago: [],
      comprobantePago: {
        idVenta: '',
        numSerieBoleta: '',
        numSerieFactura: '',
        pdfUrl: '',
        numComprobante: 'B001',
        fechaEmision: '',
      },
    };
    this.modalRegistro = false;
    this.esNuevo = false;
    this.cliente.dniRuc = '';
    this.cliente.nombre = '';
    this.cliente.idCliente = '';
    this.reservaSeleccionada = false;
    this.dataHabitacion.data = [];
    this.dataSalon.data = [];
    this.tipoIgv = 0;
    this.cargarReservas();
    this.boletaOFactura('Boleta');
  }

  //LISTAR VENTAS
  listarVentas() {
    this.ventasService.listarVenta().subscribe(
      (data: any) => {
        this.ventas = data;
        this.ventasFiltrados = [...this.ventas];
        this.actualizarPaginacion();
      },
      (error) => {
        Swal.fire('error !!', 'Al cargar el listado de las ventas', 'error');
      }
    );
  }

  //MOSTRAR VUELTO
  // mostrarVuelto(): void {
  //   const totalVenta = Number(this.venta.total);
  //   const totalPagado = Number(
  //     this.venta.ventaMetodoPago.reduce(
  //       (acc, metodo) => acc + Number(metodo.pago || 0),
  //       0
  //     )
  //   );

  //   console.log("xddd")

  //   const soloEfectivo =
  //     this.venta.ventaMetodoPago.length === 1 &&
  //     this.venta.ventaMetodoPago[0].metodoPago.nombre === 'Efectivo';

  //   if (soloEfectivo && totalPagado > totalVenta) {
  //     // Aplicar redondeo (puedes ajustar la precisión)
  //     this.vuelto = +(totalPagado - totalVenta).toFixed(2);
  //     console.log(this.vuelto)
  //   } else {
  //     this.vuelto = 0;
  //   }
  // }
  // get soloEfectivo(): boolean {
  //   return (
  //     this.venta.ventaMetodoPago.length === 1 &&
  //     this.venta.ventaMetodoPago[0].metodoPago.nombre === 'Efectivo'
  //   );
  // }

  //REGISTRAR VENTA
  formSubmit() {
    const sumaSubTotales = Number(
      this.venta.detalleVenta.reduce((acc, item) => acc + item.subtotal, 0)
    );
    const descuento = Number(this.venta.descuento) || 0;

    this.venta.detalleVenta.forEach((item: any) => {
      item.subTotal = item.cantidad * item.producto.precioVenta;
      console.log(item.subTotal);
    });

    if (this.venta.ventaXReserva.length === 0) {
      this.snack.open('Debe seleccionar al menos una reserva.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    // Validación: debe haber al menos un método de pago
    if (this.venta.ventaMetodoPago.length === 0) {
      this.snack.open(
        'Debe seleccionar al menos un método de pago.',
        'Cerrar',
        {
          duration: 3000,
        }
      );
      return;
    }

    for (let detalle of this.venta.detalleVenta) {
      if (detalle.cantidad > detalle.producto?.stock) {
        this.snack.open(
          `La cantidad de "${detalle.producto?.nombre}" excede el stock disponible (${detalle.producto?.stock})`,
          'Cerrar',
          { duration: 3000 }
        );
        return;
      }
    }

    if (descuento > sumaSubTotales) {
      this.snack.open(
        'Error: El descuento no puede ser mayor al total',
        'Aceptar',
        {
          duration: 3000,
        }
      );
      return;
    }
    const hoy = new Date();
    const fechaFormateada = hoy.toISOString().split('T')[0];
    this.venta.fecha = fechaFormateada;

    const totalVenta = Number(this.venta.total);

    const totalPagado = Number(
      this.venta.ventaMetodoPago.reduce(
        (acc, metodo) => acc + Number(metodo.pago || 0),
        0
      )
    );

    if (totalPagado < totalVenta) {
      this.snack.open(
        'El monto pagado no cubre el total de la venta.',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['snackbar-error'],
        }
      );
      return;
    }

    // Verificar si solo se usó EFECTIVO
    // const soloEfectivo =
    //   this.venta.ventaMetodoPago.length === 1 &&
    //   this.venta.ventaMetodoPago[0].metodoPago.nombre === 'EFECTIVO';

    // if (totalPagado > totalVenta) {
    //   this.snack.open(
    //     'El monto pagado excede el total de la venta.',
    //     'Cerrar',
    //     {
    //       duration: 3000,
    //       panelClass: ['snackbar-error'],
    //     }
    //   );
    //   return;
    // }

    // if (soloEfectivo && totalPagado > totalVenta) {
    //   this.vuelto = totalPagado - totalVenta;
    // }

    this.ventasService.registrarVenta(this.venta).subscribe(
      (data) => {
        Swal.fire('Excelente', 'La venta fue registrado con éxito', 'success');
        this.listarVentas();
        this.cerrarMordalRegistro();
        console.log(data);
      },
      (error) => {
        console.log(error);
        this.snack.open('Rellene el formulario', 'Aceptar', {
          duration: 3000,
        });
      }
    );
  }

  //EDITAR VENTA
  editarVenta(id: number) {
    this.ventasService.buscarVentaId(id).subscribe({
      next: (data: any) => {
        this.venta = data;
        this.dataSource.data = this.venta.detalleVenta;
        this.abrirModalRegistro();
      },
      error: (error) => {
        console.log(error);
        Swal.fire('Error', 'No se pudo obtener los datos de la venta', 'error');
      },
    });
  }

  //ELIMINAR VENTA
  eliminarVenta(id: number) {
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
        this.ventasService.eliminarVenta(id).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: 'Eliminado',
              text: response.mensaje,
              icon: 'success',
            });
            this.listarVentas();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar la compra',
              icon: 'error',
            });
          },
        });
      }
    });
  }

  //GENERAR PDF
  generarComprobante(idVenta: number) {
    this.ventasService.descargarComprobante(idVenta).subscribe(
      (pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante_${idVenta}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error al descargar el comprobante:', error);
      }
    );
  }

  //BUSQUEDA DE VENTAS
  buscarVentas() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.ventasFiltrados = this.ventas.filter(
      (v) =>
        v.comprobantePago.numSerie.toLowerCase().includes(filtro) ||
        v.cliente.nombre.toLowerCase().includes(filtro)
    );
  }

  // Actualiza las ventas por página
  actualizarPaginacion() {
    const inicio =
      (this.paginaActualCompra - 1) * this.elementosPorPaginaCompra;
    const fin = inicio + this.elementosPorPaginaCompra;
    this.ventasFiltrados = this.ventas.slice(inicio, fin);
  }
  // Obtener productos de la página actual
  get ventasPaginados() {
    return this.ventasFiltrados;
  }
  get totalPagina(): number {
    return Math.ceil(this.ventas.length / this.elementosPorPaginaCompra);
  }

  // Cambiar de página
  cambiarPaginaCompra(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPagina) {
      this.paginaActualCompra = pagina;
      this.actualizarPaginacion();
    }
  }

  //PAGINACION DE VENTA
  productosPaginados() {
    if (!this.ventaSeleccionada || !this.ventaSeleccionada.detalleVenta) {
      return [];
    }
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.ventaSeleccionada.detalleVenta.slice(inicio, fin);
  }
  get totalPaginas(): number {
    if (!this.ventaSeleccionada || !this.ventaSeleccionada.detalleVenta) {
      return 0;
    }
    return Math.ceil(
      this.ventaSeleccionada.detalleVenta.length / this.elementosPorPagina
    );
  }
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  //CARGAR PRODUCTOS
  cargarProductos() {
    this.productosService.listarProductosActivos().subscribe((data) => {
      this.productos = data.filter((p) => p.precioVenta != null);
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
    const yaExiste = this.venta.detalleVenta.find(
      (d) => d.producto && d.producto.id_producto == producto.id_producto
    );
    if (!yaExiste) {
      const nuevoItem = {
        idDetalleVenta: null,
        cantidad: 1,
        precioUnit: 0,
        subtotal: 0,
        estado: 1 as const,
        producto: producto,
      };

      this.venta.detalleVenta.push(nuevoItem);

      // Ejecutar el cálculo del subtotal inmediatamente
      this.actualizarSubtotal(nuevoItem);

      this.dataSource.data = this.venta.detalleVenta;
    }

    this.cargarProductos();
    this.productoBusqueda = '';
    this.productosFiltrados = [];
    this.actualizarTotales(); // (esto ya lo hace actualizarSubtotal, pero si quieres lo puedes mantener)
  }
  actualizarSubtotal(item: any) {
    if (item.cantidad > item.producto?.stock) {
      this.snack.open('La cantidad excede al stock del producto', 'Aceptar', {
        duration: 3000,
      });
      return;
    }
    item.subtotal = item.cantidad * item.producto?.precioVenta || 0;
    console.log(item.subtotal);
    this.actualizarTotales();
  }
  eliminarProducto(index: number) {
    this.venta.detalleVenta.splice(index, 1);
    this.dataSource.data = this.venta.detalleVenta;
    this.actualizarTotales();
  }
  mostrarNombreProducto(producto: any): string {
    return producto ? '' : '';
  }

  //TOTAL
  actualizarTotales() {
    let sumaSubTotalesProductos = Number(
      this.venta.detalleVenta.reduce((acc, item) => acc + item.subtotal, 0)
    );
    let sumaSubTotalesHabitaciones = Number(
      this.venta.ventaHabitacion.reduce((acc, item) => acc + item.subTotal, 0)
    );
    let sumaSubTotalesSalones = Number(
      this.venta.ventaSalon.reduce((acc, item) => acc + item.subTotal, 0)
    );
    let sumaSubTotales =
      sumaSubTotalesProductos +
      sumaSubTotalesHabitaciones +
      sumaSubTotalesSalones;
    let descuento = this.venta.descuento || 0;
    let cargo = this.venta.cargo || 0;
    let igv = this.venta.igv || 0;
    if (Number(descuento) > sumaSubTotales) {
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
        Number(sumaSubTotales - Number(descuento)) * (Number(igv) / 100);
      this.venta.total = String(
        sumaSubTotales - Number(descuento) + conIgv + Number(cargo)
      );
    } else {
      this.venta.total = String(
        sumaSubTotales + Number(cargo) - Number(descuento)
      );
    }
  }

  //CARGAR RESERVAS
  cargarReservas() {
    this.reservaService.getReservas().subscribe((data) => {
      this.reservas = data.filter(
        (r) =>
          r.estado == 1 &&
          (r.estado_reserva == 'Pendiente' || r.estado_reserva == 'Confirmada')
      );
      this.reservasFiltrado = [...this.reservas];
    });
  }
  filtrarReservas() {
    if (typeof this.reservaSeleccionada === 'string') {
      const texto = this.reservaSeleccionada.toLowerCase();
      this.reservasFiltrado = this.reservas.filter(
        (reserva) =>
          reserva.cliente.dniRuc.toLowerCase().includes(texto) ||
          reserva.cliente.nombre.toLowerCase().includes(texto) ||
          reserva.tipo.toLowerCase().includes(texto)
      );
    } else {
      // Si es un objeto (reserva ya seleccionada), no mostrar opciones
      this.reservasFiltrado = [];
    }
  }
  seleccionarReserva(reservaSeleccionada: any) {
    if (
      this.venta.cliente.idCliente &&
      this.venta.cliente.idCliente !== reservaSeleccionada.cliente.idCliente
    ) {
      this.snack.open(
        'Solo puedes seleccionar reservas del mismo cliente.',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['snackbar-error'],
        }
      );
      return;
    }

    this.reservaSeleccionada = reservaSeleccionada;
    console.log(reservaSeleccionada);

    // Solo agregamos si aún no existe esa reserva
    const yaExiste = this.venta.ventaXReserva.some(
      (vxr) => vxr.reserva.id_reserva === reservaSeleccionada.id_reserva
    );

    if (!yaExiste) {
      this.venta.ventaXReserva.push({
        idVentaReserva: '',
        reserva: reservaSeleccionada,
      });
      this.dataReserva.data = this.venta.ventaXReserva;
    }
    this.cargarReservas();
    this.reservaBusqueda = '';
    this.reservasFiltrado = [];

    if (
      reservaSeleccionada.habitacionesXReserva &&
      reservaSeleccionada.habitacionesXReserva?.length > 0
    ) {
      this.venta.cliente = { ...reservaSeleccionada.cliente };
      reservaSeleccionada.habitacionesXReserva.forEach((habitacion: any) => {
        const dias = this.calcularDiasReserva(
          reservaSeleccionada.fecha_inicio,
          reservaSeleccionada.fecha_fin
        );
        this.venta.ventaHabitacion.push({
          idVentaHabitacion: '',
          dias: dias,
          subTotal:
            (habitacion.habitacion.tipo_habitacion?.precio_publico || 0) * dias,
          habitacion: habitacion.habitacion,
        });
        this.actualizarTotales();
        this.dataHabitacion.data = this.venta.ventaHabitacion;
      });
    }

    if (
      reservaSeleccionada.salonesXReserva &&
      reservaSeleccionada.salonesXReserva?.length > 0
    ) {
      this.venta.cliente = { ...reservaSeleccionada.cliente };
      reservaSeleccionada.salonesXReserva.forEach((salon: any) => {
        const dias = this.calcularDiasReserva(
          reservaSeleccionada.fecha_inicio,
          reservaSeleccionada.fecha_fin
        );
        this.venta.ventaSalon.push({
          idVentaSalon: '',
          horas: 0, // si tienes datos, reemplaza
          dias: dias,
          subTotal: (salon.salon.precio_diario || 0) * dias,
          salon: salon.salon,
        });
        this.actualizarTotales();
        this.dataSalon.data = this.venta.ventaSalon;
      });
    }
  }
  eliminarReserva(index: number) {
    const reservaEliminada: any = this.venta.ventaXReserva[index]?.reserva;
    this.venta.ventaXReserva.splice(index, 1);
    if (this.venta.ventaXReserva.length == 0) {
      this.venta.cliente = {
        idCliente: '',
        dniRuc: '',
        nombre: '',
        telefono: '',
        correo: '',
        pais: '',
        estado: 1, // Mantén el estado si se requiere por lógica
      };
    }
    if (reservaEliminada.tipo == 'Salón') {
      // Eliminar la re
      this.venta.ventaSalon = [];
      // Actualizar tablas y totales
      this.dataReserva.data = this.venta.ventaXReserva;
      this.dataSalon.data = this.venta.ventaSalon;
      this.actualizarTotales();
    } else {
      this.venta.ventaHabitacion = [];
      this.dataHabitacion.data = this.venta.ventaHabitacion;
      this.actualizarTotales();
    }
  }

  mostrarReserva(reserva: any): string {
    return reserva ? `` : '';
  }
  calcularDiasReserva(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const tiempo = fin.getTime() - inicio.getTime();
    return Math.ceil(tiempo / (1000 * 3600 * 24));
  }

  //METODO DE PAGO
  cargarMetodos() {
    this.metodosService.listarMetodosPagoActivo().subscribe((data) => {
      this.metodos = data;
      this.metodosFiltrado = [...this.metodos];
    });
  }
  filtrarMetodos() {
    if (typeof this.metodoSeleccionada === 'string') {
      const texto = this.metodoSeleccionada.toLowerCase();
      this.metodosFiltrado = this.metodos.filter((metodo) =>
        metodo.nombre.toLowerCase().includes(texto)
      );
    } else {
      this.metodosFiltrado = [];
    }
  }
  agregarMetodo(metodo: any) {
    const yaExiste = this.venta.ventaMetodoPago.find(
      (m) => m.metodoPago && m.metodoPago.idMetodoPago == metodo.idMetodoPago
    );
    if (!yaExiste) {
      const nuevoItem = {
        idVentaMetodoPago: null,
        pago: 0,
        metodoPago: metodo,
      };
      this.venta.ventaMetodoPago.push(nuevoItem);
      console.log(this.venta.ventaMetodoPago);
      this.dataMetodo.data = this.venta.ventaMetodoPago;
    }
    this.cargarMetodos();
    this.metodoSeleccionada = '';
    this.metodosFiltrado = [];
  }
  eliminarMetodo(index: number) {
    this.venta.ventaMetodoPago.splice(index, 1);
    this.dataMetodo.data = this.venta.ventaMetodoPago;
  }
  mostrarMetodo(metodo: any): string {
    return metodo ? `` : '';
  }
}
