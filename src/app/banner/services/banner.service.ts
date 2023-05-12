import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor() { }

  vvalImages() {
    return {
      title: 'Vrienden van Amstel VIP Arrangementen 2024',
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
      title: 'Heineken Formule 1 VIP',
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
