import {Component, Input, OnInit} from '@angular/core';
import {SkillModel} from "../../models/skill.model";
import {BehaviorSubject, Observable, of, ReplaySubject, Subject} from 'rxjs';

@Component({
    selector: 'app-skills',
    templateUrl: './skills.component.html',
    styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
    @Input() skills: SkillModel[] = [];
    cols$: ReplaySubject<number> = new ReplaySubject<number>();

    constructor() {
      this.setCols();
    }

    setCols() {
        this.cols$.next(window.innerWidth <= 700 ? 1 : 3);
    }

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
