import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import {
  CajaReporteService,
  CajaResumenDTO,
} from '../../../../service/caja-reporte.service';

export interface CajaRow {
  nombre: string;
  total: number;
}

type TipoTransaccion = 'ingresos' | 'egresos' | 'todos';

@Component({
  selector: 'app-caja-reporte',
  standalone: false,
  templateUrl: './caja-reporte.component.html',
  styleUrls: ['./caja-reporte.component.css']
})
export class CajaReporteComponent implements OnInit, AfterViewInit {
  filtroForm: FormGroup;
  cargando = false;

  displayedColumns = ['nombre', 'total'];
  dataSource = new MatTableDataSource<CajaRow>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Configuración de Pie Chart
  pieChartOptions = { responsive: true };
  pieChartData: { labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] } = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };

  // Configuración de Bar Chart
  barChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };
  barChartData: { labels: string[]; datasets: { label: string; data: number[]; backgroundColor: string[] }[] } = {
    labels: [],
    datasets: []
  };

  tiposTransaccion = [
    { value: 'ingresos', label: 'Ingresos' },
    { value: 'egresos', label: 'Egresos' },
    { value: 'todos', label: 'Ambos' }
  ];

  constructor(
    private fb: FormBuilder,
    private cajaService: CajaReporteService
  ) {
    this.filtroForm = this.fb.group({
      fechaDesde: [null, Validators.required],
      fechaHasta: [null, Validators.required],
      transaccion: ['todos', Validators.required]
    });
    this.filtroForm.valueChanges.subscribe(() => this.cargando = false);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  generarReporte(): void {
    if (this.filtroForm.invalid) return;
    this.cargando = true;

    const desde = (this.filtroForm.value.fechaDesde as Date).toISOString().slice(0, 10);
    const hasta = (this.filtroForm.value.fechaHasta as Date).toISOString().slice(0, 10);
    const trans = this.filtroForm.value.transaccion as TipoTransaccion;
    const tipos = trans === 'todos'
      ? ['Ingreso', 'Egreso']
      : [trans === 'ingresos' ? 'Ingreso' : 'Egreso'];

    this.cajaService.obtenerResumenCaja(desde, hasta, tipos).subscribe({
      next: data => {
        const rows = data.map(d => ({ nombre: d.tipo, total: d.total }));
        this.procesarTabla(rows);
        this.procesarPie(data);
        this.procesarBarra(data);
        this.cargando = false;
      },
      error: err => {
        console.error('Resumen Caja error', err);
        this.cargando = false;
      }
    });
  }

  private procesarTabla(rows: CajaRow[]) {
    this.dataSource.data = rows;
  }

  private procesarPie(data: CajaResumenDTO[]) {
  const labels = data.map(d => d.tipo.trim());
  const values = data.map(d => d.total);
  const colors = data.map(d => {
    const t = d.tipo.trim().toLowerCase();
    if (t === 'egreso')  return 'rgba(162, 23, 53, 0.8)';   // rojo
    if (t === 'ingreso') return 'rgba(29, 65, 149, 0.8)';   // azul
    return 'rgba(201,203,207,0.8)';                       // opcional
  });

  this.pieChartData = { labels, datasets: [{ data: values, backgroundColor: colors }] };
}

private procesarBarra(data: CajaResumenDTO[]) {
  const labels = data.map(d => d.tipo.trim());
  const values = data.map(d => d.total);
  const colors = data.map(d => {
    const t = d.tipo.trim().toLowerCase();
    if (t === 'egreso')  return 'rgba(162, 23, 53, 0.8)';   // rojo
    if (t === 'ingreso') return 'rgba(29, 65, 149, 0.8)';   // azul
    return 'rgba(201,203,207,0.8)';                       // opcional
  });

  this.barChartData = {
    labels,
    datasets: [{ label: 'Total', data: values, backgroundColor: colors }]
  };
}


  descargarPDF(): void {
    const { fechaDesde, fechaHasta, transaccion } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().slice(0, 10);
    const hasta = (fechaHasta as Date).toISOString().slice(0, 10);
    const tipos = transaccion === 'todos'
      ? ['Ingreso', 'Egreso']
      : [transaccion === 'ingresos' ? 'Ingreso' : 'Egreso'];

    this.cajaService.descargarPdfResumenCaja(desde, hasta, tipos)
      .subscribe(blob => this.downloadBlob(blob, 'caja_resumen.pdf'));
  }

  descargarExcel(): void {
    const { fechaDesde, fechaHasta, transaccion } = this.filtroForm.value;
    const desde = (fechaDesde as Date).toISOString().slice(0, 10);
    const hasta = (fechaHasta as Date).toISOString().slice(0, 10);
    const tipos = transaccion === 'todos'
      ? ['Ingreso', 'Egreso']
      : [transaccion === 'ingresos' ? 'Ingreso' : 'Egreso'];

    this.cajaService.descargarExcelResumenCaja(desde, hasta, tipos)
      .subscribe(blob => this.downloadBlob(blob, 'caja_resumen.xlsx'));
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
