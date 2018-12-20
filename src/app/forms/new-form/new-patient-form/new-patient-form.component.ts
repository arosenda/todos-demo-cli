import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PatientService} from '../../../services/patientService';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-new-patient-form',
  templateUrl: './new-patient-form.component.html',
  styleUrls: ['./new-patient-form.component.scss']
})
export class NewPatientFormComponent implements OnInit {
  @Input() formModel: any = null;
  @Input() isEmbedded: true;
  patient: {'id': null};
  patientSummary: any;
  @Output() form: FormGroup;

  title = 'New Patient';

  msgs = [];

  formStatusChanged() {

  }
  constructor(
    private patientService: PatientService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      '	patient': ['', Validators.required]
    });
  }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    this.form = this.formBuilder.group({
      first_name: ['', [<any>Validators.required, <any>Validators.minLength(2)]],
      last_name: ['', [<any>Validators.required, <any>Validators.minLength(2)]],
      date_of_birth: ['', [<any>Validators.minLength(2)]],
      primary_telephone_number: ['', [<any>Validators.minLength(7)]],
      primary_email: ['', [Validators.email]],
      address_line_one: ['', [<any>Validators.minLength(2)]],
      address_line_two: ['', [<any>Validators.minLength(2)]],
      city: ['', [<any>Validators.minLength(2)]],
      state: ['', [<any>Validators.minLength(2)]],
      zipcode: ['', [<any>Validators.minLength(2)]],
      referral_name: ['', []],
      referral_number: ['', []],
      referral_email: ['', []],
      referral_note: ['', []],
      notes_cc: ['', []],
      notes_history: ['', []],
      notes_other: ['', []]
    });
  }

  saveForm(newPatient: any) {
    if (!newPatient) { return false; }
    this.patientSummary = JSON.stringify(newPatient, this.replacer);
    if (this.patient) {
      const result = this.patientService.update(newPatient.id, this.patientSummary).subscribe(result=> {
        this.patient = result;
        // this.onPatientUpdate.emit(patient);
        // console.log('update result' + result);
        // console.log('update json' + JSON.stringify(result));
        this.msgs = [];
        this.msgs.push({severity:'info', summary: 'Success', detail: 'Saved Patient'});
      });
    } else {
      // this.messageService.showSuccess('Success', 'Your appointment was created.');
      const result = this.patientService.add(newPatient).subscribe(result=> {
        this.patient = result;
        // this.onPatientUpdate.emit(patient);
        console.log('add result' + result);
        console.log('add json' + JSON.stringify(result));
        this.msgs = [];
        this.msgs.push({severity:'info', summary: 'Success', detail: 'Saved Patient'});
      });
   }
  }

  checkform(): any {
    this.msgs = [];
    if (this.form.dirty) {
      this.msgs.push({severity: 'warn', summary: 'Warning', detail: 'There are unsaved changes'});
    }
    return this.msgs;
  }

  replacer(key: any, value: any): any {
    if (!value) { return null; }
    if (typeof value === 'object') {
      if (value.hasOwnProperty('name')) {
        return value.name;
      }
    }
    return value;
  }




  /*
  values: any;
  // put this in html (keyup)="onKey($event)"
  onKey(event: KeyboardEvent) { // with type info
        const field = (<HTMLInputElement>event.target).value;
        if (!field) { return null; }
        console.log(typeof field);
        if (typeof field === 'string') {
            console.log(JSON.stringify(field, this.replacer));
        }
    }
  onRender() {
    console.log('onRender');
  }
  onSubmit(value: any) {
    console.log('onSubmit');
    console.log(value);
  }
  onChange(value: any) {
    console.log('onChange');
    console.log(value);
  }

  onBlur($event) {
    console.log(`BLUR event on ${$event.model.id}: `, $event);
  }
  onFocus($event) {
    console.log(`FOCUS event on ${$event.model.id}: `, $event);
  }
  */


}

