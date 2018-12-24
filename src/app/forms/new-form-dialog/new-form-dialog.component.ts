import {Component, ElementRef, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {KeyFilterModule} from 'primeng/keyfilter';
// import {EmrFormDialogData} from '../../domain/emrFormDialogData';

export interface FormDialogData {
  formCommand: string;
  formModel: any;
  formName: string;
}

@Component({
  selector: 'app-new-form-dialog',
  templateUrl: './new-form-dialog.component.html',
  styleUrls: ['./new-form-dialog.component.scss']
})
export class NewFormDialogComponent implements OnInit {
  formCommand: string;
  formModel: any;
  isFormValid: false;

  constructor(public dialogRef: MatDialogRef<NewFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: FormDialogData) {
    this.formCommand = data.formCommand;
    this.formModel = data.formModel;
  }

  ngOnInit() {
  }
  save() {
    debug('saving form...');
    if (this.isFormValid) {
      debug('form invalid');
    }
    else {debug('form is valid');}
    // this.dialogRef.close(this.formValues); // this.form.value);
  }
  onUpdate(result) {
    debug('form dialog update: ', result);
    if (['save', 'delete'].includes(result.event)) {
      this.close(result);
    }
  }
  close(result) {
    debug('closing here ...', this.formCommand);
    if (this.formCommand === 'new appointment') {this.dialogRef.close(result); return; }
    if (this.formCommand === 'new patient') {this.dialogRef.close(result); return; }
    if(confirm('Are you sure to you want to close this form? ... this cannot be retrieved until saved!')) {
      this.dialogRef.close(result); return;
    }
  }
}

const DEBUG = true;
function debug(...stuff) {if (DEBUG) {console.log(stuff);}}
