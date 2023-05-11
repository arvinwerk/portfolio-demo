import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {SkillModel} from "../models/skill.model";
import {HttpClient} from '@angular/common/http';
import {PersonalModel} from '../../personal/models/personal.model';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {

  constructor(private httpClient: HttpClient) {
  }

  // Stub for API. Creating an API is out of the scope of my demo
  getSkills(): Observable<SkillModel[]> {
    return this.httpClient.get<SkillModel[]>('/assets/api/skills.json');
  }
}
