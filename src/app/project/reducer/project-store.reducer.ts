import {ProjectStoreModel} from "../models/project-store.model";
import {AppState} from "../../services/app-state";
import {ProjectActions} from "../actions/project.actions";
import {ProjectModel} from "../models/project.model";
import {createSelector} from "@ngrx/store";
import {KeywordOptionModel} from "../models/keyword-option.model";

export const initialProjectState: ProjectStoreModel = {
  projects: {}, // save as object for faster update
  keywords: [],
  selectedKeywords: []
};

export function ProjectStoreReducer(state = initialProjectState, action: any = {type: ''}) {
  switch (action.type) {
    case ProjectActions.ADD_PROJECT:
      const keywords = [...state.keywords];
      action.payload.project.keywords.forEach((keyword: string) => {
        if (!keywords.includes(keyword)) {
          keywords.push(keyword);
        }

      });
      return {
        ...state,
        keywords,
        projects: {
          ...state.projects,
          [action.payload.project.id]: {...action.payload.project}
        }
      };

    case ProjectActions.SET_SELECTED_KEYWORDS:
      return {
        ...state,
        selectedKeywords: action.payload
      }

    default:
      return state;
  }
}

// transform object to array, so it's loopable in the frontend
export const currentProjects = (state: AppState): ProjectModel[] => {
  return Object.keys(state.projectsStore.projects)
    .map((key) => {
      return state.projectsStore.projects[key];
    });
}

export const projectKeywords = (state: AppState) => state.projectsStore.keywords;
export const selectedKeywords = (state: AppState) => state.projectsStore.selectedKeywords;

export const getKeywordFilterOptions = createSelector(
  projectKeywords,
  selectedKeywords,
  (keywords, selectedKeywords): KeywordOptionModel[] => keywords.map((keyword) => ({
    key: keyword,
    selected: selectedKeywords ? selectedKeywords.includes(keyword) : false
  }))
);

export const filteredProjects = createSelector(
  currentProjects,
  selectedKeywords,
  (currentProjects, selectedKeywords): ProjectModel[] => {
    // If none selected, show all
    if (selectedKeywords.length === 0) {
      return currentProjects;
    }
    return currentProjects.filter(
      (project) => project.keywords.some((keyword) => selectedKeywords.includes(keyword))
    )
  }
);
