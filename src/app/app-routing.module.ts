import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/AuthGuard ';
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
import { ActualizarRolComponent } from './pages/admin/roles/actualizar-rol/actualizar-rol.component';
import { CajaDetalleComponent } from './pages/admin/caja-detalle/caja-detalle.component';
import { TransaccionesComponent } from './pages/admin/transacciones/transacciones.component';
import { TransaccionesHistorialComponent } from './pages/admin/transacciones-historial/transacciones-historial.component';
import { ActualizarUserComponent } from './pages/admin/usuarios/actualizar-user/actualizar-user.component';
import { ListProductoComponent } from './pages/admin/productos/list-producto/list-producto.component';
import { AddProductoComponent } from './pages/admin/productos/add-producto/add-producto.component';
import { PerfilUserComponent } from './pages/admin/perfil-user/perfil-user.component';
import { ListUnidadComponent } from './pages/admin/unidad/list-unidad/list-unidad.component';
import { ListCompraComponent } from './pages/admin/compras/list-compra/list-compra.component';
import { ArqueoCajaComponent } from './pages/admin/arqueo-caja/arqueo-caja.component';
import { HabitacionesListComponent } from './pages/admin/recepcion/habitaciones/habitaciones-list/habitaciones-list.component';
import { HabitacionesFormComponent } from './pages/admin/recepcion/habitaciones/habitaciones-form/habitaciones-form.component';
import { TipoHabitacionListComponent } from './pages/admin/recepcion/habitaciones/tipo-habitacion/tipo-habitacion-list/tipo-habitacion-list.component';
import { TipoHabitacionFormComponent } from './pages/admin/recepcion/habitaciones/tipo-habitacion/tipo-habitacion-form/tipo-habitacion-form.component';
import { ReservasListComponent } from './pages/admin/recepcion/reservas/reservas-list/reservas-list.component';
import { HabitacionReservaFormComponent } from './pages/admin/recepcion/reservas/habitacion-reserva-form/habitacion-reserva-form.component';
import { SalonReservaFormComponent } from './pages/admin/recepcion/reservas/salon-reserva-form/salon-reserva-form.component';
import { SalonesListComponent } from './pages/admin/recepcion/salones/salones-list/salones-list.component';
import { SalonesFormComponent } from './pages/admin/recepcion/salones/salones-form/salones-form.component';
import { ReservaSalonDetalleComponent } from './pages/admin/recepcion/reservas/reserva-salon-detalle/reserva-salon-detalle.component';
import { ReservaHabitacionDetalleComponent } from './pages/admin/recepcion/reservas/reserva-habitacion-detalle/reserva-habitacion-detalle.component';
import { ConductoresFormComponent } from './pages/admin/recepcion/recojos/conductores-form/conductores-form.component';
import { ConductoresListComponent } from './pages/admin/recepcion/recojos/conductores-list/conductores-list.component';
import { RecojosFormComponent } from './pages/admin/recepcion/recojos/recojos-form/recojos-form.component';
import { RecojosListComponent } from './pages/admin/recepcion/recojos/recojos-list/recojos-list.component';
import { ClientesComponent } from './pages/admin/clientes/clientes.component';
import { VentasComponent } from './pages/admin/ventas/ventas.component';
import { MetodoPagoComponent } from './pages/admin/metodo-pago/metodo-pago.component';
import { MovimientoInventarioComponent } from './pages/admin/movimiento-inventario/movimiento-inventario.component';
import { AdminCajasComponent } from './pages/admin/admin-cajas/admin-cajas.component';
import { CheckinCheckoutFormComponent } from './pages/admin/recepcion/reservas/check-form/checkin-checkout-form.component';
import { ChecksListComponent } from './pages/admin/recepcion/reservas/check-list/check-list.component';
import { ReportesComprasComponent } from './pages/admin/reportes/reportes-compras/reportes-compras.component';
import { ConsultaVentasComponent } from './pages/admin/reportes/consulta-ventas/consulta-ventas.component';
import { ListarAreasHotelComponent } from './pages/admin/listar-areas-hotel/listar-areas-hotel.component';
import { ListarIncidenciasComponent } from './pages/admin/listar-incidencias/listar-incidencias.component';
import { ListarLimpiezasComponent } from './pages/admin/listar-limpiezas/listar-limpiezas.component';
import { ListarTipoIncidenciaComponent } from './pages/admin/listar-tipoincidencia/listar-tipoincidencia.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'enviar-correo',
    component: EnviarCorreoComponent,
    pathMatch: 'full',
  },
  {
    path: 'reset-password',
    component: ConfirmarPasswordComponent,
    pathMatch: 'full',
  },
  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'perfil',
        component: PerfilComponent,
      },
      {
        path: '',
        component: WelcomeComponent,
      },
      {
        path: 'usuarios',
        component: ListUserComponent,
      },
      {
        path: 'add-usuario',
        component: AddUserComponent,
      },
      {
        path: 'permisos',
        component: ListPermisosComponent,
      },
      {
        path: 'add-permiso',
        component: AddPermisosComponent,
      },
      {
        path: 'roles',
        component: ListRolesComponent,
      },
      {
        path: 'add-rol',
        component: AddRolComponent,
      },
      {
        path: 'edit-rol/:id',
        component: ActualizarRolComponent,
      },
      {
        path: 'edit-user/:id',
        component: ActualizarUserComponent,
      },
      {
        path: 'proveedores',
        component: ListProveedorComponent,
      },
      {
        path: 'productos',
        component: ListProductoComponent,
      },
      {
        path: 'categorias',
        component: ListCategoriasComponent,
      },
      {
        path: 'unidad',
        component: ListUnidadComponent,
      },
      {
        path: 'compras',
        component: ListCompraComponent,
      },
      {
        path: 'add-proveedor',
        component: AddProveedorComponent,
      },
      {
        path: 'edit-proveedor/:ruc',
        component: AddProveedorComponent,
      },
      {
        path: 'categorias',
        component: ListCategoriasComponent,
      },
      {
        path: 'add-categoria',
        component: AddCategoriasComponent,
      },
      {
        path: 'edit-categoria/:id',
        component: AddCategoriasComponent,
      },
      {
        path: 'edit-producto/:id',
        component: AddProductoComponent,
      },
      {
        path: 'caja',
        component: CajaAperturaComponent,
      },
      {
        path: 'detalle-caja',
        component: CajaDetalleComponent,
      },
      {
        path: 'detalle-caja/:id',
        component: CajaDetalleComponent,
      },
      {
        path: 'caja/arqueo',
        component: ArqueoCajaComponent,
      },
      {
        path: 'caja/arqueo/:id',
        component: ArqueoCajaComponent,
      },
      {
        path: 'transacciones',
        component: TransaccionesComponent,
      },
      {
        path: 'transacciones/:id',
        component: TransaccionesComponent,
      },
      {
        path: 'transacciones/historial',
        component: TransaccionesHistorialComponent,
      },
      {
        path: 'add-producto',
        component: AddProductoComponent,
      },
      {
        path: 'cajas',
        component: AdminCajasComponent,
      },
      {
        path: 'transacciones/historial',
        component: TransaccionesHistorialComponent,
      },
      {
        path: 'add-producto',
        component: AddProductoComponent,
      },
      {
        path: 'perfil-user',
        component: PerfilUserComponent,
      },
      {
        path: 'habitaciones',
        component: HabitacionesListComponent,
      },
      {
        path: 'recepcion/habitaciones/nuevo',
        component: HabitacionesFormComponent,
      },
      {
        path: 'recepcion/habitaciones/editar/:id',
        component: HabitacionesFormComponent,
      },
      {
        path: 'tipos-habitaciones',
        component: TipoHabitacionListComponent,
      },
      {
        path: 'recepcion/tipos/nuevo',
        component: TipoHabitacionFormComponent,
      },
      {
        path: 'recepcion/tipos/editar/:id',
        component: TipoHabitacionFormComponent,
      },
      {
        path: 'recepcion/reservas/habitaciones/nuevo',
        component: HabitacionReservaFormComponent,
      },
      {
        path: 'recepcion/reservas/salones/nuevo',
        component: SalonReservaFormComponent,
      },
      {
        path: 'reservas',
        component: ReservasListComponent,
      },
      {
        path: 'salones',
        component: SalonesListComponent,
      },
      {
        path: 'recepcion/salones/nuevo',
        component: SalonesFormComponent,
      },
      {
        path: 'recepcion/salones/editar/:id',
        component: SalonesFormComponent,
      },
      {
        path: 'recepcion/reservas/salones/ver/:id',
        component: ReservaSalonDetalleComponent,
      },
      {
        path: 'recepcion/reservas/salones/editar/:id',
        component: SalonReservaFormComponent,
      },
      {
        path: 'recepcion/reservas/habitaciones/editar/:id',
        component: HabitacionReservaFormComponent,
      },
      {
        path: 'recepcion/reservas/habitaciones/ver/:id',
        component: ReservaHabitacionDetalleComponent,
      },
      {
        path: 'recepcion/conductores/nuevo',
        component: ConductoresFormComponent,
      },
      {
        path: 'conductores',
        component: ConductoresListComponent,
      },
      {
        path: 'recepcion/conductores/editar/:id',
        component: ConductoresFormComponent,
      },
      {
        path: 'recepcion/recojos/nuevo',
        component: RecojosFormComponent,
      },
      {
        path: 'programar-recojo',
        component: RecojosListComponent,
      },
      {
        path: 'recepcion/recojos/editar/:id',
        component: RecojosFormComponent,
      },
      {
        path: 'clientes',
        component: ClientesComponent,
      },
      {
        path: 'venta',
        component: VentasComponent,
      },
      {
        path: 'metodo-de-pago',
        component: MetodoPagoComponent,
      },
      {
        path: 'movimientos-de-almacen',
        component: MovimientoInventarioComponent,
      },
      {
        path: 'checks',
        component: ChecksListComponent,
      },
      {
        path: 'recepcion/checks/nuevo',
        component: CheckinCheckoutFormComponent,
      },
      {
        path: 'recepcion/checks/editar/:id',
        component: CheckinCheckoutFormComponent,
      },
      { path: 'reportes-compras', component: ReportesComprasComponent },
      { path: 'reportes-ventas', component: ConsultaVentasComponent },
      {
        path: 'areas-del-hotel', component: ListarAreasHotelComponent
      },
      {
        path: 'limpieza', component: ListarLimpiezasComponent
      },
      {
        path: 'incidencias', component: ListarIncidenciasComponent
      },
      {
        path: 'tipo-de-incidencia', component: ListarTipoIncidenciaComponent
      }
    ],
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
