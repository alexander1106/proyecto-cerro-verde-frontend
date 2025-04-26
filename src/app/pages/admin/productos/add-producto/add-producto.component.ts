import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriasService } from '../../../../service/categorias.service';
import { ProductosService } from '../../../../service/producto.service';

@Component({
  selector: 'app-add-producto',
  standalone: false,
  templateUrl: './add-producto.component.html',
  styleUrl: './add-producto.component.css'
})
export class AddProductoComponent {
  public producto = {
    id_producto: '',
    nombre: '',
    estado: '1',
    descripcion: '',
    categoriaproducto: {
      id_categoria: '',
      nombre: '',
      estado: 1
    }
  }

  categorias: any[] = [];

  editar: boolean = false;

  constructor(private productosService: ProductosService, private snack: MatSnackBar, private router: Router, private route: ActivatedRoute, private categoriasService: CategoriasService) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    if (id) {
      this.editar = true;
      this.productosService.buscarProductoId(id).subscribe((data: any) => {
        this.producto = data;
      })
    }
    console.log(this.editar)

    this.categoriasService.listarCategoria().subscribe(
      (data) => {
        this.categorias = data;
      },
      (error) => {
        console.log(error);
      }
    )
  }

  formSubmit() {
    console.log(this.producto);
    if (this.editar) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Se editará el producto",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, editar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.productosService.modificarProductos(this.producto).subscribe(
            (data) => {
              Swal.fire("Excelente", "El producto fue editado con éxito", "success");
              this.router.navigate(["/admin/productos"])
              console.log(data);
            }, (error) => {
              console.log(error);
              this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
                duration: 3000,
              });
            }
          )
        }
      });
    } else {
      this.productosService.registrarProductos(this.producto).subscribe(
        (data) => {
          Swal.fire("Excelente", "El producto fue registrado con éxito", "success");
          this.router.navigate(["/admin/productos"])
          console.log(data);
        }, (error) => {
          console.log(error);
          this.snack.open('Ha ocurrido un error en el sistema !!', 'Aceptar', {
            duration: 3000,
          });
        }
      )
    }
  }
}
