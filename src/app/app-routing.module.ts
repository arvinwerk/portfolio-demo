import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DefaultLayoutComponent} from "./layout/components/default-layout/default-layout.component";

const routes: Routes = [{
  path: '',
  component: DefaultLayoutComponent,
  loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
