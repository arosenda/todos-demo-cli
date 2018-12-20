import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { AppointmentsStore } from './appointments.store';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Appointment} from './appointment.model';
// import {VISIBILITY_FILTER} from '../filter/filter.model';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {

  private api_path = 'emr/events';

  private api_json_path = this.api_path + '.json';

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  constructor(private appointmentsStore: AppointmentsStore, private http: HttpClient) {
    this.get();
  }

  get() {
    this.http.get(`${environment.API_HTTP_URL}` + this.api_json_path).subscribe((entities) => {
      debug(this.api_path + ' get enttities: ', entities);
      this.appointmentsStore.set(entities);
    });
  }

  add(data) {
    debug(this.api_path + ' add data:', data);
    this.http.post(`${environment.API_HTTP_URL}` + this.api_json_path, data, this.httpOptions).subscribe((entity) => {
      debug('appointments add enttity: ', entity);
      this.appointmentsStore.add(<Appointment | Appointment[]>entity);
    });
  }

  delete(id: ID) {
    this.http.delete(`${environment.API_HTTP_URL}`  + this.api_path + '/' + `${id}` + '.json', this.httpOptions).subscribe((entity) => {
      debug(this.api_path + ' delete enttity: ', id);
      this.appointmentsStore.remove(id);
    });
  }

  update(id: ID, data) {
    this.http.put(`${environment.API_HTTP_URL}` +  this.api_path + '/' + `${id}` + '.json', data, this.httpOptions).subscribe((entity) => {
      debug(this.api_path + ' update enttity: ', entity, data);
      this.appointmentsStore.update(id, data);
    });
  }

  /*
  updateFilter(filter: VISIBILITY_FILTER) {
    this.appointmentsStore.updateRoot({
      ui: {
        filter
      }
    });
  }

  complete({ id, completed }: Appointment) {
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
