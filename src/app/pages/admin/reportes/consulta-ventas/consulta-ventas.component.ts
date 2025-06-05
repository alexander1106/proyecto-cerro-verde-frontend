// src/app/components/consulta-ventas/consulta-ventas.component.ts

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

@Component({
  selector: 'app-consulta-ventas',
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
    { value: 'productos',    label: 'Productos Más Vendidos'    },
    { value: 'salones',      label: 'Salones Más Vendidos'      },
    { value: 'habitaciones', label: 'Habitaciones Más Vendidas' },
    { value: 'clientes',     label: 'Clientes Más Frecuentes'   },
    { value: 'metodos-pago', label: 'Métodos de Pago Más Usados'}
  ];

  ventasReporte: VentaResumen[] = [];

  // — Gráfica de barras (Chart.js)
  barChartOptions = { responsive: true };
  barChartLabels: string[] = [];
  barChartData: any = { labels: [], datasets: [] };

  // — Tabla Material
  displayedColumns: string[] = ['nombre', 'cantidad', 'total'];
  dataSource = new MatTableDataSource<VentaResumen>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  columnaNombreEtiqueta = 'Nombre';

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

  ngOnInit(): void {
    // Nada especial al iniciar
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  generarReporte(): void {
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
        this.currentTipo = 'productos';
        this.columnaNombreEtiqueta = 'Producto';
        this.llamarServicioProductos(desde, hasta);
        break;
      case 'salones':
        this.currentTipo = 'salones';
        this.columnaNombreEtiqueta = 'Salón';
        this.llamarServicioSalones(desde, hasta);
        break;
      case 'habitaciones':
        this.currentTipo = 'habitaciones';
        this.columnaNombreEtiqueta = 'Habitación';
        this.llamarServicioHabitaciones(desde, hasta);
        break;
      case 'clientes':
        this.currentTipo = 'clientes';
        this.columnaNombreEtiqueta = 'Cliente';
        this.llamarServicioClientes(desde, hasta);
        break;
      case 'metodos-pago':
        this.currentTipo = 'metodos-pago';
        this.columnaNombreEtiqueta = 'Método de Pago';
        this.llamarServicioMetodosPago(desde, hasta);
        break;
      default:
        console.error('Tipo de reporte inválido:', tipo);
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
    // Actualizo la tabla Material con todos los registros de ventasReporte
    this.dataSource.data = this.ventasReporte;

    // Selecciono el top 5 por cantidad para la gráfica
    const topCinco = [...this.ventasReporte]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

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

  /** Filtrar tabla */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Devuelve el top 1 (para el KPI) */
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
