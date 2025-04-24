import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../service/login.service';
import { Router } from '@angular/router';
import { ModulosService } from '../../../service/modulos.service';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  modulos: any[] = [];

  constructor(
    private moduloService: ModulosService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarModulos();
  }

  cargarModulos(): void {
    this.moduloService.listarModulos().subscribe(
      (modulos) => {
        const modulosConSubmodulos = modulos.map((modulo: any) => {
          return this.moduloService.obtenerSubmodulosPorModulo(modulo.idModulo).toPromise()
            .then((submodulos) => {
              console.log(`Submódulos del módulo ${modulo.idModulo}:`, submodulos);
              modulo.submodulos = submodulos;
              return modulo;
            });
        });

        Promise.all(modulosConSubmodulos).then((result) => {
          this.modulos = result;
        });
      },
      (error) => {
        console.error('Error al cargar los módulos:', error);
      }
    );
  }

  cerrar(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

}
