import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {FormBuilder} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  urlStub = 'settings';
  endpoint = 'http://localhost:3000/emr/';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  settings: Observable<{}>; // <Invoice[]>;
  private _settings: Subject<{}>;
  private dataStore: { settings: {}};

  private defaultSettings = {
    useGoogleCalendar: false,
    googleCalendarId: 'rosendahl.md@gmail.com'
  };

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.dataStore = { settings: this.defaultSettings };
    this._settings = <BehaviorSubject<[]>>new BehaviorSubject(this.dataStore.settings);
    this.settings = this._settings.asObservable();
    // this.loadAll();
  }

  get(): Observable<any> {
    return this.settings;
  }

}
