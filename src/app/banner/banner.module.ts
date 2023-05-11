import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BannerComponent} from './components/banner/banner.component';
import {IPhoneModule} from '../i-phone/i-phone.module';


@NgModule({
    declarations: [
        BannerComponent
    ],
    exports: [
        BannerComponent
    ],
    imports: [
        CommonModule,
        IPhoneModule,
    ]
})
export class BannerModule { }
