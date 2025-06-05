// src/app/pages/admin/reportes/reportes-compras.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator }      from '@angular/material/paginator';
import { MatSort }           from '@angular/material/sort';
import { ChartData, ChartOptions } from 'chart.js';

import { saveAs } from 'file-saver';
import {
  ReportesComprasService,
  ProductoReporte,
  ProveedorReporte
} from '../../../../service/reportes-compras.service';

@Component({
  selector: 'app-reportes-compras',
  templateUrl: './reportes-compras.component.html',
  styleUrls: ['./reportes-compras.component.css'],
  standalone: false
})
export class ReportesComprasComponent implements OnInit {
  // —— Formularios Reactivos
  prodForm: FormGroup;
  provForm: FormGroup;
  prodSubmitted = false;
  provSubmitted = false;

  // —— Datos llenados desde el servicio HTTP
  productosReporte: ProductoReporte[] = [];
  proveedoresReporte: ProveedorReporte[] = [];

  // —— MatTableDataSource y Columnas para Productos
  prodDisplayedColumns: string[] = ['producto', 'cantidad', 'total'];
  prodDataSource = new MatTableDataSource<ProductoReporte>([]);
  @ViewChild('prodPaginator', { static: false }) prodPaginator!: MatPaginator;
  @ViewChild('prodSort',      { static: false }) prodSort!: MatSort;

  // —— MatTableDataSource y Columnas para Proveedores
  provDisplayedColumns: string[] = ['proveedor', 'facturas', 'totalGastado'];
  provDataSource = new MatTableDataSource<ProveedorReporte>([]);
  @ViewChild('provPaginator', { static: false }) provPaginator!: MatPaginator;
  @ViewChild('provSort',      { static: false }) provSort!: MatSort;

  // —— Chart.js Configuración para Productos
  barChartOptions: ChartOptions = {
    responsive: true
  };
  barChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: []
  };

  // —— Chart.js Configuración para Proveedores
  barChartOptionsProv: ChartOptions = {
    responsive: true
  };
  barChartDataProv: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: []
  };

  // —— Inyección de FormBuilder y el service HTTP real
  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesComprasService
  ) {
    // Inicializamos los formularios reactivos
    this.prodForm = this.fb.group({
      desde: [null, Validators.required],
      hasta: [null, Validators.required]
    });
    this.provForm = this.fb.group({
      desde: [null, Validators.required],
      hasta: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    
  }

  generarReporteProductos(): void {
    this.prodSubmitted = true;
    if (this.prodForm.invalid) {
      return;
    }

    const desdeFecha = this.prodForm.value.desde.toISOString().substring(0, 10);
    const hastaFecha = this.prodForm.value.hasta.toISOString().substring(0, 10);

    this.reportesService.getProductosMasComprados(desdeFecha, hastaFecha)
      .subscribe({
        next: (data: ProductoReporte[]) => {
          this.productosReporte = data;
          this.prodDataSource.data = this.productosReporte;

          setTimeout(() => {
            this.prodDataSource.paginator = this.prodPaginator;
            this.prodDataSource.sort      = this.prodSort;
          });

          const topCinco = [...this.productosReporte]
            .sort((a, b) => b.cantidadComprada - a.cantidadComprada)
            .slice(0, 5);

          const labels = topCinco.map(x => x.productoNombre);
          const dataValores = topCinco.map(x => x.cantidadComprada);

          this.barChartData = {
          labels: labels,
          datasets: [
            {
              data: dataValores,
              label: 'Unidades Compradas',
              backgroundColor: '#42A5F5' // Azul
            }
          ]
        };
        },
        error: (err: any) => {
          console.error('Error al obtener reporte de productos:', err);
        }
      });
  }

  applyProdFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.prodDataSource.filter = filterValue.trim().toLowerCase();
  }

  totalUnidades(): number {
    return this.productosReporte.reduce((acc, x) => acc + x.cantidadComprada, 0);
  }
  totalGastado(): number {
    return this.productosReporte.reduce((acc, x) => acc + x.totalGastado, 0);
  }
  productoTop(): ProductoReporte | null {
    if (!this.productosReporte.length) return null;
    return this.productosReporte.reduce((prev, curr) =>
      curr.cantidadComprada > prev.cantidadComprada ? curr : prev,
      this.productosReporte[0]
    );
  }


  generarReporteProveedores(): void {
    this.provSubmitted = true;
    if (this.provForm.invalid) {
      return;
    }

    const desdeFecha = this.provForm.value.desde.toISOString().substring(0, 10);
    const hastaFecha = this.provForm.value.hasta.toISOString().substring(0, 10);

    this.reportesService.getProveedoresMasComprados(desdeFecha, hastaFecha)
      .subscribe({
        next: (data: ProveedorReporte[]) => {
          this.proveedoresReporte = data;
          this.provDataSource.data = this.proveedoresReporte;

          setTimeout(() => {
            this.provDataSource.paginator = this.provPaginator;
            this.provDataSource.sort      = this.provSort;
          });

          // Generar gráfico de proveedores: Top 5 por cantidadFacturas
          const topCincoProv = [...this.proveedoresReporte]
            .sort((a, b) => b.cantidadFacturas - a.cantidadFacturas)
            .slice(0, 5);

          const labelsProv = topCincoProv.map(x => x.proveedorNombre);
          const dataFacturas = topCincoProv.map(x => x.cantidadFacturas);

          this.barChartDataProv = {
          labels: labelsProv,
          datasets: [
            {
              data: dataFacturas,
              label: 'Cant. Facturas',
              backgroundColor: '#FFA726' // Naranja
            }
          ]
        };
        },
        error: (err: any) => {
          console.error('Error al obtener reporte de proveedores:', err);
        }
      });
  }

  // —— FILTRO en la tabla de Proveedores
  applyProvFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.provDataSource.filter = filterValue.trim().toLowerCase();
  }

  // —— KPI de Proveedores
  totalFacturas(): number {
    return this.proveedoresReporte.reduce((acc, x) => acc + x.cantidadFacturas, 0);
  }
  totalGastadoProv(): number {
    return this.proveedoresReporte.reduce((acc, x) => acc + x.totalGastado, 0);
  }
  proveedorTop(): ProveedorReporte | null {
    if (!this.proveedoresReporte.length) return null;
    return this.proveedoresReporte.reduce((prev, curr) =>
      curr.cantidadFacturas > prev.cantidadFacturas ? curr : prev,
      this.proveedoresReporte[0]
    );
  }

  // —— NUEVOS MÉTODOS DE DESCARGA ————————————————————————————————————————

  descargarPdfProductos(): void {
    if (this.prodForm.invalid) {
      return;
    }
    const desde = this.prodForm.value.desde.toISOString().substring(0, 10);
    const hasta = this.prodForm.value.hasta.toISOString().substring(0, 10);

    this.reportesService.getProductosPdf(desde, hasta).subscribe({
      next: (blob: Blob) => {
        const filename = `productos_reporte_${desde}_a_${hasta}.pdf`;
        saveAs(blob, filename);
      },
      error: (err) => {
        console.error('Error al descargar PDF de productos:', err);
      }
    });
  }

  descargarExcelProductos(): void {
    if (this.prodForm.invalid) {
      return;
    }
    const desde = this.prodForm.value.desde.toISOString().substring(0, 10);
    const hasta = this.prodForm.value.hasta.toISOString().substring(0, 10);

    this.reportesService.getProductosExcel(desde, hasta).subscribe({
      next: (blob: Blob) => {
        const filename = `productos_reporte_${desde}_a_${hasta}.xlsx`;
        saveAs(blob, filename);
      },
      error: (err) => {
        console.error('Error al descargar Excel de productos:', err);
      }
    });
  }

  descargarPdfProveedores(): void {
    if (this.provForm.invalid) {
      return;
    }
    const desde = this.provForm.value.desde.toISOString().substring(0, 10);
    const hasta = this.provForm.value.hasta.toISOString().substring(0, 10);

    this.reportesService.getProveedoresPdf(desde, hasta).subscribe({
      next: (blob: Blob) => {
        const filename = `proveedores_reporte_${desde}_a_${hasta}.pdf`;
        saveAs(blob, filename);
      },
      error: (err) => {
        console.error('Error al descargar PDF de proveedores:', err);
      }
    });
  }

  descargarExcelProveedores(): void {
    if (this.provForm.invalid) {
      return;
    }
    const desde = this.provForm.value.desde.toISOString().substring(0, 10);
    const hasta = this.provForm.value.hasta.toISOString().substring(0, 10);

    this.reportesService.getProveedoresExcel(desde, hasta).subscribe({
      next: (blob: Blob) => {
        const filename = `proveedores_reporte_${desde}_a_${hasta}.xlsx`;
        saveAs(blob, filename);
      },
      error: (err) => {
        console.error('Error al descargar Excel de proveedores:', err);
      }
    });
  }
}
