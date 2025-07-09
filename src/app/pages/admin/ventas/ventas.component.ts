import { Component } from '@angular/core';
import { VentasService } from '../../../service/ventas.service';
import { ProductosService } from '../../../service/productos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { CajaService } from '../../../service/caja.service';
import { Router } from '@angular/router';
import { ReservasService } from '../../../service/reserva.service';
import { MetodoPagoService } from '../../../service/metodo-pago.service';
import { ComprobantePagoService } from '../../../service/comprobante-pago.service';
import { ClientesService } from '../../../service/clientes.service';

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
  modalRegistroHospedaje: boolean = false;
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
    tipoVenta: '',
    descuento: 0,
    cargo: 0,
    igv: 0,
    estado: 1,
    estadoVenta: '',
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
      subTotal: any;
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
          precio: any;
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
  estadoSeleccionado: string = 'Pendiente';
  modalEditar: boolean = false;
  tipoVentaSeleccionado: string = 'todos';
  modalRegistroProductos = false; // Nueva propiedad
  esVentaProductos = false;
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  constructor(
    private ventasService: VentasService,
    private productosService: ProductosService,
    private snack: MatSnackBar,
    private cajaService: CajaService,
    private router: Router,
    private reservaService: ReservasService,
    private metodosService: MetodoPagoService,
    private comprobanteService: ComprobantePagoService,
    private clienteService: ClientesService
  ) {}

  ngOnInit(): void {
    this.listarVentas();
    this.cargarProductos();
    this.dataSource.data = this.venta.detalleVenta;
    this.boletaOFactura(this.tipo);
    this.cargarReservas();
    this.cargarMetodos();
    this.seleccionarIgv(this.tipoIgv);
    // Inicializar filtros
    this.tipoVentaSeleccionado = 'hospedaje'; // Valor por defecto
    this.estadoSeleccionado = 'Completado';
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.cargarClientes();
  }

  // Nuevo método para manejar cambio de tipo de venta
  onTipoVentaChange(): void {
    // Resetear el estado cuando cambie el tipo de venta
    this.estadoSeleccionado = 'todos';
    this.aplicarFiltros();
  }

  // Propiedades adicionales
  mismoClienteFacturacion: boolean = true;
  clienteFacturacion: any = null;

  // Método para manejar cambio de "mismo cliente"
  onMismoClienteChange(event: any): void {
    this.mismoClienteFacturacion = event.target.checked;
    if (this.mismoClienteFacturacion && this.reservaSeleccionada) {
      this.venta.cliente = { ...this.reservaSeleccionada.cliente };
    } else {
      this.clienteFacturacion = null;
    }
  }

  // Método para seleccionar cliente diferente para facturación
  seleccionarClienteFacturacion(cliente: any): void {
    this.clienteFacturacion = cliente;
    this.venta.cliente = { ...cliente };
  }

  //SELECCIONAR IGV
  seleccionarIgv(auxiliar: number) {
    this.tipoIgv = auxiliar;
    this.venta.igv = this.tipoIgv;
  }

  //Boleta o Factura
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

  //Generar correlativo de la boleta o factura
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
  abrirVentaHospedaje(): void {
    this.cajaService.verificarEstadoCajaRaw().subscribe({
      next: (data: any) => {
        const estadoCaja = data?.estadoCaja ?? 'desconocido';
        if (estadoCaja === 'abierta') {
          this.cajaAbierta = true;
          this.titulo = 'Hospedaje';
          this.abrirModalRegistroHospedaje();
        } else {
          this.mostrarModalCajaCerrada();
        }
      },
      error: (error) => {
        console.error('Error al obtener estado caja:', error);
        this.cajaAbierta = false;
      },
    });
  }

  abrirVentaProductos(): void {
    this.cajaService.verificarEstadoCajaRaw().subscribe({
      next: (data: any) => {
        const estadoCaja = data?.estadoCaja ?? 'desconocido';
        if (estadoCaja === 'abierta') {
          this.cajaAbierta = true;
          this.titulo = 'Productos';
          this.abrirModalRegistroProductos();
        } else {
          this.mostrarModalCajaCerrada();
        }
      },
      error: (error) => {
        console.error('Error al obtener estado caja:', error);
        this.cajaAbierta = false;
      },
    });
  }

  private mostrarModalCajaCerrada(): void {
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
      }
    });
  }

  // Nuevo método para abrir modal de productos
  abrirModalRegistroProductos(): void {
    this.modalRegistroProductos = true; // Activar modal de productos
    this.titulo = 'Productos';
    // Limpiar datos que no corresponden a productos
    this.venta.ventaXReserva = [];
    this.venta.ventaHabitacion = [];
    this.venta.ventaSalon = [];
    this.dataReserva.data = [];
    this.dataHabitacion.data = [];
    this.dataSalon.data = [];
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

  //MODAL DE REGISTRO
  abrirModalEditar() {
    this.modalEditar = true;
  }
  cerrarModalEditar() {
    this.modalEditar = false;
  }

  //MODAL DE EDICION
  abrirModalRegistroHospedaje() {
    this.modalRegistroHospedaje = true;
  }
  // Modificar el método cerrarMordalRegistro para cerrar ambos modales
  cerrarMordalRegistro() {
    // Resetear venta
    this.venta = {
      idVenta: '',
      fecha: '',
      total: '',
      tipoVenta: '',
      descuento: 0,
      cargo: 0,
      igv: 0,
      estado: 1,
      estadoVenta: '',
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

    // Cerrar ambos modales
    this.modalRegistroHospedaje = false;
    this.modalRegistroProductos = false; // Cerrar modal de productos

    // Resetear otras variables
    this.esNuevo = false;
    this.cliente.dniRuc = '';
    this.cliente.nombre = '';
    this.cliente.idCliente = '';
    this.reservaSeleccionada = false;
    this.dataHabitacion.data = [];
    this.dataSalon.data = [];
    this.dataSource.data = []; // Limpiar productos
    this.dataMetodo.data = [];
    this.tipoIgv = 0;
    this.cargarReservas();
    this.boletaOFactura('Boleta');
  }

  //LISTAR VENTAS
  listarVentas() {
    this.ventasService.listarVenta().subscribe({
      next: (data: any) => {
        console.log(data);
        // Agregar este log específico
        data.forEach((venta: any, index: number) => {
          console.log(`Venta ${index}:`, {
            id: venta.idVenta,
            tipoVenta: venta.tipoVenta,
            estadoVenta: venta.estadoVenta,
          });
        });
        this.ventas = data;
        this.filtrarPorEstado(this.estadoSeleccionado);
      },
      error: (error) => {
        Swal.fire('error !!', 'Al cargar el listado de las ventas', 'error');
        console.log(error);
      },
    });
  }

  // Modificar el método de filtros
  filtrarPorTipoVenta(tipo: string) {
    this.tipoVentaSeleccionado = tipo;
    this.aplicarFiltros();
  }

  //FILTRAR POR ESTADO
  filtrarPorEstado(estado: string) {
    this.estadoSeleccionado = estado;
    this.aplicarFiltros(); // aplica también el filtro por búsqueda
  }

  //REGISTRAR VENTA
  //REGISTRAR VENTA - CÓDIGO COMPLETO CORREGIDO
  formSubmit() {
    // Validaciones comunes
    const sumaSubTotales = Number(
      this.venta.detalleVenta.reduce((acc, item) => acc + item.subTotal, 0)
    );
    const descuento = Number(this.venta.descuento) || 0;

    // Actualizar subtotales
    this.venta.detalleVenta.forEach((item: any) => {
      item.subTotal = item.cantidad * item.producto.precioVenta;
    });

    // VALIDACIONES ESPECÍFICAS POR TIPO
    if (this.titulo === 'Hospedaje') {
      // Validaciones para hospedaje
      if (this.venta.ventaXReserva.length === 0) {
        this.snack.open('Debe seleccionar al menos una reserva.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }
    } else if (this.titulo === 'Productos') {
      // Validaciones para productos
      if (this.venta.detalleVenta.length === 0) {
        this.snack.open('Debe seleccionar al menos un producto.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      // Validar que tenga cliente
      if (!this.venta.cliente || !this.venta.cliente.idCliente) {
        this.snack.open('Debe seleccionar un cliente.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }
    }

    // Validación común: método de pago
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

    // Validación de stock para productos
    if (this.titulo === 'Productos' || this.venta.detalleVenta.length > 0) {
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
    }

    // Validación de descuento
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

    // Configurar fecha
    const ahora = new Date();
    const fechaHoraFormateada = ahora.toISOString().slice(0, 19).replace('T', ' ');
    this.venta.fecha = fechaHoraFormateada; // "2025-07-09 14:39:00"    

    // Para productos, el estado inicial es pendiente
    if (this.titulo === 'Productos') {
      this.venta.estadoVenta = 'Pendiente';
    } else {
      this.venta.estadoVenta = 'Pendiente';
    }

    // Validación de pagos
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

    if (totalPagado > totalVenta) {
      this.snack.open(
        'El monto pagado excede el total de la venta.',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['snackbar-error'],
        }
      );
      return;
    }

    // Procesar según el tipo
    if (this.titulo === 'Hospedaje') {
      this.registrarVentaHospedaje();
    } else if (this.titulo === 'Productos') {
      // Para actualizar productos, usar el método correcto
      if (this.venta.idVenta) {
        this.actualizarVentaProductos();
      } else {
        this.registrarVentaProductos();
      }
    }
  }

  // Nuevo método para actualizar productos
  actualizarVentaProductos(): void {
    const ventaProductos = {
      ...this.venta,
      tipoVenta: 'productos',
      // Asegurar que no tenga datos de reserva
      ventaXReserva: [],
      ventaHabitacion: [],
      ventaSalon: [],
    };

    this.ventasService.editarVentaProductos(ventaProductos).subscribe({
      next: (response) => {
        Swal.fire(
          'Excelente',
          'Venta de productos actualizada con éxito',
          'success'
        );
        this.listarVentas();
        this.cerrarMordalRegistro();
      },
      error: (error) => {
        console.error(error);
        this.snack.open('Error al actualizar venta de productos', 'Aceptar', {
          duration: 3000,
        });
      },
    });
  }

  // Nuevo método para registrar hospedaje
  registrarVentaHospedaje(): void {
    this.venta.tipoVenta = 'hospedaje';

    this.ventasService.registrarPagoHospedaje(this.venta).subscribe({
      next: (response) => {
        Swal.fire(
          'Excelente',
          'Pago de hospedaje registrado con éxito',
          'success'
        );
        this.listarVentas();
        this.cerrarMordalRegistro();

        // 🔁 Usar el ID correcto de la venta
        const idVenta = response.ventaId;
        if (idVenta) {
          this.generarYImprimirComprobante(idVenta);
        } else {
          console.error('La respuesta no contiene ventaId:', response);
        }
      },
      error: (error) => {
        console.error(error);
        this.snack.open('Error al registrar pago de hospedaje', 'Aceptar', {
          duration: 3000,
        });
      },
    });
  }

  // Nuevo método para registrar productos
  registrarVentaProductos(): void {
    // Preparar datos específicos para productos
    const ventaProductos = {
      ...this.venta,
      tipoVenta: 'productos',
      estadoVenta: 'Pendiente',
      // Asegurar que no tenga datos de reserva
      ventaXReserva: [],
      ventaHabitacion: [],
      ventaSalon: [],
    };

    this.ventasService.registrarVentaProductos(ventaProductos).subscribe({
      next: (response) => {
        Swal.fire(
          'Excelente',
          'Venta de productos registrada con éxito',
          'success'
        );
        this.listarVentas();
        this.cerrarMordalRegistro();
      },
      error: (error) => {
        console.error(error);
        const mensaje =
          error.error?.error || 'Error al registrar venta de productos';
        this.snack.open(mensaje, 'Aceptar', {
          duration: 3000,
        });
      },
    });
  }

  // Método para confirmar venta de productos
  confirmarVentaProductos(ventaId: number): void {
    Swal.fire({
      title: 'Confirmar Venta',
      text: 'Seleccione el tipo de comprobante:',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Boleta',
      denyButtonText: 'Factura',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarConfirmacion(ventaId, 'Boleta');
      } else if (result.isDenied) {
        this.procesarConfirmacion(ventaId, 'Factura');
      }
    });
  }

  private procesarConfirmacion(ventaId: number, tipoComprobante: string): void {
    this.ventasService
      .confirmarVentaProductos(ventaId, tipoComprobante)
      .subscribe({
        next: (response) => {
          Swal.fire(
            'Confirmado',
            `Venta confirmada con ${tipoComprobante}`,
            'success'
          );
          this.listarVentas();

          // 🔁 Generar e imprimir comprobante después de confirmar
          this.generarYImprimirComprobante(ventaId);
        },
        error: (error) => {
          console.error(error);
          this.snack.open('Error al confirmar venta', 'Aceptar', {
            duration: 3000,
          });
        },
      });
  }

  //ACTUALIZAR VENTA - CORREGIDO
  actualizarVenta() {
    const sumaSubTotales = Number(
      this.venta.detalleVenta.reduce((acc, item) => acc + item.subTotal, 0)
    );
    const descuento = Number(this.venta.descuento) || 0;

    // Solo validar reservas si es hospedaje
    if (this.titulo === 'Hospedaje') {
      if (this.venta.ventaXReserva.length === 0) {
        this.snack.open('Debe seleccionar al menos una reserva.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }
    } else if (this.titulo === 'Productos') {
      // Validar productos
      if (this.venta.detalleVenta.length === 0) {
        this.snack.open('Debe seleccionar al menos un producto.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      // Validar cliente
      if (!this.venta.cliente || !this.venta.cliente.idCliente) {
        this.snack.open('Debe seleccionar un cliente.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }
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
        { duration: 3000 }
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

    this.ventasService.modificarVenta(this.venta).subscribe(
      (data) => {
        Swal.fire('Excelente', 'La venta fue modificada con éxito', 'success');
        this.listarVentas();
        this.cerrarMordalRegistro();
      },
      (error) => {
        console.log(error);
        this.snack.open('Error al modificar la venta', 'Aceptar', {
          duration: 3000,
        });
      }
    );
  }

  //EDITAR VENTA - SIMPLIFICADO solo para productos
  editarVenta(id: number) {
    this.ventasService.buscarVentaId(id).subscribe({
      next: (data: any) => {
        this.venta = data;
        this.dataSource.data = this.venta.detalleVenta;
        this.dataMetodo.data = this.venta.ventaMetodoPago;

        // Directamente abrir modal de productos
        this.titulo = 'Productos';
        this.modalRegistroProductos = true;

        this.tipoIgv = this.venta.igv;
        console.log(data);
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
  generarYImprimirComprobante(idVenta: number) {
    this.ventasService.descargarComprobante(idVenta).subscribe(
      (pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        // Abrir nueva ventana para imprimir
        const printWindow = window.open(url, '_blank');

        if (printWindow) {
          printWindow.focus();
          printWindow.onload = () => {
            printWindow.print();
          };
        } else {
          console.error('No se pudo abrir una nueva ventana para imprimir.');
        }
      },
      (error) => {
        console.error('Error al descargar el comprobante:', error);
      }
    );
  }

  //BUSQUEDA DE VENTAS
  buscarVentas() {
    this.aplicarFiltros(); // aplica también el filtro por estado
  }

  // Obtener productos de la página actual - CORREGIR este método
  get ventasPaginados() {
    const inicio =
      (this.paginaActualCompra - 1) * this.elementosPorPaginaCompra;
    const fin = inicio + this.elementosPorPaginaCompra;
    return this.ventasFiltrados.slice(inicio, fin);
  }
  // Corregir el cálculo del total de páginas
  get totalPagina(): number {
    return Math.ceil(
      this.ventasFiltrados.length / this.elementosPorPaginaCompra
    );
  }
  /// Cambiar de página - MANTENER pero simplificar
  cambiarPaginaCompra(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPagina) {
      this.paginaActualCompra = pagina;
      // Ya no necesitas llamar actualizarPaginacion aquí
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

  // Actualizar el método aplicarFiltros - CORREGIR
  aplicarFiltros() {
    let filtrados = this.ventas;

    // Filtro por tipo de venta
    if (this.tipoVentaSeleccionado !== 'todos') {
      if (this.tipoVentaSeleccionado === 'hospedaje') {
        filtrados = filtrados.filter((v) => v.tipoVenta === 'hospedaje');
      } else if (this.tipoVentaSeleccionado === 'productos') {
        filtrados = filtrados.filter((v) => v.tipoVenta === 'productos');
      }
    }

    // Filtro por estado
    if (this.estadoSeleccionado !== 'todos') {
      filtrados = filtrados.filter(
        (v) => v.estadoVenta === this.estadoSeleccionado
      );
    }

    // Filtro por rango de fechas
    if (this.fechaDesde || this.fechaHasta) {
      filtrados = filtrados.filter((v) => {
        const fechaVenta = new Date(v.fecha);

        // Comparar solo fechas (sin horas)
        const fechaVentaSolo = new Date(
          fechaVenta.getFullYear(),
          fechaVenta.getMonth(),
          fechaVenta.getDate()
        );

        let cumpleFechaDesde = true;
        let cumpleFechaHasta = true;

        if (this.fechaDesde) {
          const fechaDesdeSolo = new Date(
            this.fechaDesde.getFullYear(),
            this.fechaDesde.getMonth(),
            this.fechaDesde.getDate()
          );
          cumpleFechaDesde = fechaVentaSolo >= fechaDesdeSolo;
        }

        if (this.fechaHasta) {
          const fechaHastaSolo = new Date(
            this.fechaHasta.getFullYear(),
            this.fechaHasta.getMonth(),
            this.fechaHasta.getDate()
          );
          cumpleFechaHasta = fechaVentaSolo <= fechaHastaSolo;
        }

        return cumpleFechaDesde && cumpleFechaHasta;
      });
    }

    // Filtro por texto (cliente)
    if (this.filtroBusqueda.trim() !== '') {
      const filtroTexto = this.filtroBusqueda.toLowerCase();
      filtrados = filtrados.filter(
        (v) =>
          v.cliente?.nombre?.toLowerCase().includes(filtroTexto) ||
          v.idVenta?.toString().includes(filtroTexto)
      );
    }

    // Asignar los resultados filtrados
    this.ventasFiltrados = filtrados;

    // Resetear a la primera página cuando se aplican filtros
    this.paginaActualCompra = 1;

    // Actualizar información de resultados
    this.actualizarInfoResultados();
  }

  // Método para filtros de fecha rápidos
  filtroFechaRapido(periodo: string) {
    const hoy = new Date();

    switch (periodo) {
      case 'hoy':
        this.fechaDesde = new Date(hoy);
        this.fechaHasta = new Date(hoy);
        break;

      case 'ayer':
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        this.fechaDesde = new Date(ayer);
        this.fechaHasta = new Date(ayer);
        break;

      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo
        this.fechaDesde = new Date(inicioSemana);
        this.fechaHasta = new Date(hoy);
        break;

      case 'mes':
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        this.fechaDesde = new Date(inicioMes);
        this.fechaHasta = new Date(hoy);
        break;
    }

    this.aplicarFiltros();
  }

  // Método para limpiar filtros
  limpiarFiltros() {
    this.tipoVentaSeleccionado = 'hospedaje'; // Valor por defecto
    this.estadoSeleccionado = 'todos';
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  // Método para actualizar información de resultados
  actualizarInfoResultados() {
    let info = `Mostrando ${this.ventasFiltrados.length} de ${this.ventas.length} ventas`;

    if (this.fechaDesde && this.fechaHasta) {
      const formatoFecha = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      } as const;
      const fechaDesdeStr = this.fechaDesde.toLocaleDateString(
        'es-ES',
        formatoFecha
      );
      const fechaHastaStr = this.fechaHasta.toLocaleDateString(
        'es-ES',
        formatoFecha
      );
      info += ` (${fechaDesdeStr} - ${fechaHastaStr})`;
    } else if (this.fechaDesde) {
      const fechaDesdeStr = this.fechaDesde.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      info += ` (desde ${fechaDesdeStr})`;
    } else if (this.fechaHasta) {
      const fechaHastaStr = this.fechaHasta.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      info += ` (hasta ${fechaHastaStr})`;
    }

    this.infoResultados = info;
  }

  // Propiedad para mostrar info de resultados
  infoResultados: string = '';

  // Método para validar rango de fechas
  // Agregar método de validación de rango de fechas
  validarRangoFechas() {
    if (
      this.fechaDesde &&
      this.fechaHasta &&
      this.fechaDesde > this.fechaHasta
    ) {
      this.snack.open(
        'La fecha "Desde" no puede ser mayor que la fecha "Hasta"',
        'Aceptar',
        {
          duration: 3000,
        }
      );
      this.fechaHasta = null;
    }
  }

  //CARGAR PRODUCTOS
  cargarProductos() {
    this.productosService.listarProductos().subscribe((data) => {
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
        subTotal: 0,
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
    item.subTotal = item.cantidad * item.producto?.precioVenta || 0;
    console.log(item.subTotal);
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
      this.venta.detalleVenta.reduce((acc, item) => acc + item.subTotal, 0)
    );

    let sumaSubTotalesHabitaciones = 0;
    let sumaSubTotalesSalones = 0;

    // Solo calcular habitaciones y salones si es hospedaje
    if (this.titulo === 'Hospedaje') {
      sumaSubTotalesHabitaciones = Number(
        this.venta.ventaHabitacion.reduce((acc, item) => acc + item.subTotal, 0)
      );
      sumaSubTotalesSalones = Number(
        this.venta.ventaSalon.reduce((acc, item) => acc + item.subTotal, 0)
      );
    }

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
      reservaSeleccionada.habitacionesXReserva.length > 0
    ) {
      this.venta.cliente = { ...reservaSeleccionada.cliente };
      // Filtrar solo las habitaciones con estado = 1
      reservaSeleccionada.habitacionesXReserva
        .filter((habitacion: any) => habitacion.estado === 1)
        .forEach((habitacion: any) => {
          const dias = this.calcularDiasReserva(
            reservaSeleccionada.fecha_inicio,
            reservaSeleccionada.fecha_fin
          );
          this.venta.ventaHabitacion.push({
            idVentaHabitacion: '',
            dias: dias,
            subTotal:
              (habitacion.habitacion.tipo_habitacion?.precio || 0) * dias,
            habitacion: habitacion.habitacion,
          });
          this.actualizarTotales();
          this.dataHabitacion.data = this.venta.ventaHabitacion;
        });
    }

    if (
      reservaSeleccionada.salonesXReserva &&
      reservaSeleccionada.salonesXReserva.length > 0
    ) {
      this.venta.cliente = { ...reservaSeleccionada.cliente };
      // Filtrar solo los salones con estado = 1
      reservaSeleccionada.salonesXReserva
        .filter((salon: any) => salon.estado === 1)
        .forEach((salon: any) => {
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
    this.metodosService.listarMetodosPago().subscribe((data) => {
      this.metodos = data.filter((metodo: any) => metodo.estadoMetodo == 1);
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

  //CARGAR CLIENTES
  cargarClientes() {
    this.clienteService.getClientes().subscribe((data) => {
      this.clientes = data;
      this.clientesFiltrado = [...this.clientes];
    });
  }
  filtrarClientes() {
    const filtro = String(this.venta.cliente).trim().toLowerCase();
    if (filtro === '') {
      this.clientesFiltrado = [...this.clientes];
      this.cargarClientes();
    } else {
      this.clientesFiltrado = this.clientes.filter(
        (c) =>
          c.dniRuc.toLowerCase().includes(filtro) ||
          c.nombre.toLowerCase().includes(filtro)
      );
    }
  }
  seleccionarCliente(clienteSeleccionado: string) {
    const seleccionada = this.clientes.find(
      (c) => c.dniRuc === clienteSeleccionado
    );
    if (seleccionada) {
      this.venta.cliente.dniRuc = seleccionada.dniRuc;
      this.venta.cliente.nombre = seleccionada.nombre;
    }
    console.log(seleccionada);
  }
  mostrarCliente = (cliente: any): string => {
    if (!cliente || !cliente.dniRuc || !cliente.nombre) {
      return '';
    }
    return `${cliente.dniRuc} | ${cliente.nombre}`;
  };

  //DESCARGAR NOTA DE CREDITO
  descargarNotaCredito(idVenta: number) {
    if (!idVenta || isNaN(idVenta)) {
      this.snack.open(
        'No se ha especificado un ID de venta válido.',
        'Cerrar',
        {
          duration: 3000,
        }
      );
      return;
    }

    // Paso 1: Obtener la nota de crédito por ID de venta
    this.ventasService.obtenerNotaCreditoPorVenta(idVenta).subscribe({
      next: (notaCredito) => {
        const idNotaCredito = notaCredito.id;

        // Paso 2: Descargar el PDF usando el ID de la nota
        this.ventasService.descargarNotaCredito(idNotaCredito).subscribe({
          next: (response: Blob) => {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `nota_credito_${idNotaCredito}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => {
            console.error('Error al descargar la nota de crédito', err);
            this.snack.open(
              'Hubo un problema al descargar la nota de crédito.',
              'Cerrar',
              { duration: 3000 }
            );
          },
        });
      },
      error: (err) => {
        console.error('No se encontró nota de crédito para esta venta', err);
        this.snack.open(
          'No se encontró nota de crédito para esta venta.',
          'Cerrar',
          {
            duration: 3000,
          }
        );
      },
    });
  }
}
