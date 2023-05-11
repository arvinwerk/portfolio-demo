import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectListComponent} from './components/project-list/project-list.component';
import {ProjectActions} from "./actions/project.actions";
import { ProjectFilterComponent } from './components/project-filter/project-filter.component';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatButtonModule} from "@angular/material/button";
import {MatChipsModule} from "@angular/material/chips";


@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectFilterComponent
  ],
  providers: [
    ProjectActions
  ],
  exports: [
    ProjectListComponent,
    ProjectFilterComponent
  ],
    imports: [
        CommonModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatChipsModule
    ]
})
export class ProjectModule {
}
