import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { TodosStore } from './todos.store';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Todo} from './todo.model';
import {VISIBILITY_FILTER} from '../filter/filter.model';

@Injectable({ providedIn: 'root' })
export class TodosService {

  private api_path = 'todos';

  private api_json_path = this.api_path + '.json';

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  constructor(private todosStore: TodosStore, private http: HttpClient) {
    this.get();
  }

  get() {
    this.http.get(`${environment.API_HTTP_URL}` + this.api_json_path).subscribe((entities) => {
      debug(this.api_path + ' get enttities: ', entities);
      this.todosStore.set(entities);
    });
  }

  add(data) {
    debug(this.api_path + ' add data:', data);
    this.http.post(`${environment.API_HTTP_URL}` + this.api_json_path, data, this.httpOptions).subscribe((entity) => {
      debug('todos add enttity: ', entity);
      this.todosStore.add(<Todo | Todo[]>entity);
    });
  }

  delete(id: ID) {
    this.http.delete(`${environment.API_HTTP_URL}`  + this.api_path + '/' + `${id}` + '.json', this.httpOptions).subscribe((entity) => {
      debug(this.api_path + ' delete enttity: ', id);
      this.todosStore.remove(id);
    });
  }

  update(id: ID, data) {
    this.http.put(`${environment.API_HTTP_URL}` +  this.api_path + '/' + `${id}` + '.json', data, this.httpOptions).subscribe((entity) => {
      debug(this.api_path + ' update enttity: ', entity, data);
      this.todosStore.update(id, entity);
    });
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.todosStore.updateRoot({
      ui: {
        filter
      }
    });
  }

  complete({ id, completed }: Todo) {
    const payload = {
      id: id,
      completed: completed
    };
    debug('complete updated:', payload);
    this.update(id, payload);
  }
}

const DEBUG = true;
function debug(...stuff) {if (DEBUG) {console.log(stuff);}}
