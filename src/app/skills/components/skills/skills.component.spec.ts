import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SkillsComponent} from './skills.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {By} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {MatGridList, MatGridListModule, MatGridTile} from "@angular/material/grid-list";

fdescribe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;
  let httpMock: HttpClientTestingModule;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatGridTile, MatGridList, SkillsComponent],
      providers: [
        CommonModule,
        HttpClientTestingModule,
        MatGridListModule,
      ]
    })
      .compileComponents();
    httpMock = TestBed.inject(HttpClientTestingModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should add 3 columns of skills', () => {
    expect(component).toBeTruthy();
    component = fixture.debugElement.componentInstance;
    component.skills = [
      {
        "name": "PHP",
        "percentage": 85,
        "category": "skills"
      },
      {
        "name": "Javascript",
        "percentage": 90,
        "category": "skills"
      },
      {
        "name": "Typescript",
        "percentage": 95,
        "category": "skills"
      },
      {
        "name": "CSS3 / SASS",
        "percentage": 80,
        "category": "skills"
      },
      {
        "name": "C#",
        "percentage": 70,
        "category": "skills"
      },
      {
        "name": "Angular(JS)",
        "percentage": 95,
        "category": "framework"
      },
      {
        "name": "Laravel",
        "percentage": 95,
        "category": "framework"
      },
      {
        "name": "Codeigniter",
        "percentage": 75,
        "category": "framework"
      },
      {
        "name": "dot.net",
        "percentage": 75,
        "category": "framework"
      },
      {
        "name": "NodeJS",
        "percentage": 70,
        "category": "framework"
      },
      {
        "name": "OOP",
        "percentage": 90,
        "category": "other"
      },
      {
        "name": "Functional programming",
        "percentage": 95,
        "category": "other"
      },
      {
        "name": "Reactive Programming",
        "percentage": 95,
        "category": "other"
      },
      {
        "name": "RxJS",
        "percentage": 90,
        "category": "other"
      },
      {
        "name": "Ngrx Store",
        "percentage": 90,
        "category": "other"
      }
    ]; // Assign stub to component property

    component.ngOnInit();
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.skillbar-title'))).toBeTruthy();

    // there should be 3 tiles
    expect(fixture.debugElement.query(By.css('mat-grid-tile:nth-child(3)'))).toBeTruthy();

  });
});
