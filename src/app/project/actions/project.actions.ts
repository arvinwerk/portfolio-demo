import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {ProjectModel} from "../models/project.model";

@Injectable()
export class ProjectActions {

  static ADD_PROJECT = 'ADD_PROJECT';

  addProject(project: ProjectModel): Action {
    return {
      type: ProjectActions.ADD_PROJECT,
      payload: {project}
    } as Action;
  }

  static SET_SELECTED_KEYWORDS = 'SET_SELECTED_KEYWORDS';
  setSelectedKeywords(keywords: string[]): Action {
    return {
      type: ProjectActions.SET_SELECTED_KEYWORDS,
      payload: keywords
    } as Action;
  }
}
