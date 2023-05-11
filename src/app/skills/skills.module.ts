import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsComponent } from './components/skills/skills.component';
import {MatGridListModule} from "@angular/material/grid-list";



@NgModule({
    declarations: [
        SkillsComponent
    ],
    exports: [
        SkillsComponent
    ],
  imports: [
    CommonModule,
    MatGridListModule
  ]
})
export class SkillsModule { }
