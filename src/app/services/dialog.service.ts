import {Injectable, Input, SimpleChanges} from '@angular/core';
import {NewFormDialogComponent} from '../forms/new-form-dialog/new-form-dialog.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  @Input() formCommand: any;

  formCommands: string[];
  formTitle: string;

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      let change = changes[propName];
      let curVal  = JSON.stringify(change.currentValue);
      if (curVal && ['new patient', 'new patient invite', 'new appointment', 'new invoice', 'new payment'].includes(curVal)) {
        // this.loadFormComponent(curVal);
      }
    }
  }

  constructor(public dialog: MatDialog) {}

  loadFormComponent(formCommand: string) {
    console.log('loadding ....');
    const dialogRef = this.dialog.open( NewFormDialogComponent, {// emrFormItem.component, {
      // width: '250px',
      position: {'top': '50px'},
      disableClose: true,
      data: {name: 'no-name', formCommand: formCommand}
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
