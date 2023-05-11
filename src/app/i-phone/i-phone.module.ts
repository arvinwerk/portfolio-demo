import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IPhoneComponent} from './components/i-phone/i-phone.component';



@NgModule({
  declarations: [IPhoneComponent],
  exports: [
    IPhoneComponent
  ],
  imports: [
    CommonModule
  ]
})
export class IPhoneModule { }
