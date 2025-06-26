import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private key = 'notificaciones';

  agregar(mensaje: string) {
    const actual = this.obtener();
    const nueva = { mensaje, fecha: new Date().toISOString() };
    localStorage.setItem(this.key, JSON.stringify([nueva, ...actual]));
  }

  obtener(): { mensaje: string, fecha: string }[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  cantidad(): number {
    return this.obtener().length;
  }

  limpiar() {
    localStorage.removeItem(this.key);
  }
}
