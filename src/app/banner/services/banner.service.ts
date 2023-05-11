import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor() { }

  vvalImages() {
    return {
      bgImage: {
        src: '/assets/images/vval24.jpg'
      },
      laptopImage: {
        src: '/assets/images/vval-laptop.png'
      },
      mobileImage: {
        src: '/assets/images/vval-mobile.png'
      }
    }
  }

  gpImages() {
    return {
      bgImage: {
        src: '/assets/images/gp-bg.jpg'
      },
      laptopImage: {
        src: '/assets/images/gp-laptop.png'
      },
      mobileImage: {
        src: '/assets/images/gp-mobile.png'
      }
    }
  }
}
