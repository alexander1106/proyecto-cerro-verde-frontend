import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '../../service/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-confirmar-password',
  standalone: false,
  templateUrl: './confirmar-password.component.html',
  styleUrl: './confirmar-password.component.css'
})
export class ConfirmarPasswordComponent implements  OnInit {
  nuevaClave: string = '';
  confirmarClave: string = '';
  token: string = '';
  hide:any=true;

  constructor(private route: ActivatedRoute, private resetPasswordService: LoginService, private router:Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  formSubmit(): void {
    if (this.nuevaClave !== this.confirmarClave) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }

    this.resetPasswordService.resetPassword(this.token, this.nuevaClave)
      .subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'La contraseña ha sido actualizada con éxito',
            confirmButtonText: 'Ir al login',
          }).then(() => {
            this.router.navigate(['/login']); // Cambia '/login' por la ruta que corresponda
          });
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error || 'Error al actualizar la contraseña',
          });
        }
      });
  }
}
