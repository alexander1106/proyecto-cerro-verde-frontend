// src/app/services/dashboard-inicio.service.ts

import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  CajaReporteService,
  CajaResumenDTO
} from './caja-reporte.service';

import {
  ReportesVentasService,
  ReservasPorMesDTO,
  ProductoVentasDTO
} from './reportes-ventas.service';

export interface Kpis {
  ingresosHoy: number;
  egresosHoy: number;
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

  /** 1. KPIs de hoy a partir de tu resumen de caja */
  getKpisHoy(): Observable<Kpis> {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const fechaStr = `${y}-${m}-${d}`;

  return this.cajaSvc
    .obtenerResumenCaja(fechaStr, fechaStr, ['Ingreso','Egreso'])
    .pipe(
      map((arr: CajaResumenDTO[]) => {
        // Comparamos en minúsculas para que matchee "INGRESO", "Ingreso" o "ingreso"
        const ingreso = arr.find(d =>
          d.tipo.toLowerCase() === 'ingreso'
        )?.total ?? 0;

        const egreso = arr.find(d =>
          d.tipo.toLowerCase() === 'egreso'
        )?.total  ?? 0;

        return { ingresosHoy: ingreso, egresosHoy: egreso };
      }),
      catchError(err => {
        console.error('[KPIs] fallo:', err);
        return of({ ingresosHoy:0, egresosHoy:0 });
      })
    );
}

  /** 2. Reservas de habitaciones por mes (todo el año) */
  getHabitacionesPorMes(anio: number): Observable<MesTotal[]> {
    const desde = `${anio}-01-01`;
    const hasta = `${anio}-12-31`;
    return this.ventasSvc.getReservasPorMes('habitaciones', desde, hasta).pipe(
      map((arr: ReservasPorMesDTO[]) =>
        arr.map(d => ({ mes: d.mes, total: d.cantidad }))
      )
    );
  }

  /** 3. Reservas de salones por mes (todo el año) */
  getSalonesPorMes(anio: number): Observable<MesTotal[]> {
    const desde = `${anio}-01-01`;
    const hasta = `${anio}-12-31`;
    return this.ventasSvc.getReservasPorMes('salones', desde, hasta).pipe(
      map((arr: ReservasPorMesDTO[]) =>
        arr.map(d => ({ mes: d.mes, total: d.cantidad }))
      )
    );
  }

  /** 4. Top 5 productos más vendidos en el año */
  getTopProductos(anio: number): Observable<ProductoCantidad[]> {
    const desde = `${anio}-01-01`;
    const hasta = `${anio}-12-31`;
    return this.ventasSvc.getProductosMasVendidos(desde, hasta).pipe(
      map((arr: ProductoVentasDTO[]) =>
        arr
          .sort((a,b) => b.cantidadVendida - a.cantidadVendida)
          .slice(0, 5)
          .map(d => ({ producto: d.productoNombre, cantidad: d.cantidadVendida }))
      )
    );
  }


  /** Carga todo en paralelo */
  loadAll(anio: number) {
    return forkJoin({
      kpis:        this.getKpisHoy(),
      habitaciones: this.getHabitacionesPorMes(anio),
      salones:      this.getSalonesPorMes(anio),
      topProd:      this.getTopProductos(anio),
        });
  }
}
