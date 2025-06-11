
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator }       from '@angular/material/paginator';
import { MatSort }            from '@angular/material/sort';

import {
  ReportesVentasService,
  ProductoVentasDTO,
  ClienteFrecuenteDTO,
  HabitacionVentasDTO,
  SalonVentasDTO,
  PagoVentasDTO
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
  styleUrls: ['./consulta-ventas.component.css'],
  standalone: false
})
export class ConsultaVentasComponent implements OnInit, AfterViewInit {
  filtroForm: FormGroup;
  filtroEjecutado = false;

  // Aquí asignamos un par de colores (background, border) para cada tipo:
  private coloresPorTipo: { [key: string]: { background: string; border: string } } = {
    'productos':     { background: 'rgba(189, 39, 71, 0.6)',   border: 'rgba(255, 99, 132, 1)'   }, // rojo
    'salones':       { background: 'rgba(54, 162, 235, 0.6)',   border: 'rgba(54, 162, 235, 1)'   }, // azul
    'habitaciones':  { background: 'rgba(255, 206, 86, 0.6)',   border: 'rgba(255, 206, 86, 1)'   }, // amarillo
    'clientes':      { background: 'rgba(75, 192, 192, 0.6)',   border: 'rgba(75, 192, 192, 1)'   }, // verde agua
    'metodos-pago':  { background: 'rgba(100, 66, 168, 0.6)',  border: 'rgba(153, 102, 255, 1)'  }  // morado
  };

  // Guardará el tipo de reporte que se acaba de pedir (productos, salones, etc.)
  private currentTipo!: 'productos' | 'salones' | 'habitaciones' | 'clientes' | 'metodos-pago';

  tiposReporte = [
    { value: 'productos', label: 'Productos Más Vendidos' },
    { value: 'salones', label: 'Salones Más Vendidos' },
    { value: 'habitaciones', label: 'Habitaciones Más Vendidas' },
    { value: 'clientes', label: 'Clientes Más Frecuentes' },
    { value: 'metodos-pago', label: 'Métodos de Pago Más Usados' },
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
      fechaDesde: [null, Validators.required],
      fechaHasta: [null, Validators.required],
      tipoReporte: [null, Validators.required],
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
    this.ventasReporte = [];
    this.barChartLabels = [];
    this.barChartData = { labels: [], datasets: [] };
    this.dataSource.data = [];

    if (this.filtroForm.invalid) {
      return;
    }

    const desde = (this.filtroForm.value.fechaDesde as Date)
      .toISOString().substring(0, 10);
    const hasta = (this.filtroForm.value.fechaHasta as Date)
      .toISOString().substring(0, 10);
    const tipo = this.filtroForm.value.tipoReporte as string;

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

  private llamarServicioProductos(desde: string, hasta: string) {
    this.reportesService.getProductosMasVendidos(desde, hasta).subscribe({
      next: (data: ProductoVentasDTO[]) => {
        this.ventasReporte = data.map(dto => ({
          nombre: dto.productoNombre,
          cantidad: dto.cantidadVendida,
          total: dto.totalVendido
        }));
        this.armarTablaYGrafico();
      },
      error: (err: any) => {
        console.error('Error al obtener productos:', err);
        this.filtroEjecutado = true;
      }
    });
  }

  private llamarServicioSalones(desde: string, hasta: string) {
    this.reportesService.getSalonesMasVendidos(desde, hasta).subscribe({
      next: (data: SalonVentasDTO[]) => {
        this.ventasReporte = data.map(dto => ({
          nombre: dto.salonNombre,
          cantidad: dto.vecesAlquilado,
          total: dto.totalRecaudado
        }));
        this.armarTablaYGrafico();
      },
      error: (err: any) => {
        console.error('Error al obtener salones:', err);
        this.filtroEjecutado = true;
      }
    });
  }

  private llamarServicioHabitaciones(desde: string, hasta: string) {
    this.reportesService.getHabitacionesMasVendidas(desde, hasta).subscribe({
      next: (data: HabitacionVentasDTO[]) => {
        this.ventasReporte = data.map(dto => ({
          nombre: dto.habitacionNumero,
          cantidad: dto.vecesVendida,
          total: dto.totalRecaudado
        }));
        this.armarTablaYGrafico();
      },
      error: (err: any) => {
        console.error('Error al obtener habitaciones:', err);
        this.filtroEjecutado = true;
      }
    });
  }

  private llamarServicioClientes(desde: string, hasta: string) {
    this.reportesService.getClientesMasFrecuentes(desde, hasta).subscribe({
      next: (data: ClienteFrecuenteDTO[]) => {
        this.ventasReporte = data.map(dto => ({
          nombre: dto.clienteNombre,
          cantidad: dto.cantidadCompras,
          total: dto.totalGastado
        }));
        this.armarTablaYGrafico();
      },
      error: (err: any) => {
        console.error('Error al obtener clientes:', err);
        this.filtroEjecutado = true;
      }
    });
  }

  private llamarServicioMetodosPago(desde: string, hasta: string) {
    this.reportesService.getMetodosPagoMasUsados(desde, hasta).subscribe({
      next: (data: PagoVentasDTO[]) => {
        this.ventasReporte = data.map(dto => ({
          nombre: dto.metodoPago,
          cantidad: dto.vecesUsado,
          total: dto.totalRecibido
        }));
        this.armarTablaYGrafico();
      },
      error: (err: any) => {
        console.error('Error al obtener métodos de pago:', err);
        this.filtroEjecutado = true;
      }
    });
  }

  private armarTablaYGrafico() {
    this.dataSource.data = this.ventasReporte;
    const topCinco = [...this.ventasReporte]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
    const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

    this.barChartLabels = topCinco.map(x => x.nombre);
    const valores = topCinco.map(x => x.cantidad);

    // Obtengo los colores para este.currentTipo
    const colores = this.coloresPorTipo[this.currentTipo] || {
      background: 'rgba(100, 100, 100, 0.6)',
      border: 'rgba(100, 100, 100, 1)'
    };

    // Armo el barChartData incluyendo backgroundColor y borderColor
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: valores,
          label: 'Cantidad',
          backgroundColor: colores.background,
          borderColor: colores.border,
          borderWidth: 1
        }
      ]
    };

    this.filtroEjecutado = true;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  top1(): VentaResumen | null {
    if (!this.ventasReporte.length) return null;
    return this.ventasReporte.reduce((prev, curr) =>
      curr.cantidad > prev.cantidad ? curr : prev,
      this.ventasReporte[0]
    );
  }

  descargarPDF() {
    if (this.filtroForm.invalid) return;

    const desde = (this.filtroForm.value.fechaDesde as Date)
      .toISOString().substring(0, 10);
    const hasta = (this.filtroForm.value.fechaHasta as Date)
      .toISOString().substring(0, 10);

    const tipo = this.filtroForm.value
      .tipoReporte as 'productos' | 'clientes' | 'habitaciones' | 'salones' | 'metodos-pago';

    this.reportesService
      .descargarPdf(tipo, desde, hasta)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_${tipo}_${desde}_a_${hasta}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          console.error('Error al descargar PDF:', err);
        }
      });
  }

  descargarExcel() {
    if (this.filtroForm.invalid) return;

    const desde = (this.filtroForm.value.fechaDesde as Date)
      .toISOString().substring(0, 10);
    const hasta = (this.filtroForm.value.fechaHasta as Date)
      .toISOString().substring(0, 10);

    const tipo = this.filtroForm.value
      .tipoReporte as 'productos' | 'clientes' | 'habitaciones' | 'salones' | 'metodos-pago';

    this.reportesService
      .descargarExcel(tipo, desde, hasta)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_${tipo}_${desde}_a_${hasta}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          console.error('Error al descargar Excel:', err);
        }
      });
  }
}
