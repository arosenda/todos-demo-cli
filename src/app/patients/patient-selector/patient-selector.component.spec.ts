import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSelectorComponent } from './patient-selector.component';

describe('PatientSelectorComponent', () => {
  let component: PatientSelectorComponent;
  let fixture: ComponentFixture<PatientSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
