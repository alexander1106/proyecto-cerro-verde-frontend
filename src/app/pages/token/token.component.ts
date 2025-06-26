import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrl: './token.component.css',
  standalone: true,
  imports: [
    FormsModule  // 👈 Aquí lo agregas
  ],
})
export class TokenComponent {
  usuario: any = {
    username: '',
    password: '',
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    perfil: '',
    enable: true,
    rol: {
      id: 1
    }
  };

  token: string | null = null;
  error: string | null = null;

  constructor(private authService: AuthService) {}

  registrar() {
    this.authService.registrarConToken(this.usuario).subscribe({
      next: (token: string) => {
        this.token = token;
        this.error = null;
        console.log('Token recibido:', token);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al registrar o generar el token';
        this.token = null;
      }
    });
  }
}
