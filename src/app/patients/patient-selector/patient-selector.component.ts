import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {SelectItem} from 'primeng/api';
import * as _ from 'underscore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PatientsQuery, PatientsService} from '../state';
import {Observable} from 'rxjs';
import {Appointment} from '../../scheduler/state';

@Component({
  selector: 'app-patient-selector',
  templateUrl: './patient-selector.component.html',
  styleUrls: ['./patient-selector.component.scss']
})
export class PatientSelectorComponent implements OnInit {

  @Input() patient_id = null;
  @Input() resetAfterSelectionEmit = false;

  @Output() onPatientSelected = new EventEmitter<any>();

  private patients: any; private selectedPatient = null; private selectFocused: boolean;

  constructor(private patientsService: PatientsService, private patientsQuery: PatientsQuery, private formBuilder: FormBuilder) {
    this.patientsService.get();
    this.selectedPatient = null;
  }

  ngOnInit() {
    this.patientsQuery.selectAll()
      .subscribe(patients => {
        this.patients = patients;
        for (const pat of this.patients) {
          if (this.patient_id) {
            console.log('checking patient id:', pat);
            if (pat.id === this.patient_id) {
              console.log('setting selected patient...');
              this.selectedPatient = pat;
            }
          }
        }
      });
  }

  onPatientSelect(event) { // You can give any function name
    console.log('Patient selected: ' + event);
    this.onPatientSelected.emit(event);
    if (this.resetAfterSelectionEmit) {
      this.selectedPatient = null;
      this.selectFocused = false;
    }
  }
}
