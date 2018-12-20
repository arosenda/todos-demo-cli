import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { PatientsStore, PatientsState } from './patients.store';
import { Patient } from './patient.model';
import {combineLatest} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PatientsQuery extends QueryEntity<PatientsState, Patient> {
  // selectVisibilityFilter$ = this.select(state => state.ui.filter);

  selectVisibleAppts$ = combineLatest(
    // this.selectVisibilityFilter$,
    this.selectAll()
  );

  constructor(protected store: PatientsStore) {
    super(store);
  }
}
