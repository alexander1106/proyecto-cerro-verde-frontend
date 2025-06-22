import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators }  from '@angular/forms';
import { MatTableDataSource }                  from '@angular/material/table';
import { MatPaginator }                        from '@angular/material/paginator';
import { MatSort }                             from '@angular/material/sort';
import { ChartData, ChartOptions }             from 'chart.js';
import { saveAs }                              from 'file-saver';

import {
  ReportesComprasService,
  ProductoReporte,
  ProveedorReporte
} from '../../../../service/reportes-compras.service';

type ReportType = 'PRODUCTOS' | 'PROVEEDORES';

@Component({
  selector: 'app-reportes-compras',
  standalone: false,
  templateUrl: './reportes-compras.component.html',
  styleUrls: ['./reportes-compras.component.css']
  
})
export class ReportesComprasComponent implements OnInit {
  reportForm!: FormGroup;
  submitted = false;

  // Datos generados (productos o proveedores)
  datosReporte: (ProductoReporte | ProveedorReporte)[] = [];

  // Tabla
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  // Chart.js
  barChartOptions: ChartOptions = { responsive: true };
  barChartData: ChartData<'bar', number[], string> = { labels: [], datasets: [] };

  constructor(
    private fb: FormBuilder,
    private service: ReportesComprasService
  ) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reportType: ['PRODUCTOS', Validators.required],
      desde:       [null, Validators.required],
      hasta:       [null, Validators.required],
      stockFilter: [null]
    });
  }

  isProductos(): boolean {
    return this.reportForm.value.reportType === 'PRODUCTOS';
  }

  isProveedores(): boolean {
    return this.reportForm.value.reportType === 'PROVEEDORES';
  }

  generarReporte(): void {
    this.submitted = true;
    if (this.reportForm.invalid) return;

    const { reportType, desde, hasta, stockFilter } = this.reportForm.value;
    const sDesde = desde.toISOString().slice(0,10);
    const sHasta = hasta.toISOString().slice(0,10);

    if (reportType === 'PRODUCTOS') {
      this.service.getProductosMasComprados(sDesde, sHasta, stockFilter)
        .subscribe(list => this.renderProductos(list));
    } else {
      this.service.getProveedoresMasComprados(sDesde, sHasta)
        .subscribe(list => this.renderProveedores(list));
    }
  }

  private renderProductos(list: ProductoReporte[]): void {
    this.datosReporte = list;
    this.displayedColumns = ['producto','cantidad','total'];
    this.dataSource.data = list;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort      = this.sort;
    });

    const top5 = [...list]
      .sort((a, b) => b.cantidadComprada - a.cantidadComprada)
      .slice(0, 5);
    const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
    this.barChartData = {
      labels: top5.map(x => x.productoNombre),
      datasets: [{
        data: top5.map(x => x.cantidadComprada),
        label: 'Unidades Compradas',
        backgroundColor: colores.slice(0, top5.length)
      }]
    };

  }

  private renderProveedores(list: ProveedorReporte[]): void {
    this.datosReporte = list;
    this.displayedColumns = ['proveedor','facturas','productos'];
    this.dataSource.data = list;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort      = this.sort;
    });

    const top5 = [...list]
      .sort((a, b) => b.cantidadFacturas - a.cantidadFacturas)
      .slice(0, 5);
    const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
    this.barChartData = {
      labels: top5.map(x => x.proveedorNombre),
      datasets: [{
        data: top5.map(x => x.cantidadFacturas),
        label: 'Facturas',
        backgroundColor: colores.slice(0, top5.length)
      }]
    };

  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  descargarPdf(): void {
    if (this.reportForm.invalid) return;
    const { reportType, desde, hasta, stockFilter } = this.reportForm.value;
    const sDesde = desde.toISOString().slice(0,10);
    const sHasta = hasta.toISOString().slice(0,10);

    let obs$;
    if (reportType === 'PRODUCTOS') {
      obs$ = this.service.getProductosPdf(sDesde, sHasta, stockFilter);
    } else {
      obs$ = this.service.getProveedoresPdf(sDesde, sHasta);
    }
    obs$.subscribe(blob => {
      const name = reportType === 'PRODUCTOS'
        ? `productos_${sDesde}_a_${sHasta}.pdf`
        : `proveedores_${sDesde}_a_${sHasta}.pdf`;
      saveAs(blob, name);
    });
  }

  descargarExcel(): void {
    if (this.reportForm.invalid) return;
    const { reportType, desde, hasta, stockFilter } = this.reportForm.value;
    const sDesde = desde.toISOString().slice(0,10);
    const sHasta = hasta.toISOString().slice(0,10);

    let obs$;
    if (reportType === 'PRODUCTOS') {
      obs$ = this.service.getProductosExcel(sDesde, sHasta, stockFilter);
    } else {
      obs$ = this.service.getProveedoresExcel(sDesde, sHasta);
    }
    obs$.subscribe(blob => {
      const name = reportType === 'PRODUCTOS'
        ? `productos_${sDesde}_a_${sHasta}.xlsx`
        : `proveedores_${sDesde}_a_${sHasta}.xlsx`;
      saveAs(blob, name);
    });
  }

  // —— MÉTODOS DE CÁLCULO DE KPIs —————————————————————————————————————
  totalUnidades(): number {
    if (!this.isProductos()) { return 0; }
    return (this.datosReporte as ProductoReporte[])
      .reduce((acc, x) => acc + x.cantidadComprada, 0);
  }

  totalGastado(): number {
    return this.datosReporte
      .reduce((acc: number, x: any) => acc + (x.totalGastado || 0), 0);
  }

  totalFacturas(): number {
    if (!this.isProveedores()) { return 0; }
    return (this.datosReporte as ProveedorReporte[])
      .reduce((acc, x) => acc + x.cantidadFacturas, 0);
  }
}