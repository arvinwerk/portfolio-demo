import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VCardComponent } from './components/v-card/v-card.component';



@NgModule({
  declarations: [
    VCardComponent
  ],
  exports: [
    VCardComponent
  ],
  imports: [
    CommonModule
  ]
})
export class VCardModule { }
