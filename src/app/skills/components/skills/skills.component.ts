import {Component, Input, OnInit} from '@angular/core';
import {SkillModel} from "../../models/skill.model";

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
  @Input() skills: SkillModel[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  get skillRows() {
    return this.skills.filter((skill) => skill.category === 'skills');
  }

  get frameworkRows() {
    return this.skills.filter((skill) => skill.category === 'framework');
  }

  get otherRows() {
    return this.skills.filter((skill) => skill.category === 'other');
  }

  getStyle(skill: SkillModel) {
    return {
      width: `${skill.percentage}%`
    }
  }
}
