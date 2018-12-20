import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPaymentFormComponent } from './new-payment-form.component';

describe('NewPaymentFormComponent', () => {
  let component: NewPaymentFormComponent;
  let fixture: ComponentFixture<NewPaymentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPaymentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
