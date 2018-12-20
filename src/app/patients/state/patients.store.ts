import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Patient } from './patient.model';

export interface PatientsState extends EntityState<Patient> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'patients' })
export class PatientsStore extends EntityStore<PatientsState, Patient> {

  constructor() {
    super();
  }

}

