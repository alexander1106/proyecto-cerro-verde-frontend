import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminGuard } from './guards/admin.guard';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { WelcomeComponent } from './pages/admin/welcome/welcome.component';
import { PerfilComponent } from './pages/admin/perfil/perfil.component';
import { DashboardUserComponent } from './pages/user/dashboard-user/dashboard-user.component';
import { ListUserComponent } from './pages/admin/usuarios/list-user/list-user.component';
import { AddUserComponent } from './pages/admin/usuarios/add-user/add-user.component';
import { ListPermisosComponent } from './pages/admin/permisos/list-permisos/list-permisos.component';
import { AddPermisosComponent } from './pages/admin/permisos/add-permisos/add-permisos.component';
import { ListRolesComponent } from './pages/admin/roles/list-roles/list-roles.component';
import { AddRolComponent } from './pages/admin/roles/add-rol/add-rol.component';
import { EnviarCorreoComponent } from './pages/enviar-correo/enviar-correo.component';
import { ConfirmarPasswordComponent } from './pages/confirmar-password/confirmar-password.component';
import { ListProveedorComponent } from './pages/admin/proveedores/list-proveedor/list-proveedor.component';
import { AddProveedorComponent } from './pages/admin/proveedores/add-proveedor/add-proveedor.component';
import { ListCategoriasComponent } from './pages/admin/categorias/list-categorias/list-categorias.component';
import { AddCategoriasComponent } from './pages/admin/categorias/add-categorias/add-categorias.component';
import { CajaAperturaComponent } from './pages/admin/caja-apertura/caja-apertura.component';
import { AdminCajasComponent } from './pages/admin/admin-cajas/admin-cajas.component';
import { ActualizarRolComponent } from './pages/admin/roles/actualizar-rol/actualizar-rol.component';
import { CajaDetalleComponent } from './pages/admin/caja-detalle/caja-detalle.component';
import { TransaccionesComponent } from './pages/admin/transacciones/transacciones.component';
import { TransaccionesHistorialComponent } from './pages/admin/transacciones-historial/transacciones-historial.component';
import { ActualizarUserComponent } from './pages/admin/usuarios/actualizar-user/actualizar-user.component';
import { ListProductoComponent } from './pages/admin/productos/list-producto/list-producto.component';
import { AddProductoComponent } from './pages/admin/productos/add-producto/add-producto.component';
import { ArqueoCajaComponent } from './pages/admin/arqueo-caja/arqueo-caja.component';


const routes: Routes = [{
  path:'',
  component: LoginComponent,
  pathMatch:'full'
},{
  path:'login',
  component:LoginComponent,
  pathMatch:'full'
},{
  path:'enviar-correo',
  component:EnviarCorreoComponent,
  pathMatch:'full'
},{
  path:'reset-password',
  component:ConfirmarPasswordComponent,
  pathMatch:'full'
},
{
  path:'admin',
  component: DashboardComponent,
  canActivate:[AdminGuard],
  children:[
    {
      path:'perfil',
      component:PerfilComponent
    },{
      path:'',
      component:WelcomeComponent
    },{
      path:'usuarios',
      component:ListUserComponent
    },{
      path:'add-usuario',
      component:AddUserComponent
    },{
      path:'permisos',
      component:ListPermisosComponent
    },{
      path:'add-permiso',
      component:AddPermisosComponent
    },{
      path:'roles',
      component:ListRolesComponent
    },{
      path:'add-rol',
      component:AddRolComponent
    },{
      path: 'edit-rol/:id',
      component: ActualizarRolComponent
    },{
      path: 'edit-user/:id',
      component: ActualizarUserComponent,
    },{
      path: 'proveedores',
      component:ListProveedorComponent
    },
    {
      path: 'productos',
      component:ListProductoComponent,
    }
    ,{
      path: 'add-proveedor',
      component:AddProveedorComponent
    },{
      path: 'edit-proveedor/:ruc',
      component:AddProveedorComponent
    },{
      path: 'categorias',
      component:ListCategoriasComponent
    },{
      path: 'add-categoria',
      component:AddCategoriasComponent
    },{
      path: 'edit-categoria/:id',
      component:AddCategoriasComponent
    },{
      path: 'edit-producto/:id',
      component:AddProductoComponent
    },{
      path: 'caja',
      component:CajaAperturaComponent
    },{
      path: 'detalle-caja',
      component:CajaDetalleComponent
    },
    {
      path: 'detalle-caja/:id',
      component: CajaDetalleComponent
    },{
      path: 'caja/arqueo',
      component:ArqueoCajaComponent
    },{
      path: 'caja/arqueo/:id',
      component: ArqueoCajaComponent
    },{
      path: 'transacciones',
      component:TransaccionesComponent
    },{
      path: 'transacciones/:id',
      component: TransaccionesComponent
    },{
      path: 'transacciones/historial',
      component: TransaccionesHistorialComponent
    }, {
      path: 'add-producto',
      component: AddProductoComponent
    }, {
      path: 'cajas',
      component: AdminCajasComponent
    }
  ]
},
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
