import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {SelectItem} from 'primeng/api';
import * as _ from 'underscore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PatientsQuery, PatientsService} from '../state';
import {Observable} from 'rxjs';
import {Appointment} from '../../scheduler/state';
import {NewFormDialogComponent} from '../../forms/new-form-dialog/new-form-dialog.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-patient-selector',
  templateUrl: './patient-selector.component.html',
  styleUrls: ['./patient-selector.component.scss']
})
export class PatientSelectorComponent implements OnInit {

  @Input() patientId;
  @Input() resetAfterSelectionEmit = false;

  @Output() onPatientSelected = new EventEmitter<any>();

  private patients: any; private selectedPatient = null; private selectFocused: boolean;

  private dialogIsOpen = false;

  order = 'last_name'; private newPatient = null;

  constructor(private patientsService: PatientsService, private patientsQuery: PatientsQuery, private dialog: MatDialog) {
    // this.patientsService.get();
    this.selectedPatient = null;
  }

  ngOnInit() {
    debug('getting patients for selector', this.patientId);
    this.patientsQuery.selectAll()
      .subscribe(patients => {
        debug('updating patients', patients);
        const newPatient = this.patients ? patients.filter(item => this.patients.indexOf(item) < 0) : [];
        this.patients = patients;
        for (const pat of this.patients) {
          if (this.patientId) {
            // console.log('checking patient id:', pat);
            if (pat.id === this.patientId) {
              // console.log('setting selected patient...');
              this.selectedPatient = pat;
            }
          }
        }
        debug('testing new patient: ', newPatient);
        if (newPatient && newPatient.length === 1) {
          debug('setting selectedPAtient', newPatient[0]);
          this.selectedPatient = newPatient[0];
          this.onPatientSelect(this.selectedPatient);
        }
      });
  }

  onNewPatient(event) {
    if (event.isUserInput) {
      debug('new Patient selected: ', event);
      this.loadFormComponent('new patient', null);
    }
  }
  onPatientSelect(event) { // You can give any function name
    debug('Patient selected: ', event);
    this.onPatientSelected.emit(event);
    if (this.resetAfterSelectionEmit) {
      this.selectedPatient = null;
      this.selectFocused = false;
    }
  }

  loadFormComponent(formCommand: string, event = null) {
    if (this.dialogIsOpen) {return; }
    const apptFormRef = this.dialog.open( NewFormDialogComponent, {// emrFormItem.component, {
      width: '700px',
      height: '640px',
      position: {'top': '10px'},
      disableClose: false,
      data: {formName: 'no-name', formCommand: formCommand, formModel: event}
    });
    apptFormRef.afterClosed().subscribe(result => {
      // this.reload();
      debug('new patient dialog close result:', result);
      this.dialogIsOpen = false;
    });
  }
}

const DEBUG = true;
function debug(...stuff) {if (DEBUG === true) {console.log(stuff); }}
