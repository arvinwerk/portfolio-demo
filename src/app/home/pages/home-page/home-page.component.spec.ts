import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HomePageComponent} from './home-page.component';
import {StoreModule} from '@ngrx/store';
import {ProjectActions} from '../../../project/actions/project.actions';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BannerModule} from "../../../banner/banner.module";
import {ProjectModule} from "../../../project/project.module";
import {SkillsModule} from "../../../skills/skills.module";
import {PersonalModule} from "../../../personal/personal.module";
import {VCardModule} from "../../../v-card/v-card.module";

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let httpMock: HttpClientTestingModule;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePageComponent],
      providers: [
        ProjectActions,
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
