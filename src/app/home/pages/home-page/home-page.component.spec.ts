import {ComponentFixture, TestBed, tick} from '@angular/core/testing';

import {HomePageComponent} from './home-page.component';
import {MemoizedSelector, StoreModule} from '@ngrx/store';
import {ProjectActions} from '../../../project/actions/project.actions';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BannerModule} from "../../../banner/banner.module";
import {ProjectModule} from "../../../project/project.module";
import {SkillsModule} from "../../../skills/skills.module";
import {PersonalModule} from "../../../personal/personal.module";
import {VCardModule} from "../../../v-card/v-card.module";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {ProjectStoreModel} from "../../../project/models/project-store.model";
import {getKeywordFilterOptions} from "../../../project/reducer/project-store.reducer";
import {AppState} from "../../../services/app-state";

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let httpMock: HttpClientTestingModule;
  let store: MockStore<AppState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePageComponent],
      providers: [
      ],
      imports: [
        BannerModule,
        ProjectModule,
        SkillsModule,
        PersonalModule,
        VCardModule,
        HttpClientTestingModule!,
        StoreModule.forRoot({})]
    })
      .compileComponents();
    httpMock = TestBed.inject(HttpClientTestingModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callFake(() => {});
  });

});
