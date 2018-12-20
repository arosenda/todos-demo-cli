import {Component, ElementRef, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
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
    console.log('saving form...');
    if (this.isFormValid) {
      console.log('form invalid');
    }
    else {console.log('form is valid');}
    // this.dialogRef.close(this.formValues); // this.form.value);
  }
  onEventUpdate(event) {
    this.close();
  }
  close() {
    if (this.formCommand === 'new appointment') {this.dialogRef.close(); return }
    if(confirm('Are you sure to you want to close this form? ... this cannot be retrieved until saved!')) {
      this.dialogRef.close();
    }
  }
}
