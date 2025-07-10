// src/app/modules/dashboard-inicio/dashboard-inicio.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

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
export class DashboardInicioComponent implements OnInit, OnDestroy {
  kpis!: Kpis;
  private kpisPollingSub!: Subscription;

  habitacionesPorMes: MesTotal[]        = [];
  salonesPorMes:     MesTotal[]        = [];
  topProductos:      ProductoCantidad[] = [];

  habChartData: { labels: string[]; datasets: any[] }   = { labels: [], datasets: [] };
  salonChartData: { labels: string[]; datasets: any[] } = { labels: [], datasets: [] };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { boxWidth: 0 }
      }
    }
  };

  private monthMap: Record<string, string> = {
    January: 'Enero',   February: 'Febrero', March: 'Marzo',
    April: 'Abril',     May: 'Mayo',         June: 'Junio',
    July: 'Julio',      August: 'Agosto',     September: 'Septiembre',
    October: 'Octubre', November: 'Noviembre', December: 'Diciembre'
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

    // 1) cargar gráficas y top productos una sola vez
    this.ds.loadAll(anio).subscribe(result => {
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

      this.topProductos = result.topProd;
    });

    // 2) polling de KPIs cada 15s (incluye reservasHoy y salonesHoy)
    this.kpisPollingSub = interval(15_000).pipe(
      startWith(0),
      switchMap(() => this.ds.getKpisHoy())
    ).subscribe({
      next: kpis => this.kpis = kpis,
      error: err => console.error('Error refrescando KPIs', err)
    });
  }

  ngOnDestroy(): void {
    this.kpisPollingSub?.unsubscribe();
  }
}
