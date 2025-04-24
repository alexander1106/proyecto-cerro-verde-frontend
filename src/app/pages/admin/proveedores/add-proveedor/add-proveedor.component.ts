import { Component } from '@angular/core';
import { ProveedoresService } from '../../../../service/proveedores.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-proveedor',
  standalone: false,
  templateUrl: './add-proveedor.component.html',
  styleUrl: './add-proveedor.component.css'
})
export class AddProveedorComponent {
  public proveedor = {
    ruc_proveedor: '',
    razon_social: '',
    direccion: '',
    estado: '1'
  }

  editar: boolean = false;

  constructor(private proveedoresService: ProveedoresService, private snack: MatSnackBar, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const ruc = this.route.snapshot.paramMap.get('ruc')
    if (ruc) {
      this.editar = true;
      this.proveedoresService.buscarProveedorId(ruc).subscribe((data: any) => {
        this.proveedor = data;
      })
    }
    console.log(this.editar)
  }

  formSubmit() {
    console.log(this.proveedor);
    if (this.editar) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Se editará el proveedor",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, editar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.proveedoresService.modificarProveedor(this.proveedor).subscribe(
            (data) => {
              Swal.fire("Excelente", "El proveedor fue editado con éxito", "success");
              this.router.navigate(["/admin/proveedores"])
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
      this.proveedoresService.registrarProveedor(this.proveedor).subscribe(
        (data) => {
          Swal.fire("Excelente", "El proveedor fue registrado con éxito", "success");
          this.router.navigate(["/admin/proveedores"])
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
