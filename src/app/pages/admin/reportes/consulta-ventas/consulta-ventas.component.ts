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
import { MatPaginator }      from '@angular/material/paginator';
import { MatSort }           from '@angular/material/sort';
import { Observable, of }    from 'rxjs';
import { catchError }        from 'rxjs/operators';

import {
  ReportesVentasService,
  ProductoVentasDTO,
  ClienteFrecuenteDTO,
  HabitacionVentasDTO,
  SalonVentasDTO,
  PagoVentasDTO,
  ReservasPorMesDTO
} from '../../../../service/reportes-ventas.service';

export interface VentaResumen {
  nombre:   string;
  cantidad: number;
  total:    number;
}
// Paso 1: Define tipo literal para evitar errores de tipo
// type TipoReporte = 'productos' | 'salones' | 'habitaciones' | 'clientes' | 'metodos-pago';

type TipoResumen  = 'productos'|'salones'|'habitaciones'|'clientes'|'metodos-pago';
type TipoReservas = 'reservas-habitaciones'|'reservas-salones';
type TipoReporte  = TipoResumen | TipoReservas;

@Component({
  selector: 'app-consulta-ventas',
    standalone: false,
  templateUrl: './consulta-ventas.component.html',
  styleUrls: ['./consulta-ventas.component.css']
})
export class ConsultaVentasComponent implements OnInit, AfterViewInit {
  filtroForm: FormGroup;
  filtroEjecutado = false;
  public currentTipo!: TipoReporte;

  tiposReporte = [
    { value: 'productos',             label: 'Productos Más Vendidos'        },
    { value: 'salones',               label: 'Salones Más Vendidos'          },
    { value: 'habitaciones',          label: 'Habitaciones Más Vendidas'     },
    { value: 'clientes',              label: 'Clientes Más Frecuentes'       },
    { value: 'metodos-pago',          label: 'Métodos de Pago Más Usados'    },
    { value: 'reservas-habitaciones', label: 'Reservas Habitaciones por Mes' },
    { value: 'reservas-salones',      label: 'Reservas Salones por Mes'      }
  ];

  ventasReporte: VentaResumen[] = [];

  // Chart.js
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
  barChartLabels: string[] = [];
  barChartData: any      = { labels: [], datasets: [] };

  // Angular Material table
  displayedColumns: string[]       = ['nombre','cantidad','total'];
  dataSource = new MatTableDataSource<VentaResumen>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;
  columnaNombreEtiqueta = 'Nombre';

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
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  generarReporte(): void {
    if (this.filtroForm.invalid) return;
    this.filtroEjecutado = false;

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
        break;
    }
  }

  private procesarResumen(data: VentaResumen[]) {
    this.ventasReporte = data;
    this.armarTablaYGrafico();
    this.filtroEjecutado = true;
  }

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
  }

  applyFilter(event: Event) {
    const v = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = v;
  }

  top1(): VentaResumen | null {
    return this.ventasReporte.length
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
  }

  descargarExcelResumen() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
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
  }

  // ----------- Descarga Detallado -----------
  // descargarPDFDetallado() {
  //   const { fechaDesde, fechaHasta } = this.filtroForm.value;
  //   const desde = (fechaDesde as Date).toISOString().substring(0, 10);
  //   const hasta = (fechaHasta as Date).toISOString().substring(0, 10);
  //   let obs: Observable<Blob>;
  //   if (this.currentTipo === 'salones')
  //     obs = this.reportesService.descargarPdfSalonesDetallado(desde, hasta);
  //   else if (this.currentTipo === 'habitaciones')
  //     obs = this.reportesService.descargarPdfHabitacionesDetallado(desde, hasta);
  //   else if (this.currentTipo === 'metodos-pago')
  //     obs = this.reportesService.descargarPdfMetodosPagoDetallado(desde, hasta);
  //   else return;
  //   obs.subscribe(blob => this.descargarBlob(blob, `${this.currentTipo}_detallado.pdf`));
  // }

  // descargarExcelDetallado() {
  //   const { fechaDesde, fechaHasta } = this.filtroForm.value;
  //   const desde = (fechaDesde as Date).toISOString().substring(0, 10);
  //   const hasta = (fechaHasta as Date).toISOString().substring(0, 10);
  //   let obs: Observable<Blob>;
  //   if (this.currentTipo === 'salones')
  //     obs = this.reportesService.descargarExcelSalonesDetallado(desde, hasta);
  //   else if (this.currentTipo === 'habitaciones')
  //     obs = this.reportesService.descargarExcelHabitacionesDetallado(desde, hasta);
  //   else if (this.currentTipo === 'metodos-pago')
  //     obs = this.reportesService.descargarExcelMetodosPagoDetallado(desde, hasta);
  //   else return;
  //   obs.subscribe(blob => this.descargarBlob(blob, `${this.currentTipo}_detallado.xlsx`));
  // }

  // private descargarBlob(blob: Blob, filename: string) {
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = filename;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(url);
  // }
}