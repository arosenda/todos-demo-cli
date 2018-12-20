import {Component, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PaymentService} from '../../../services/paymentService';
import {MessageService, SelectItem} from 'primeng/api';
import {PatientService} from '../../../services/patientService';
import {CustomValidator} from '../../../validators/validation';

@Component({
  selector: 'app-new-payment-form',
  templateUrl: './new-payment-form.component.html',
  styleUrls: ['./new-payment-form.component.scss']
})

export class NewPaymentFormComponent implements OnInit {
  @Input() formModel: any = null;
  selectedPatient: any;
  @Output() form: FormGroup;
  title = 'New Payment';
  payment: {'id': null};
  formSummary: any;
  formMessages = [];
  dataService: PaymentService;
  formData: {'id': null};
  depositModel = new Date();
  patients: any;
  patientsList: SelectItem[];
  patientOptions: SelectItem[]; paymentOptions: SelectItem[];
  patientName: any;
  patientNameControl: any;
  amount: any;
  submitted = false;
  msgs = [];

  /* what I want is autoform
    you give form control and it handles the html gen

   */
  constructor(private paymentService: PaymentService, private patientService: PatientService,
              private messageService: MessageService,
              private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      '	payment': ['', Validators.required]
    });
    this.dataService = paymentService;
  }

  ngOnInit() {
    this.initForm();
    this.paymentOptions = [];
    this.paymentOptions.push({label: 'Check', value:{id:1, name: 'check'}});
    this.paymentOptions.push({label: 'Credit Card', value:{id:2, name: 'cc'}});
    this.paymentOptions.push({label: 'Cash', value:{id:3, name: 'cash'}});
    this.paymentOptions.push({label: 'Bank Xfer', value:{id:4, name: 'bank'}});
    this.paymentOptions.push({label: 'Other', value:{id:4, name: 'other'}});

  }
  patientSelected(e) {
    console.log('new payment for: ' +  JSON.stringify(e));
    console.log(e.value.id);
    this.selectedPatient = e;
    console.log(this.form.controls);
    this.form.controls['patient_id'].setValue(e.value.id);
    console.log(this.form.controls);
  }
  // Here are functions related to data form
  initForm() {
    this.form = this.formBuilder.group({
      patient_id: ['', [<any>Validators.required]],
      provider_id: ['', []],
      payer_name: ['', []],
      payment_date: ['', []],
      deposit_date: ['', []],
      invoice_date: ['', []],
      payment_type: ['', []],
      amount: ['', [<any>Validators.required, CustomValidator.numberValidator]],
      note: ['', []]
    });
    this.patientNameControl = this.form.controls['patient_name'];
  }

  saveForm(newFormData: any) {
    this.submitted = true;
    if (!newFormData) { return false; }
    // stop here if form is invalid
    console.log('saving ... ' + JSON.stringify(newFormData));
    if (newFormData.invalid) {
      console.log('invalid form');
      return;
    }
    this.formSummary = JSON.stringify(newFormData, this.replacer);
    if (this.formData) {
      const result = this.dataService.update(newFormData.id, this.formSummary).subscribe(result => {
        this.formData = result;
        // this.onPaymentUpdate.emit(payment);
        console.log('update result' + result);
        console.log('update json' + JSON.stringify(result));
      });
    } else {
      const result = this.dataService.add(this.processSubmission(newFormData)).subscribe(result => {
        this.formData = result;
        // this.onPaymentUpdate.emit(payment);
        console.log('add result' + result);
        console.log('add json' + JSON.stringify(result));
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

  processSubmission(data) {
    var newData = data;
    newData['patient_id'] = this.selectedPatient.value.id;
    newData['payment_type'] = data['payment_type']['name'];
    return newData;
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

}
