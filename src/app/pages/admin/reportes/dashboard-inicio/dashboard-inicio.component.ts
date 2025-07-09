// src/app/modules/dashboard-inicio/dashboard-inicio.component.ts

import { Component, OnInit } from '@angular/core';
import {
  DashboardInicioService,
  Kpis,
  MesTotal,
  ProductoCantidad
} from '../../../../service/dashboard-inicio.service';

@Component({
  selector: 'app-dashboard-inicio',
  standalone: false,
  templateUrl: './dashboard-inicio.component.html',
  styleUrls: ['./dashboard-inicio.component.css']
})
export class DashboardInicioComponent implements OnInit {
  // Ahora Kpis incluye ingresosHoy, egresosHoy, reservasHoy y salonesHoy
  kpis!: Kpis;

  habitacionesPorMes: MesTotal[]       = [];
  salonesPorMes:     MesTotal[]       = [];
  topProductos:      ProductoCantidad[] = [];

  habChartData: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string[] }[];
  } = { labels: [], datasets: [] };

  salonChartData: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string[] }[];
  } = { labels: [], datasets: [] };

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          boxWidth: 0    // quita el cuadrito de color de la leyenda
        }
      }
    }
  };

  private monthMap: Record<string, string> = {
    January:   'Enero',
    February:  'Febrero',
    March:     'Marzo',
    April:     'Abril',
    May:       'Mayo',
    June:      'Junio',
    July:      'Julio',
    August:    'Agosto',
    September: 'Septiembre',
    October:   'Octubre',
    November:  'Noviembre',
    December:  'Diciembre'
  };

  private colorPalette = [
    'rgba(75,192,192,0.6)',
    'rgba(255,159,64,0.6)',
    'rgba(54,162,235,0.6)',
    'rgba(255,99,132,0.6)',
    'rgba(153,102,255,0.6)',
    'rgba(255,206,86,0.6)'
  ];

  constructor(private ds: DashboardInicioService) {}

  ngOnInit(): void {
    const anio = new Date().getFullYear();

    this.ds.loadAll(anio).subscribe(result => {
      // Asignamos todos los KPIs: ingresosHoy, egresosHoy, reservasHoy y salonesHoy
      this.kpis = result.kpis;

      // Habitaciones por mes
      this.habitacionesPorMes = result.habitaciones;
      this.habChartData = {
        labels: result.habitaciones.map(m => this.monthMap[m.mes] || m.mes),
        datasets: [{
          label: 'Reservas Habitación',
          data:  result.habitaciones.map(m => m.total),
          backgroundColor: result.habitaciones.map((_, i) =>
            this.colorPalette[i % this.colorPalette.length]
          )
        }]
      };

      // Salones por mes
      this.salonesPorMes = result.salones;
      this.salonChartData = {
        labels: result.salones.map(m => this.monthMap[m.mes] || m.mes),
        datasets: [{
          label: 'Reservas Salón',
          data:  result.salones.map(m => m.total),
          backgroundColor: result.salones.map((_, i) =>
            this.colorPalette[i % this.colorPalette.length]
          )
        }]
      };

      // Top 5 productos
      this.topProductos = result.topProd;
    });
  }
}
