import {Component, Input, OnInit} from '@angular/core';
import {BannerModel} from '../../../banner/models/banner.model';

@Component({
  selector: 'app-i-phone',
  templateUrl: './i-phone.component.html',
  styleUrls: ['./i-phone.component.scss']
})
export class IPhoneComponent implements OnInit {
  @Input('mobileImage') mobileImage: BannerModel['mobileImage'] | null = null;
  constructor() { }

  ngOnInit(): void {
  }

}
