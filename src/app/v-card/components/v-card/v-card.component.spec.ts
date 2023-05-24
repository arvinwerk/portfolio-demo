import {ComponentFixture, TestBed} from '@angular/core/testing';

import {VCardComponent} from './v-card.component';

describe('VCardComponent', () => {
  let component: VCardComponent;
  let fixture: ComponentFixture<VCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should have added the personal data', () => {
    expect(component).toBeTruthy();
    const personal = {
      dateOfBirth: '',
      developingStartDate: '',
      education: '',
      email: '',
      foreword: '',
      fullName: 'Jan Klaassen',
      function: 'Developer',
      github: '',
      githubDescription: '',
      linkedIn: '',
      location: '',
      portfolioUrl: ''

    }
    component.personal = personal; // Assign stub to component property

    component.ngOnInit();
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.debugElement.nativeElement.querySelector('h4').innerHTML).toBe(personal.fullName);
    expect(fixture.debugElement.nativeElement.querySelector('h6').innerHTML).toBe(personal.function);
  });
});
