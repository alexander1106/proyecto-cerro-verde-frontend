<<<<<<< HEAD

=======
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
<<<<<<< HEAD
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
=======
import { MatPaginator }      from '@angular/material/paginator';
import { MatSort }           from '@angular/material/sort';
import { Observable, of }    from 'rxjs';
import { catchError }        from 'rxjs/operators';
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474

import {
  ReportesVentasService,
  ProductoVentasDTO,
  ClienteFrecuenteDTO,
  HabitacionVentasDTO,
  SalonVentasDTO,
  PagoVentasDTO,
<<<<<<< HEAD
  SalonVentasDetalladoDTO,
  HabitacionVentasDetalladoDTO,
  PagoVentasDetalladoDTO
=======
  ReservasPorMesDTO
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
} from '../../../../service/reportes-ventas.service';

export interface VentaResumen {
  nombre:   string;
  cantidad: number;
  total:    number;
}
// Paso 1: Define tipo literal para evitar errores de tipo
type TipoReporte = 'productos' | 'salones' | 'habitaciones' | 'clientes' | 'metodos-pago';

type TipoResumen  = 'productos'|'salones'|'habitaciones'|'clientes'|'metodos-pago';
type TipoReservas = 'reservas-habitaciones'|'reservas-salones';
type TipoReporte  = TipoResumen | TipoReservas;

@Component({
  selector: 'app-consulta-ventas',
<<<<<<< HEAD
  standalone: false,
=======
    standalone: false,
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  templateUrl: './consulta-ventas.component.html',
  styleUrls: ['./consulta-ventas.component.css']
})
export class ConsultaVentasComponent implements OnInit, AfterViewInit {
  filtroForm: FormGroup;
  filtroEjecutado = false;
  public currentTipo!: TipoReporte;

  tiposReporte = [
<<<<<<< HEAD
    { value: 'productos',    label: 'Productos Más Vendidos'    },
    { value: 'salones',      label: 'Salones Más Vendidos'      },
    { value: 'habitaciones', label: 'Habitaciones Más Vendidas' },
    { value: 'clientes',     label: 'Clientes Más Frecuentes'   },
    { value: 'metodos-pago', label: 'Métodos de Pago Más Usados'}
=======
    { value: 'productos',             label: 'Productos Más Vendidos'        },
    { value: 'salones',               label: 'Salones Más Vendidos'          },
    { value: 'habitaciones',          label: 'Habitaciones Más Vendidas'     },
    { value: 'clientes',              label: 'Clientes Más Frecuentes'       },
    { value: 'metodos-pago',          label: 'Métodos de Pago Más Usados'    },
    { value: 'reservas-habitaciones', label: 'Reservas Habitaciones por Mes' },
    { value: 'reservas-salones',      label: 'Reservas Salones por Mes'      }
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  ];

  ventasReporte: VentaResumen[] = [];

  // Chart.js
<<<<<<< HEAD
  barChartOptions = { responsive: true };
=======
  barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5 },
        suggestedMax: 30
      }
    }
  };
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  barChartLabels: string[] = [];
  barChartData: any      = { labels: [], datasets: [] };

<<<<<<< HEAD
  // Angular Material Table
  displayedColumns: string[] = ['nombre', 'cantidad', 'total'];
=======
  // Angular Material table
  displayedColumns: string[]       = ['nombre','cantidad','total'];
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  dataSource = new MatTableDataSource<VentaResumen>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;
  columnaNombreEtiqueta = 'Nombre';

<<<<<<< HEAD
  // Mapa de etiquetas tipado para evitar error TS7053
  private readonly etiquetaPorTipo: Record<TipoReporte, string> = {
    'productos':     'Producto',
    'salones':       'Salón',
    'habitaciones':  'Habitación',
    'clientes':      'Cliente',
    'metodos-pago':  'Método de Pago'
=======
  private readonly etiquetaPorTipo: Record<TipoReporte,string> = {
    productos:             'Producto',
    salones:               'Salón',
    habitaciones:          'Habitación',
    clientes:              'Cliente',
    'metodos-pago':        'Método de Pago',
    'reservas-habitaciones': 'Mes',
    'reservas-salones':      'Mes'
  };

  // 1) Mapa de meses EN → ES
  private monthMap: Record<string,string> = {
    January:   'Enero',     February: 'Febrero',  March:     'Marzo',
    April:     'Abril',     May:      'Mayo',     June:      'Junio',
    July:      'Julio',     August:   'Agosto',   September:'Septiembre',
    October:   'Octubre',   November: 'Noviembre',December: 'Diciembre'
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  };

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesVentasService
  ) {
    this.filtroForm = this.fb.group({
      fechaDesde:  [null, Validators.required],
      fechaHasta:  [null, Validators.required],
      tipoReporte: [null, Validators.required]
    });
  }

  ngOnInit(): void {}
<<<<<<< HEAD

=======
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  generarReporte(): void {
    if (this.filtroForm.invalid) return;
    this.filtroEjecutado = false;
<<<<<<< HEAD
    const desde = (this.filtroForm.value.fechaDesde as Date).toISOString().substring(0, 10);
    const hasta = (this.filtroForm.value.fechaHasta as Date).toISOString().substring(0, 10);
    // Tipado explícito para que 'tipo' sea compatible con las claves de etiquetaPorTipo
    const tipo = this.filtroForm.value.tipoReporte as TipoReporte;
    this.currentTipo = tipo;

    // Ajustar etiqueta de columna sin error de indexing
    this.columnaNombreEtiqueta = this.etiquetaPorTipo[tipo];

    // Llamar servicio según tipo resumen
    switch (tipo) {
      case 'productos':
        this.reportesService.getProductosMasVendidos(desde, hasta)
          .subscribe(
            data => this.procesarResumen(data.map(d => ({ nombre: d.productoNombre, cantidad: d.cantidadVendida, total: d.totalVendido }))),
            () => this.filtroEjecutado = true
          );
        break;
      case 'salones':
        this.reportesService.getSalonesMasVendidos(desde, hasta)
          .subscribe(
            data => this.procesarResumen(data.map(d => ({ nombre: d.salonNombre, cantidad: d.vecesAlquilado, total: d.totalRecaudado }))),
            () => this.filtroEjecutado = true
          );
        break;
      case 'habitaciones':
        this.reportesService.getHabitacionesMasVendidas(desde, hasta)
          .subscribe(
            data => this.procesarResumen(data.map(d => ({ nombre: d.habitacionNumero, cantidad: d.vecesVendida, total: d.totalRecaudado }))),
            () => this.filtroEjecutado = true
          );
        break;
      case 'clientes':
        this.reportesService.getClientesMasFrecuentes(desde, hasta)
          .subscribe(
            data => this.procesarResumen(data.map(d => ({ nombre: d.clienteNombre, cantidad: d.cantidadCompras, total: d.totalGastado }))),
            () => this.filtroEjecutado = true
          );
        break;
      case 'metodos-pago':
        this.reportesService.getMetodosPagoMasUsados(desde, hasta)
          .subscribe(
            data => this.procesarResumen(data.map(d => ({ nombre: d.metodoPago, cantidad: d.vecesUsado, total: d.totalRecibido }))),
            () => this.filtroEjecutado = true
          );
=======

    const desde = (this.filtroForm.value.fechaDesde  as Date).toISOString().slice(0,10);
    const hasta = (this.filtroForm.value.fechaHasta  as Date).toISOString().slice(0,10);
    this.currentTipo = this.filtroForm.value.tipoReporte;

    this.columnaNombreEtiqueta = this.etiquetaPorTipo[this.currentTipo];

    const mapResumen = (d:any): VentaResumen => ({
      nombre:   d.productoNombre || d.salonNombre || d.habitacionNumero || d.clienteNombre || d.metodoPago,
      cantidad: d.cantidadVendida  || d.vecesAlquilado    || d.vecesVendida     || d.cantidadCompras  || d.vecesUsado,
      total:    d.totalVendido      || d.totalRecaudado     || d.totalRecabado    || d.totalGastado     || d.totalRecibido
    });

    switch (this.currentTipo) {
      case 'productos':
        this.reportesService.getProductosMasVendidos(desde,hasta)
          .subscribe(data => this.procesarResumen(data.map(mapResumen)));
        break;
      case 'salones':
        this.reportesService.getSalonesMasVendidos(desde,hasta)
          .subscribe(data => this.procesarResumen(data.map(mapResumen)));
        break;
      case 'habitaciones':
        this.reportesService.getHabitacionesMasVendidas(desde,hasta)
          .subscribe(data => this.procesarResumen(data.map(mapResumen)));
        break;
      case 'clientes':
        this.reportesService.getClientesMasFrecuentes(desde,hasta)
          .subscribe(data => this.procesarResumen(data.map(mapResumen)));
        break;
      case 'metodos-pago':
        this.reportesService.getMetodosPagoMasUsados(desde,hasta)
          .subscribe(data => this.procesarResumen(data.map(mapResumen)));
        break;
      case 'reservas-habitaciones':
        this.reportesService.getReservasPorMes('habitaciones',desde,hasta)
          .subscribe(arr => this.procesarResumen(arr.map(d => ({
            nombre:   d.mes,
            cantidad: d.cantidad,
            total:    d.total
          }))));
        break;
      case 'reservas-salones':
        this.reportesService.getReservasPorMes('salones',desde,hasta)
          .subscribe(arr => this.procesarResumen(arr.map(d => ({
            nombre:   d.mes,
            cantidad: d.cantidad,
            total:    d.total
          }))));
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
        break;
    }
  }

  private procesarResumen(data: VentaResumen[]) {
    this.ventasReporte = data;
    this.armarTablaYGrafico();
    this.filtroEjecutado = true;
  }

<<<<<<< HEAD
  private armarTablaYGrafico() {
    this.dataSource.data = this.ventasReporte;
    const topCinco = [...this.ventasReporte]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
    const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

      this.barChartLabels = topCinco.map(x => x.nombre);
      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [{
          data: topCinco.map(x => x.cantidad),
          label: 'Cantidad',
          backgroundColor: colores.slice(0, topCinco.length)
        }]
      };
=======
  // 2) Traduce etiquetas de mes
  private translateMonths(labels: string[]): string[] {
    return labels.map(l => this.monthMap[l] ?? l);
  }

  private armarTablaYGrafico() {
    this.dataSource.data = this.ventasReporte;

    // Top 5
    const topCinco = [...this.ventasReporte]
      .sort((a,b)=> b.cantidad - a.cantidad)
      .slice(0,5);

    // Labels
    let labels = topCinco.map(x => x.nombre);
    if (this.currentTipo.startsWith('reservas')) {
      labels = this.translateMonths(labels);
    }
    this.barChartLabels = labels;

    // Colores únicos
    const palette = [
      '#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF',
      '#FF9F40','#4D5360','#B0DE09','#DCDCDC','#C9CBCF'
    ];
    const backgroundColor = labels.map((_,i) => palette[i % palette.length]);

    const labelSet = this.currentTipo.startsWith('reservas') ? 'Reservas' : 'Cantidad';

    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [{
        label: labelSet,
        data:  topCinco.map(x=> x.cantidad),
        backgroundColor
      }]
    };
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  }

  applyFilter(event: Event) {
    const v = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = v;
  }

  top1(): VentaResumen | null {
    return this.ventasReporte.length
<<<<<<< HEAD
      ? this.ventasReporte.reduce((p, c) => c.cantidad > p.cantidad ? c : p)
      : null;
  }

  // ----------- Descarga Resumen -----------
  descargarPDFResumen() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().substring(0, 10);
    const hasta = (fechaHasta as Date).toISOString().substring(0, 10);
    this.reportesService.descargarPdfResumen(this.currentTipo, desde, hasta)
      .subscribe(blob => this.descargarBlob(blob, `reporte_${this.currentTipo}.pdf`));
=======
      ? this.ventasReporte.reduce((p,c)=> c.cantidad>p.cantidad?c:p)
      : null;
  }

  // -------- Descarga PDF/Excel Resumen o Reservas --------

  descargarPDFResumen() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().substring(0,10);
    const hasta = (fechaHasta as Date).toISOString().substring(0,10);
    const tipo  = this.currentTipo;

    if ((['productos','salones','habitaciones','clientes','metodos-pago'] as TipoResumen[]).includes(tipo as TipoResumen)) {
      // resumen estándar PDF
      this.reportesService
        .descargarPdfResumen(tipo as TipoResumen, desde, hasta)
        .subscribe(blob => this.descargarBlob(blob, `reporte_${tipo}.pdf`));
    }
    else {
      // reservas-por-mes PDF
      const t = tipo === 'reservas-habitaciones' ? 'habitaciones' : 'salones';
      this.reportesService
        .descargarPdfReservasPorMes(t, desde, hasta)
        .subscribe(blob => this.descargarBlob(blob, `reservas_${t}.pdf`));
    }
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  }

  descargarExcelResumen() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
<<<<<<< HEAD
    const desde = (fechaDesde as Date).toISOString().substring(0, 10);
    const hasta = (fechaHasta as Date).toISOString().substring(0, 10);
    this.reportesService.descargarExcelResumen(this.currentTipo, desde, hasta)
      .subscribe(blob => this.descargarBlob(blob, `reporte_${this.currentTipo}.xlsx`));
=======
    const desde = (fechaDesde as Date).toISOString().substring(0,10);
    const hasta = (fechaHasta as Date).toISOString().substring(0,10);
    const tipo  = this.currentTipo;

    if ((['productos','salones','habitaciones','clientes','metodos-pago'] as TipoResumen[]).includes(tipo as TipoResumen)) {
      // resumen estándar Excel
      this.reportesService
        .descargarExcelResumen(tipo as TipoResumen, desde, hasta)
        .subscribe(blob => this.descargarBlob(blob, `reporte_${tipo}.xlsx`));
    }
    else {
      // reservas-por-mes Excel
      const t = tipo === 'reservas-habitaciones' ? 'habitaciones' : 'salones';
      this.reportesService
        .descargarExcelReservasPorMes(t, desde, hasta)
        .subscribe(blob => this.descargarBlob(blob, `reservas_${t}.xlsx`));
    }
  }

  // ------ Descarga Detallado PDF/Excel ------

  descargarPDFDetallado() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().substring(0,10);
    const hasta = (fechaHasta as Date).toISOString().substring(0,10);
    let obs: Observable<Blob>;

    switch (this.currentTipo) {
      case 'salones':
        obs = this.reportesService.descargarPdfSalonesDetallado(desde, hasta);
        break;
      case 'habitaciones':
        obs = this.reportesService.descargarPdfHabitacionesDetallado(desde, hasta);
        break;
      case 'metodos-pago':
        obs = this.reportesService.descargarPdfMetodosPagoDetallado(desde, hasta);
        break;
      default:
        return;
    }

    obs.subscribe(blob => this.descargarBlob(blob, `${this.currentTipo}_detallado.pdf`));
  }

  descargarExcelDetallado() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().substring(0,10);
    const hasta = (fechaHasta as Date).toISOString().substring(0,10);
    let obs: Observable<Blob>;

    switch (this.currentTipo) {
      case 'salones':
        obs = this.reportesService.descargarExcelSalonesDetallado(desde, hasta);
        break;
      case 'habitaciones':
        obs = this.reportesService.descargarExcelHabitacionesDetallado(desde, hasta);
        break;
      case 'metodos-pago':
        obs = this.reportesService.descargarExcelMetodosPagoDetallado(desde, hasta);
        break;
      default:
        return;
    }

    obs.subscribe(blob => this.descargarBlob(blob, `${this.currentTipo}_detallado.xlsx`));
  }

  // ---------- Helper para descargar Blobs ----------
  private descargarBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
>>>>>>> 631e70c14c170255a7eb73b43d2191cf5f959474
  }

  // ----------- Descarga Detallado -----------
  descargarPDFDetallado() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().substring(0, 10);
    const hasta = (fechaHasta as Date).toISOString().substring(0, 10);
    let obs: Observable<Blob>;
    if (this.currentTipo === 'salones')
      obs = this.reportesService.descargarPdfSalonesDetallado(desde, hasta);
    else if (this.currentTipo === 'habitaciones')
      obs = this.reportesService.descargarPdfHabitacionesDetallado(desde, hasta);
    else if (this.currentTipo === 'metodos-pago')
      obs = this.reportesService.descargarPdfMetodosPagoDetallado(desde, hasta);
    else return;
    obs.subscribe(blob => this.descargarBlob(blob, `${this.currentTipo}_detallado.pdf`));
  }

  descargarExcelDetallado() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().substring(0, 10);
    const hasta = (fechaHasta as Date).toISOString().substring(0, 10);
    let obs: Observable<Blob>;
    if (this.currentTipo === 'salones')
      obs = this.reportesService.descargarExcelSalonesDetallado(desde, hasta);
    else if (this.currentTipo === 'habitaciones')
      obs = this.reportesService.descargarExcelHabitacionesDetallado(desde, hasta);
    else if (this.currentTipo === 'metodos-pago')
      obs = this.reportesService.descargarExcelMetodosPagoDetallado(desde, hasta);
    else return;
    obs.subscribe(blob => this.descargarBlob(blob, `${this.currentTipo}_detallado.xlsx`));
  }

  private descargarBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}