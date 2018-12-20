import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { PatientsStore } from './patients.store';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Patient} from './patient.model';
// import {VISIBILITY_FILTER} from '../filter/filter.model';

@Injectable({ providedIn: 'root' })
export class PatientsService {

  private api_path = 'emr/patients';

  private api_json_path = this.api_path + '.json';

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  constructor(private patientsStore: PatientsStore, private http: HttpClient) {
    this.get();
  }

  get() {
    this.http.get(`${environment.API_HTTP_URL}` + this.api_json_path).subscribe((entities) => {
      debug(this.api_path + ' get enttities: ', entities);
      this.patientsStore.set(entities);
    });
  }

  add(data) {
    debug(this.api_path + ' add data:', data);
    this.http.post(`${environment.API_HTTP_URL}` + this.api_json_path, data, this.httpOptions).subscribe((entity) => {
      debug('patients add enttity: ', entity);
      this.patientsStore.add(<Patient | Patient[]>entity);
    });
  }

  delete(id: ID) {
    this.http.delete(`${environment.API_HTTP_URL}`  + this.api_path + '/' + `${id}` + '.json', this.httpOptions).subscribe((entity) => {
      debug(this.api_path + ' delete enttity: ', id);
      this.patientsStore.remove(id);
    });
  }

  update(id: ID, data) {
    this.http.put(`${environment.API_HTTP_URL}` +  this.api_path + '/' + `${id}` + '.json', data, this.httpOptions).subscribe((entity) => {
      debug(this.api_path + ' update enttity: ', entity, data);
      this.patientsStore.update(id, data);
    });
  }

  /*
  updateFilter(filter: VISIBILITY_FILTER) {
    this.patientsStore.updateRoot({
      ui: {
        filter
      }
    });
  }

  complete({ id, completed }: Patient) {
    const payload = {
      id: id,
      completed: completed
    };
    debug('complete updated:', payload);
    this.update(id, payload);
  }
  */
}

const DEBUG = true;
function debug(...stuff) {if (DEBUG) {console.log(stuff); }}
