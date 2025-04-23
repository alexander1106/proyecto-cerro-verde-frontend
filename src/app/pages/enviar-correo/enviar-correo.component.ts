import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enviar-correo',
  standalone: false,
  templateUrl: './enviar-correo.component.html',
  styleUrl: './enviar-correo.component.css'
})
export class EnviarCorreoComponent implements OnInit {

  email: string = '';
  hide: boolean = true;

  constructor(
    private snack: MatSnackBar,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  formSubmit() {
    if (this.email.trim() === '' || this.email == null) {
      this.snack.open('El correo de usuario es requerido.', 'Aceptar', {
        duration: 3000
      });
      return;
    }
    this.loginService.enviarEmail(this.email).subscribe({
      next: (res: any) => {
        Swal.fire('¡Correo enviado!', res.mensaje, 'success');
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo enviar el correo', 'error');
        alert(this.email);
      }
    });}
}
