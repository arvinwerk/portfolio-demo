import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectListComponent} from './components/project-list/project-list.component';
import {ProjectActions} from "./actions/project.actions";
import { ProjectFilterComponent } from './components/project-filter/project-filter.component';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatLegacyChipsModule as MatChipsModule} from "@angular/material/legacy-chips";


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
