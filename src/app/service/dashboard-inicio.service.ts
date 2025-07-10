// src/app/services/dashboard-inicio.service.ts

import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  CajaReporteService,
  CajaResumenDTO
} from './caja-reporte.service';

import {
  ReportesVentasService,
  ProductoVentasDTO
} from './reportes-ventas.service';

export interface Kpis {
  ingresosHoy: number;
  egresosHoy: number;
  reservasHoy: number;    // ← Habitaciones hoy
  salonesHoy: number;     // ← Salones hoy
}

export interface MesTotal {
  mes: string;
  total: number;
}

export interface ProductoCantidad {
  producto: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardInicioService {
  constructor(
    private cajaSvc: CajaReporteService,
    private ventasSvc: ReportesVentasService
  ) {}

  /** Helper para formatear fecha a YYYY-MM-DD */
  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  /**
   * 1. KPIs de hoy: ingresos, egresos, reservas de habitaciones y salones
   */
  getKpisHoy(): Observable<Kpis> {
    const hoy = this.formatDate(new Date());

    // 1a) ingresos / egresos
    const ingresoEgreso$ = this.cajaSvc
      .obtenerResumenCaja(hoy, hoy, ['Ingreso', 'Egreso'])
      .pipe(
        map((arr: CajaResumenDTO[]) => {
          const ingresos = arr.find(d => d.tipo.toLowerCase() === 'ingreso')?.total ?? 0;
          const egresos  = arr.find(d => d.tipo.toLowerCase() === 'egreso')?.total  ?? 0;
          return { ingresos, egresos };
        })
      );

    // 1b) reservas de habitaciones hoy (nuevo endpoint)
    const reservasHoy$ = this.ventasSvc
      .getReservasHoyHabitaciones();   // devuelve Observable<number>

    // 1c) reservas de salones hoy (nuevo endpoint)
    const salonesHoy$ = this.ventasSvc
      .getReservasHoySalones();        // devuelve Observable<number>

    // fusionamos TODO
    return forkJoin({
      ie: ingresoEgreso$,
      rh: reservasHoy$,
      sh: salonesHoy$
    }).pipe(
      map(({ ie, rh, sh }) => ({
        ingresosHoy: ie.ingresos,
        egresosHoy:  ie.egresos,
        reservasHoy: rh,
        salonesHoy:  sh
      })),
      catchError(err => {
        console.error('[DashboardInicio] getKpisHoy error', err);
        return of({ ingresosHoy: 0, egresosHoy: 0, reservasHoy: 0, salonesHoy: 0 });
      })
    );
  }

  /** 2. Reservas de habitaciones por mes (todo el año) */
  getHabitacionesPorMes(anio: number): Observable<MesTotal[]> {
    const desde = `${anio}-01-01`;
    const hasta = `${anio}-12-31`;
    return this.ventasSvc
      .getReservasPorMes('habitaciones', desde, hasta)
      .pipe(
        map(arr => arr.map(d => ({ mes: d.mes, total: d.cantidad })))
      );
  }

  /** 3. Reservas de salones por mes (todo el año) */
  getSalonesPorMes(anio: number): Observable<MesTotal[]> {
    const desde = `${anio}-01-01`;
    const hasta = `${anio}-12-31`;
    return this.ventasSvc
      .getReservasPorMes('salones', desde, hasta)
      .pipe(
        map(arr => arr.map(d => ({ mes: d.mes, total: d.cantidad })))
      );
  }

  /** 4. Top 5 productos más vendidos en el año */
  getTopProductos(anio: number): Observable<ProductoCantidad[]> {
    const desde = `${anio}-01-01`;
    const hasta = `${anio}-12-31`;
    return this.ventasSvc
      .getProductosMasVendidos(desde, hasta)
      .pipe(
        map(arr =>
          arr
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
            .slice(0, 5)
            .map(d => ({ producto: d.productoNombre, cantidad: d.cantidadVendida }))
        )
      );
  }

  /** Carga todo en paralelo */
  loadAll(anio: number) {
    return forkJoin({
      kpis:         this.getKpisHoy(),
      habitaciones: this.getHabitacionesPorMes(anio),
      salones:      this.getSalonesPorMes(anio),
      topProd:      this.getTopProductos(anio),
    });
  }
}
