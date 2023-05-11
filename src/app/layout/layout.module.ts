import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DefaultLayoutComponent} from './components/default-layout/default-layout.component';
import {HeaderModule} from "../header/header.module";
import {RouterModule} from "@angular/router";


@NgModule({
  declarations: [
    DefaultLayoutComponent
  ],
  imports: [
    CommonModule,
    HeaderModule,
    RouterModule
  ]
})
export class LayoutModule {
}
