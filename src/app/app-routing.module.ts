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
import { ActualizarRolComponent } from './pages/admin/roles/actualizar-rol/actualizar-rol.component';
import { EnviarCorreoComponent } from './pages/enviar-correo/enviar-correo.component';
import { ConfirmarPasswordComponent } from './pages/confirmar-password/confirmar-password.component';


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
      path:'rol/:rolId',
      component:ActualizarRolComponent
    },
  ]
},
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
