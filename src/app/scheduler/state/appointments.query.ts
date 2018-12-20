import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { AppointmentsStore, AppointmentsState } from './appointments.store';
import { Appointment } from './appointment.model';
import {combineLatest} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentsQuery extends QueryEntity<AppointmentsState, Appointment> {
  // selectVisibilityFilter$ = this.select(state => state.ui.filter);

  selectVisibleAppts$ = combineLatest(
    // this.selectVisibilityFilter$,
    this.selectAll()
  );

  constructor(protected store: AppointmentsStore) {
    super(store);
  }

}
