import { Component, OnInit } from '@angular/core';
import {NewFormDialogComponent} from '../forms/new-form-dialog/new-form-dialog.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent implements OnInit {

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
  }

  loadFormComponent(formCommand: string) {
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
