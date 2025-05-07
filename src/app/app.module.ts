import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http'; // <- IMPORTA ESTO
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './pages/admin/menu/menu.component';
import {MatListModule} from '@angular/material/list';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { WelcomeComponent } from './pages/admin/welcome/welcome.component';
import { PerfilComponent } from './pages/admin/perfil/perfil.component';
import { authInterceptorProviders } from './service/auth.interceptor';
import {MatExpansionModule} from '@angular/material/expansion';
import { ListUserComponent } from './pages/admin/usuarios/list-user/list-user.component';
import { AddUserComponent } from './pages/admin/usuarios/add-user/add-user.component';
import { HeaderComponent } from './pages/admin/header/header.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // necesario para usar Datepicker con fechas nativas
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { ListRolesComponent } from './pages/admin/roles/list-roles/list-roles.component';
import { ListPermisosComponent } from './pages/admin/permisos/list-permisos/list-permisos.component';
import { AddPermisosComponent } from './pages/admin/permisos/add-permisos/add-permisos.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card'; // ✅ Importar MatCardModule
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    ListProductoComponent,
    ActualizarUserComponent,
    AddProductoComponent,
    TransaccionesHistorialComponent,
    PerfilUserComponent,

  ],
  imports: [
    BrowserModule,MatTableModule,ReactiveFormsModule,MatFormFieldModule,MatCheckboxModule,
    MatToolbarModule,MatDatepickerModule,MatSelectModule,MatSlideToggleModule,
    AppRoutingModule,HttpClientModule,MatDialogModule,
    MatListModule,MatExpansionModule,MatNativeDateModule,FormsModule,MatInputModule,MatButtonModule,MatCardModule,
    MatSnackBarModule,MatFormFieldModule,MatIconModule, MatFormFieldModule, ReplaceSpacesPipe
  ],
  providers: [
    authInterceptorProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
