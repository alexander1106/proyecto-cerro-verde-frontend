import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CategoriasService } from '../../../../service/categorias.service';

@Component({
  selector: 'app-add-categorias',
  standalone: false,
  templateUrl: './add-categorias.component.html',
  styleUrl: './add-categorias.component.css'
})

export class AddCategoriasComponent {
  public categoria = {
    id_categoria: '',
    nombre: '',
    estado: '1'
  }

  editar: boolean = false;

  constructor(private categoriService:CategoriasService, private snack: MatSnackBar, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    if (id) {
      this.editar = true;
      this.categoriService.buscarCategoriaId(id).subscribe((data: any) => {
        this.categoria = data;
      })
    }
    console.log(this.editar)
  }

  formSubmit() {
    console.log(this.categoria);
    if (this.editar) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Se editará la categoria",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, editar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.categoriService.modificarCategoria(this.categoria).subscribe(
            (data:any) => {
              Swal.fire("Excelente", "La categoria fue editado con éxito", "success");
              this.router.navigate(["/admin/categorias"])
              console.log(data);
            }, (error:any) => {
              console.log(error);
              this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
                duration: 3000,
              });
            }
          )
        }
      });
    } else {
      this.categoriService.registrarCategoria(this.categoria).subscribe(
        (data:any) => {
          Swal.fire("Excelente", "La categoria fue registrado con éxito", "success");
          this.router.navigate(["/admin/categorias"])
          console.log(data);
        }, (error:any) => {
          console.log(error);
          this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
            duration: 3000,
          });
        }
      )
    }
  }
}
