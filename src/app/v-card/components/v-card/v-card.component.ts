import {Component, Input, OnInit} from '@angular/core';
import {PersonalModel} from '../../../personal/models/personal.model';

@Component({
  selector: 'app-v-card',
  templateUrl: './v-card.component.html',
  styleUrls: ['./v-card.component.scss']
})
export class VCardComponent implements OnInit {
  @Input('personal') personal: PersonalModel | null = null;
  constructor() { }

  ngOnInit(): void {
  }

}
