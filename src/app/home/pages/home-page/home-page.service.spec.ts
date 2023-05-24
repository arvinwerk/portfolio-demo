import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {HomePageService} from './home-page.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {StoreModule} from "@ngrx/store";
import {ProjectStoreReducer} from "../../../project/reducer/project-store.reducer";
import {ProjectActions} from "../../../project/actions/project.actions";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {AppState} from "../../../services/app-state";
import {ProjectService} from "../../../project/services/project.service";
import {of} from "rxjs";
import {ProjectModel} from "../../../project/models/project.model";

const initialState: AppState = {
  projectsStore: {
    projects: {},
    keywords: ['angular'],
    selectedKeywords: ['angular']
  }
};

describe('HomePageService', () => {
  let service: HomePageService;
  let projectService: ProjectService;
  let store: MockStore<AppState>;
  let projectActions: ProjectActions;
  let httpMock: HttpTestingController;
  let injector: TestBed;
  let project: ProjectModel = {
    "id": 1,
    "company": "Demo company",
    "title": "Developer",
    "shortDescription": "Created front-end",
    "longDescription": "Created front-end in angular",
    "keywords": [
      "Laravel",
      "Angular"
    ],
    "images": []
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          projectsStore: ProjectStoreReducer,
        }),
        HttpClientTestingModule
      ],
      providers: [
        HomePageService,
        ProjectActions,
        provideMockStore({ initialState })
      ]
    });
    service = TestBed.inject(HomePageService);
    projectActions = TestBed.inject(ProjectActions);
    store = TestBed.inject(MockStore);
    httpMock = TestBed.inject(HttpTestingController);
    projectService = TestBed.inject(ProjectService);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should select keywords', () => {

    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    service.initProjects();
    const req = httpMock.expectOne(`/assets/api/projects.json`);
    expect(req.request.method).toBe("GET");
    req.flush([project]);

    expect(dispatchSpy).toHaveBeenCalledWith(
      projectActions.addProject(project)
    );

  });
  /*
  it('should select keywords', fakeAsync(() => {
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    service.updateKeywordSelections$.next({
      key: 'angular',
      selected: true
    });
    tick(5000);
    expect(dispatchSpy).toHaveBeenCalledWith(
      projectActions.setSelectedKeywords(['angular'])
    );

  }));

   */
});
