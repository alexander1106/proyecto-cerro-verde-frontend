import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http'; // <- IMPORTA ESTO
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './pages/admin/menu/menu.component';
import { MatListModule } from '@angular/material/list';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { WelcomeComponent } from './pages/admin/welcome/welcome.component';
import { PerfilComponent } from './pages/admin/perfil/perfil.component';
import { authInterceptorProviders } from './service/auth.interceptor';
import { MatExpansionModule } from '@angular/material/expansion';
import { ListUserComponent } from './pages/admin/usuarios/list-user/list-user.component';
import { AddUserComponent } from './pages/admin/usuarios/add-user/add-user.component';
import { HeaderComponent } from './pages/admin/header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // necesario para usar Datepicker con fechas nativas
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ListRolesComponent } from './pages/admin/roles/list-roles/list-roles.component';
import { ListPermisosComponent } from './pages/admin/permisos/list-permisos/list-permisos.component';
import { AddPermisosComponent } from './pages/admin/permisos/add-permisos/add-permisos.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card'; // ✅ Importar MatCardModule
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatError } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatCard } from '@angular/material/card';

import { AddRolComponent } from './pages/admin/roles/add-rol/add-rol.component';
import { ActualizarRolComponent } from './pages/admin/roles/actualizar-rol/actualizar-rol.component';
import { ConfirmarPasswordComponent } from './pages/confirmar-password/confirmar-password.component';
import { EnviarCorreoComponent } from './pages/enviar-correo/enviar-correo.component';
import { ReplaceSpacesPipe } from './pipes/replace-spaces.pipe';
import { AddProveedorComponent } from './pages/admin/proveedores/add-proveedor/add-proveedor.component';
import { ListProveedorComponent } from './pages/admin/proveedores/list-proveedor/list-proveedor.component';

import { ListCategoriasComponent } from './pages/admin/categorias/list-categorias/list-categorias.component';
import { AddCategoriasComponent } from './pages/admin/categorias/add-categorias/add-categorias.component';
import { CajaAperturaComponent } from './pages/admin/caja-apertura/caja-apertura.component';
import { CajaDetalleComponent } from './pages/admin/caja-detalle/caja-detalle.component';
import { ActualizarUserComponent } from './pages/admin/usuarios/actualizar-user/actualizar-user.component';
import { ListProductoComponent } from './pages/admin/productos/list-producto/list-producto.component';
import { TransaccionesHistorialComponent } from './pages/admin/transacciones-historial/transacciones-historial.component';
import { AddProductoComponent } from './pages/admin/productos/add-producto/add-producto.component';
import { PerfilUserComponent } from './pages/admin/perfil-user/perfil-user.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ListUnidadComponent } from './pages/admin/unidad/list-unidad/list-unidad.component';
import { ListCompraComponent } from './pages/admin/compras/list-compra/list-compra.component';
import { ArqueoCajaComponent } from './pages/admin/arqueo-caja/arqueo-caja.component';
import { HabitacionesListComponent } from './pages/admin/recepcion/habitaciones/habitaciones-list/habitaciones-list.component';
import { HabitacionesFormComponent } from './pages/admin/recepcion/habitaciones/habitaciones-form/habitaciones-form.component';
import { TipoHabitacionListComponent } from './pages/admin/recepcion/habitaciones/tipo-habitacion/tipo-habitacion-list/tipo-habitacion-list.component';
import { TipoHabitacionFormComponent } from './pages/admin/recepcion/habitaciones/tipo-habitacion/tipo-habitacion-form/tipo-habitacion-form.component';
import { ReservasListComponent } from './pages/admin/recepcion/reservas/reservas-list/reservas-list.component';
import { ReservaSalonDetalleComponent } from './pages/admin/recepcion/reservas/reserva-salon-detalle/reserva-salon-detalle.component';
import { ReservaHabitacionDetalleComponent } from './pages/admin/recepcion/reservas/reserva-habitacion-detalle/reserva-habitacion-detalle.component';
import { HabitacionReservaFormComponent } from './pages/admin/recepcion/reservas/habitacion-reserva-form/habitacion-reserva-form.component';
import { SalonReservaFormComponent } from './pages/admin/recepcion/reservas/salon-reserva-form/salon-reserva-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SalonesListComponent } from './pages/admin/recepcion/salones/salones-list/salones-list.component';
import { SalonesFormComponent } from './pages/admin/recepcion/salones/salones-form/salones-form.component';
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
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { ReportesComprasComponent } from './pages/admin/reportes/reportes-compras/reportes-compras.component';
import { ConsultaVentasComponent } from './pages/admin/reportes/consulta-ventas/consulta-ventas.component';
import { NgChartsModule } from 'ng2-charts';
import { MatTab, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
// import { ListarIncidenciasComponent } from './pages/admin/listar-incidencias/listar-incidencias.component';
// import { RegistrarIncidenciaComponent } from './pages/admin/registrar-incidencias/registrar-incidencias.component';
import { ReportesVentasService } from './service/reportes-ventas.service';
import { RegistrarAreaHotelComponent } from './pages/admin/registrar-areas-hotel/registrar-areas-hotel.component';
import { CajaReporteComponent } from './pages/admin/reportes/caja-reporte/caja-reporte.component';
import { DashboardInicioComponent } from './pages/admin/reportes/dashboard-inicio/dashboard-inicio.component';
import { PisosFormComponent } from './pages/admin/recepcion/habitaciones/pisos-form/pisos-form.component';
import { PisosListComponent } from './pages/admin/recepcion/habitaciones/pisos-list/pisos-list.component';
import { ListarTipoIncidenciaComponent } from './pages/admin/listar-tipoincidencia/listar-tipoincidencia.component';
import { RegistrarTipoIncidenciaComponent } from './pages/admin/registrar-tipoincidencia/registrar-tipoincidencia.component';

import { ListarAreasHotelComponent } from './pages/admin/listar-areas-hotel/listar-areas-hotel.component';
import { ListarLimpiezaComponent } from './pages/admin/listar-limpiezas/listar-limpiezas.component';
import { RegistrarLimpiezaComponent } from './pages/admin/registrar-limpiezas/registrar-limpiezas.component';
import { RegistrarPersonalLimpiezaComponent } from './pages/admin/registrar-personal-limpieza/registrar-personal-limpieza.component';
import { ListarPersonalLimpiezaComponent } from './pages/admin/listar-personal-limpieza/listar-personal-limpieza.component';
import { RegistrarIncidenciaComponent } from './pages/admin/registrar-incidencias/registrar-incidencias.component';
import { ListarIncidenciasComponent } from './pages/admin/listar-incidencias/listar-incidencias.component';
import { IaComponent } from './pages/admin/ia/ia.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    DashboardComponent,
    WelcomeComponent,
    PerfilComponent,
    ListUserComponent,
    AddRolComponent,
    AddUserComponent,
    HeaderComponent,
    ListRolesComponent,
    ListPermisosComponent,
    AddPermisosComponent,
    ActualizarRolComponent,
    ConfirmarPasswordComponent,
    EnviarCorreoComponent,
    AddProveedorComponent,
    ListProveedorComponent,
    ListCategoriasComponent,
    AddCategoriasComponent,
    CajaAperturaComponent,
    CajaDetalleComponent,
    CajaDetalleComponent,
    ListProductoComponent,
    ActualizarUserComponent,
    AddProductoComponent,
    TransaccionesHistorialComponent,
    PerfilUserComponent,
    ListUnidadComponent,
    ListCompraComponent,
    AdminCajasComponent,
    ArqueoCajaComponent,
    CajaReporteComponent,
    HabitacionesFormComponent,
    HabitacionesListComponent,
    TipoHabitacionListComponent,
    TipoHabitacionFormComponent,
    ReservasListComponent,
    ReservaSalonDetalleComponent,
    ReservaHabitacionDetalleComponent,
    HabitacionReservaFormComponent,
    SalonReservaFormComponent,
    SalonesListComponent,
    SalonesFormComponent,
    ConductoresFormComponent,
    ConductoresListComponent,
    RecojosFormComponent,
    RecojosListComponent,
    ClientesComponent,
    VentasComponent,
    MetodoPagoComponent,
    MovimientoInventarioComponent,
    CheckinCheckoutFormComponent,
    ChecksListComponent,
    ReportesComprasComponent,
    ConsultaVentasComponent,
    RegistrarIncidenciaComponent,
    ListarIncidenciasComponent,
    ListarTipoIncidenciaComponent,
    RegistrarTipoIncidenciaComponent,
    ListarAreasHotelComponent,
    RegistrarAreaHotelComponent,
    RegistrarLimpiezaComponent,
    PisosFormComponent,
    PisosListComponent,
    CajaReporteComponent,
    DashboardInicioComponent,
    ListarAreasHotelComponent,
    RegistrarAreaHotelComponent,
    ListarLimpiezaComponent,
    RegistrarLimpiezaComponent,
    RegistrarPersonalLimpiezaComponent,
    ListarPersonalLimpiezaComponent,
    IaComponent,

  ],

  imports: [
    BrowserModule,
    MatTableModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatSelectModule,
    MatSlideToggleModule,
    AppRoutingModule,
    HttpClientModule,
    MatDialogModule,
    NgSelectModule,
    MatListModule,
    MatExpansionModule,
    MatNativeDateModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatIconModule,
    MatFormFieldModule,
    ReplaceSpacesPipe,
    MatError,
    MatLabel,
    MatCard,
    MatDividerModule,
    MatPaginatorModule,
    MatSortModule,
    ReplaceSpacesPipe,
    NgChartsModule,
    MatTableModule,
    MatTab,
    MatTabGroup,
    ReactiveFormsModule
  ],
  providers: [authInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule {}
