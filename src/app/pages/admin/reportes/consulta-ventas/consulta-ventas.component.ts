
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
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';

import {
  ReportesVentasService,
  ProductoVentasDTO,
  ClienteFrecuenteDTO,
  HabitacionVentasDTO,
  SalonVentasDTO,
  PagoVentasDTO,
  SalonVentasDetalladoDTO,
  HabitacionVentasDetalladoDTO,
  PagoVentasDetalladoDTO
} from '../../../../service/reportes-ventas.service';

export interface VentaResumen {
  nombre: string;
  cantidad: number;
  total: number;
}
// Paso 1: Define tipo literal para evitar errores de tipo
type TipoReporte = 'productos' | 'salones' | 'habitaciones' | 'clientes' | 'metodos-pago';

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
    { value: 'productos',    label: 'Productos Más Vendidos'    },
    { value: 'salones',      label: 'Salones Más Vendidos'      },
    { value: 'habitaciones', label: 'Habitaciones Más Vendidas' },
    { value: 'clientes',     label: 'Clientes Más Frecuentes'   },
    { value: 'metodos-pago', label: 'Métodos de Pago Más Usados'}
  ];

  ventasReporte: VentaResumen[] = [];

  // Chart.js
  barChartOptions = { responsive: true };
  barChartLabels: string[] = [];
  barChartData: any = { labels: [], datasets: [] };

  // Angular Material Table
  displayedColumns: string[] = ['nombre', 'cantidad', 'total'];
  dataSource = new MatTableDataSource<VentaResumen>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;
  columnaNombreEtiqueta = 'Nombre';

  // Mapa de etiquetas tipado para evitar error TS7053
  private readonly etiquetaPorTipo: Record<TipoReporte, string> = {
    'productos':     'Producto',
    'salones':       'Salón',
    'habitaciones':  'Habitación',
    'clientes':      'Cliente',
    'metodos-pago':  'Método de Pago'
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
    this.dataSource.sort = this.sort;
  }

  generarReporte(): void {
    if (this.filtroForm.invalid) return;
    this.filtroEjecutado = false;
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
        break;
    }
  }

  private procesarResumen(data: VentaResumen[]) {
    this.ventasReporte = data;
    this.armarTablaYGrafico();
    this.filtroEjecutado = true;
  }

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
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  top1(): VentaResumen | null {
    return this.ventasReporte.length
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
  }

  descargarExcelResumen() {
    const { fechaDesde, fechaHasta } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().substring(0, 10);
    const hasta = (fechaHasta as Date).toISOString().substring(0, 10);
    this.reportesService.descargarExcelResumen(this.currentTipo, desde, hasta)
      .subscribe(blob => this.descargarBlob(blob, `reporte_${this.currentTipo}.xlsx`));
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