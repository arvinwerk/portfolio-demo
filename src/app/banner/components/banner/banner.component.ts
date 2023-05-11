import {Component, Input, OnInit} from '@angular/core';
import {BannerModel} from '../../models/banner.model';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  @Input('bgImage') bgImage: BannerModel['bgImage'] | null = null;
  @Input('laptopImage') laptopImage: BannerModel['laptopImage'] | null = null;
  @Input('mobileImage') mobileImage: BannerModel['mobileImage'] | null = null;
  constructor() { }

  ngOnInit(): void {
  }

}
