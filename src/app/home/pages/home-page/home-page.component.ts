import {Component, OnInit} from '@angular/core';
import {map, Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "../../../services/app-state";
import {filteredProjects, getKeywordFilterOptions} from "../../../project/reducer/project-store.reducer";
import {ProjectModel} from "../../../project/models/project.model";
import {KeywordOptionModel} from "../../../project/models/keyword-option.model";
import {SkillsService} from "../../../skills/services/skills.service";
import {SkillModel} from "../../../skills/models/skill.model";
import {PersonalService} from "../../../personal/services/personal.service";
import {HomePageService} from "./home-page.service";
import {BannerService} from '../../../banner/services/banner.service';
import {BannerModel} from '../../../banner/models/banner.model';
import {PersonalModel} from '../../../personal/models/personal.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  providers: [HomePageService]
})
export class HomePageComponent implements OnInit {
  projects$: Observable<ProjectModel[]>;
  keywordOptions$: Observable<KeywordOptionModel[]>;
  skills$: Observable<SkillModel[]>;
  foreword$: Observable<string>;
  vvalBanner: BannerModel;
  gpBanner: BannerModel;
  personal$: Observable<PersonalModel>;


  constructor(
    private store: Store<AppState>,
    private skillsService: SkillsService,
    private bannerService: BannerService,
    private personalService: PersonalService,
    private homePageService: HomePageService) {
    this.vvalBanner = bannerService.vvalImages();
    this.gpBanner = bannerService.gpImages();
    this.personal$ = personalService.personal();
    this.projects$ = this.store.select<ProjectModel[]>(filteredProjects);
    this.skills$ = this.skillsService.getSkills();
    this.keywordOptions$ = this.store.select(getKeywordFilterOptions);
    this.foreword$ = this.personalService.foreword().pipe(map((res) => res.foreword));
  }

  ngOnInit(): void {
    // Initialising projects
    this.homePageService.initProjects();
  }

  updateKeywordSelections(keywordOption: KeywordOptionModel) {
    this.homePageService.updateKeywordSelections$.next(keywordOption);
  }
}
