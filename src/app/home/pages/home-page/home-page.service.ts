import {Injectable} from '@angular/core';
import {BehaviorSubject, map, mergeMap, Observable, Subject, take} from "rxjs";
import {ProjectService} from "../../../project/services/project.service";
import {Store} from "@ngrx/store";
import {AppState} from "../../../services/app-state";
import {ProjectActions} from "../../../project/actions/project.actions";
import {getKeywordFilterOptions} from "../../../project/reducer/project-store.reducer";
import {KeywordOptionModel} from "../../../project/models/keyword-option.model";

@Injectable()
export class HomePageService {
  updateKeywordSelections$: Subject<KeywordOptionModel> = new Subject<KeywordOptionModel>();
  private keywordOptions$: Observable<KeywordOptionModel[]>;

  constructor(private projectService: ProjectService, private store: Store<AppState>, private projectActions: ProjectActions) {
    this.keywordOptions$ = this.store.select(getKeywordFilterOptions);

    this.updateKeywordSelections$.pipe(
      mergeMap((keywordOption) => {
        return this.keywordOptions$.pipe(
          map((keywordOptions) => keywordOptions.map((keyword) => {
              if (keyword.key !== keywordOption.key) {
                return keyword;
              }
              return {
                ...keywordOption,
                selected: !keywordOption.selected
              }
            })
              .filter((keywordOption) => keywordOption.selected)
              .map((keywordOption) => keywordOption.key)
          ),
          take(1)
        )
      })).subscribe((selectedKeywords) => this.store.dispatch(this.projectActions.setSelectedKeywords(selectedKeywords)));
  }

  initProjects() {
    this.projectService.getProjects()
      .pipe(take(1))
      .subscribe((projects) => {
        projects.forEach((project) => this.store.dispatch(this.projectActions.addProject(project)));
      });
  }
}
