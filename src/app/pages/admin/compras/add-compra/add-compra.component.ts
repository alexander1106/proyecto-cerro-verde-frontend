import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ComprasService } from '../../../../service/compras.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../../../service/login.service';

@Component({
  selector: 'app-add-compra',
  standalone: false,
  templateUrl: './add-compra.component.html',
  styleUrl: './add-compra.component.css'
})
export class AddCompraComponent {
  public compra = {
    id_compra: '',
    correlativo: '',
    fecha_compra: '',
    estado: '1',
    proveedor: {
      ruc_proveedor: '',
      razon_social: '',
      direccion: '',
      estado: '1'
    },
    detallecompra: [] as Array<{
      id_detalle_compra: any,
      cantidad: any,
      precio: any,
      subtotal: any,
      estado: '1',
      producto?: {
        id_producto: any,
        nombre: any,
        descripcion: any,
        estado: '1',
        categoriaproducto: {
          id_categoria: '',
          nombre: '',
          estado: '1'
        }
      }
    }>
  }

  editar: boolean = false;

  constructor(
    private comprasService: ComprasService, 
    private snack: MatSnackBar, 
    private router: Router, 
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    if (id) {
      this.editar = true;
      this.comprasService.buscarCompraId(id).subscribe((data: any) => {
        this.compra = data;
      })
    }
    console.log(this.editar)
  }

  formSubmit() {
    console.log(this.compra);
    if (this.editar) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Se editará la compra",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, editar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.comprasService.modificarCompra(this.compra).subscribe(
            (data) => {
              Swal.fire("Excelente", "La compra fue editado con éxito", "success");
              this.router.navigate(["/admin/compras"])
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
      this.comprasService.registrarCompra(this.compra).subscribe(
        (data) => {
          Swal.fire("Excelente", "La compra fue registrado con éxito", "success");
          this.router.navigate(["/admin/compras"])
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
