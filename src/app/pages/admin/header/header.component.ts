import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../service/login.service';
import { NotificacionesService } from '../../../service/notificaciones.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  implements OnInit  {

  constructor(public loginService:LoginService, private notiService: NotificacionesService) {}

  notificaciones: { mensaje: string, fecha: string }[] = [];
  mostrarNotificaciones = false;


  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.notificaciones = this.notiService.obtener();
    }
  }

  cantidadNotificaciones(): number {
    return this.notiService.cantidad();
  }

  isLoggedIn = false;
  user:any = null;
  dropdownVisible: boolean = false;

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  ngOnInit(): void {
        this.notificaciones = this.notiService.obtener();

    this.isLoggedIn = this.loginService.isLoggedIn();
    this.user = this.loginService.getUser();
    this.loginService.loginStatusSubjec.asObservable().subscribe(
      data => {
        this.isLoggedIn = this.loginService.isLoggedIn();
        this.user = this.loginService.getUser();
      }
    )
  }
  public logout(){
    this.loginService.logout();
    window.location.reload();
  }

}
