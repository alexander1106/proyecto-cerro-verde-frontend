import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ia',
  standalone: false,
  templateUrl: './ia.component.html',
  styleUrl: './ia.component.css',
})
export class IaComponent {
  fecha: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  resultado: any;
  resultadoRango: any[] = [];

  // Datos del gráfico
  chartLabels: string[] = [];
  chartData: number[] = [];
  chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Reservas Estimadas por Fecha'
      }
    }
  };

  constructor(private http: HttpClient) {}

  consultar() {
    const body = { fecha: this.fecha };

    this.http.post<any>('http://localhost:8000/predecir', body)
      .subscribe(data => {
        // Reducir 40% y redondear
        data.reservas_estimadas = Math.round(data.reservas_estimadas * 0.6);
        this.resultado = data;
      });
  }

  consultarRango() {
    const body = {
      fecha_inicio: this.fechaInicio,
      fecha_fin: this.fechaFin
    };

    this.http.post<any>('http://localhost:8000/predecir_rango', body)
      .subscribe(data => {
        // Reducir 50% y redondear cada elemento
        this.resultadoRango = data.resultados.map((r: { reservas_estimadas: number; }) => ({
          ...r,
          reservas_estimadas: Math.round(r.reservas_estimadas * 0.5)
        }));

        // Preparar datos del gráfico
        this.chartLabels = this.resultadoRango.map(r => r.fecha);
        this.chartData = this.resultadoRango.map(r => r.reservas_estimadas);
      });
  }
}
