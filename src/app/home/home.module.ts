import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomePageComponent} from './pages/home-page/home-page.component';
import {ProjectModule} from "../project/project.module";
import {RouterModule, Routes} from "@angular/router";
import {SkillsModule} from "../skills/skills.module";
import {BannerModule} from '../banner/banner.module';
import {VCardModule} from '../v-card/v-card.module';

const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
        outlet: 'mainOutlet'
    }
];

@NgModule({
    declarations: [
        HomePageComponent
    ],
    exports: [RouterModule],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        ProjectModule,
        SkillsModule,
        BannerModule,
        VCardModule
    ]
})
export class HomeModule {
}
