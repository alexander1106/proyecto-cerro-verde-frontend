
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginData={
    "username":"",
    "password":""
  }
hide: any= true;
mensajeError: string = '';

  constructor(private snack:MatSnackBar, private loginService:LoginService, private router:Router ){}

  ngOnInit(): void {
  }

  formSubmit(){

    if(this.loginData.username.trim()=='' || this.loginData.username.trim==null){
      this.snack.open("El nombre de usuario es requerido ||", "Aceptar",{
        duration:3000
      })
      return;
    }

    if(this.loginData.password.trim()=='' || this.loginData.password.trim==null){
      this.snack.open("La contraseña es requerida ||", "Aceptar",{
        duration:3000
      })
      return;
    }


    this.loginService.generarToken(this.loginData).subscribe(
      (data:any) => {
        console.log(data);
        this.loginService.loginUser(data.token);
        this.loginService.getCurrentUser().subscribe((user:any) => {
          this.loginService.setUser(user);
          console.log(user);


            this.router.navigate(['admin']);


          })
      },(error)=>{
        this.mensajeError = 'Credenciales incorrectas. Inténtalo nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'Credenciales inválidas',
          text: 'Por favor, verifique su usuario y contraseña',
          confirmButtonText: 'Aceptar'
        });
      }
    )

  }

}
