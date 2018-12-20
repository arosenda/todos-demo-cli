import {Component, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService, SelectItem} from 'primeng/api';
import {InvoiceService} from '../../../services/invoice.service';
import {PatientService} from '../../../services/patientService';
import {CustomValidator} from '../../../validators/validation';

@Component({
  selector: 'app-new-invoice-form',
  templateUrl: './new-invoice-form.component.html',
  styleUrls: ['./new-invoice-form.component.scss']
})
export class NewInvoiceFormComponent implements OnInit {
  @Input() formModel: any = null;
  selectedPatient: any;
  @Output() form: FormGroup;

  title = 'New Invoice';

  invoice: {'id': null};
  formSummary: any;
  formMessages = [];
  dataService: InvoiceService;
  formData: {'id': null};
  depositModel = new Date();
  patients: any;
  patientsList: SelectItem[];
  patientOptions: SelectItem[]; invoiceOptions: SelectItem[];
  patientName: any;
  patientNameControl: any;
  amount: any;
  submitted = false;
  msgs = [];

  /* what I want is autoform
    you give form control and it handles the html gen

   */
  constructor(private invoiceService: InvoiceService, private patientService: PatientService,
              private messageService: MessageService,
              private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      '	invoice': ['', Validators.required]
    });
    this.dataService = invoiceService;
  }

  /*
id: integer, patient_id: integer, provider_id: integer,
payee_name: string, invoice_date: date,
period_start_date: date, period_end_date: date,
session_number: integer, amount: float, note: string,
created_at: datetime, updated_at: datetime
 */
  ngOnInit() {
    this.initForm();
    this.invoiceOptions = [];
  }

  patientSelected(e) {this.selectedPatient = e}
  // Here are functions related to data form
  initForm() {
    this.form = this.formBuilder.group({
      patient_id: ['', [<any>Validators.required]],
      provider_id: ['', []],
      invoice_date: ['', []],
      session_number: ['', []],
      amount: ['', [<any>Validators.required, CustomValidator.numberValidator]],
      note: ['', []]
    });
  }

  saveForm(newFormData: any) {
    this.submitted = true;
    if (!newFormData) { return false; }
    // stop here if form is invalid
    if (newFormData.invalid) {
      console.log('invalid form');
      return;
    }
    this.formSummary = JSON.stringify(newFormData, this.replacer);
    if (this.formData) {
      const result = this.dataService.update(newFormData.id, this.formSummary).subscribe(result => {
        this.formData = result;
        // this.onInvoiceUpdate.emit(invoice);
        console.log('update result' + result);
        console.log('update json' + JSON.stringify(result));
      });
    } else {
      const result = this.dataService.add(this.processSubmission(newFormData)).subscribe(result => {
        this.formData = result;
        // this.onInvoiceUpdate.emit(invoice);
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
    newData['patient_id'] = this.selectedPatient['id'];
    newData['invoice_type'] = data['invoice_type']['name'];
    console.log(newData);
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

