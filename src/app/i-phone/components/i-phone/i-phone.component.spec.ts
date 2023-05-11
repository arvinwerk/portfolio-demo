import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IPhoneComponent } from './i-phone.component';

describe('IPhoneComponent', () => {
  let component: IPhoneComponent;
  let fixture: ComponentFixture<IPhoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IPhoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
