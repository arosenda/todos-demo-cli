import {Injectable, NgZone, OnInit, EventEmitter, Output} from '@angular/core';
import { environment } from '../../../environments/environment';
import {HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { Event} from './event'
import {Observable, BehaviorSubject, throwError} from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {catchError, map, tap} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';
// import {GoogleApiService, GoogleAuthService} from 'ng-gapi';
// import {GoogleService} from './google.service';
// import {UserSettingsService} from './user-settings.service';
import {FormBuilder} from '@angular/forms';
import {UserSettingsService} from '../../services/user-settings.service';

@Injectable()
export class EventService implements OnInit {

  urlStub = 'templates';
  endpoint = 'http://localhost:3000/emr/';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  private api_stub = 'emr/events';
  private api_json_stub = this.api_stub + '.json';

  private serviceUrl = 'http://localhost:3000/emr/events.json';
  private baseUrl = 'http://localhost:3000/emr';

  private userSettings = {};

  events: Observable<any[]>
  private _events: BehaviorSubject<any[]>;
  private dataStore: {events: any[] };

  constructor(private http: HttpClient,
              // private googleAuthService: GoogleAuthService,
              private ngZone: NgZone,
              // private gapiService: GoogleApiService,
              private userSettingsService: UserSettingsService,
              // private googleService: GoogleService
  ) {

    this.dataStore = { events: [] };
    this._events = <BehaviorSubject<[]>>new BehaviorSubject(EVENTS);
    this.events = this._events.asObservable();
  }

  ngOnInit() {
    this.userSettingsService.get().subscribe( data => {
      this.userSettings = data;
      console.log('user settings:', data);
      this.loadAll();
    }, err => console.log('error with getting user settings', err));
  }
  initAsNeeded() {
    if (this.dataStore.events.length === 0) {this.loadAll(); }
  }

  loadAll(): any {
    // this.messageService.showInfo("Info", "Loading Events...");
    console.log('EventService: Beginning loadAll()');
    this.http.get(`${environment.API_HTTP_URL}` + this.api_json_stub).map(response => this.extractData(response)).
      subscribe(data => {
          // console.debug("EventService: Processing data from loadAll()");
          this.dataStore.events = EVENTS;
          this._events.next(Object.assign({}, this.dataStore).events);
      },
      error => this.handleError(error));
  }


  // pasted from outside source
  getAll(): Observable<any> {
    return this.http.get(`${environment.API_HTTP_URL}/` + this.api_json_stub).pipe(
      map(this.extractData));
  }

  getEvents(start, end): Observable<any> {
    console.log('getting events ...');
    console.log(this.userSettings);
    if (this.userSettings['useGoogleCalendar'] === true) {
          if (this.userSettings['googleCalendarId']) {
            console.log('retrieving calendar events for ' + this.userSettings['googleCalendarId'] );
            //return this.googleService.getGoogleCalendarEvents(this.userSettings['googleCalendarId'], start, end);
          }
          else {
            console.log("no google calendar id");
          }
    }
    else {
      console.log("google Cal toggle off");
      console.log("getting internal events");
      return this._events.asObservable();
    }
  }

  getGoogleEvents(calendarId, start, end) {
    console.log('getting google events')
  }
  get(id: number): Observable<any> {
    return this.http.get<Event>(this.buildIdUrl(id)).pipe(
      map(this.extractData));
  }

  create(eventJson: any) {
    const subscription = this.http.post(`${environment.API_HTTP_URL}` + this.api_json_stub, JSON.stringify(eventJson), this.httpOptions)
      .subscribe(data => {
        const event = <Event>data;
        this.dataStore.events.push(event);
        this._events.next(Object.assign({}, this.dataStore).events);
      }, error => console.log('Could not create event.'));
  }

  add(data): Observable<any> {
    const url = `${environment.API_HTTP_URL}` + this.api_json_stub;
    console.log('url', url);
    return this.http.post<any>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`added event`)),
      catchError(this.handleError(null))
    );
  }
  update (id, data): Observable<any> {
    return this.http.put(this.buildIdUrl(id), (
      JSON.stringify(this.removeUnpermittedParameters(data))), this.httpOptions).pipe(
      tap(_ => console.log(`updated patient id=${id}`)),
      catchError(this.handleError<any>('update'))
    );
  }

  delete (id): Observable<any> {
    console.log('deleting here: ' + id);
    return this.http.delete<any>(this.buildIdUrl(id), this.httpOptions).pipe(
      tap(_ => console.log(`deleted id=' + ${id}`)),
      catchError(this.handleError<any>('delete'))
    );
  }

  buildIdUrl(id: any) {
    return `${environment.API_HTTP_URL} + '/' + this.api_stub + '/' + ${id}` + '.json';
  }
  removeUnpermittedParameters(submission): any {
    delete submission.id;
    delete submission.created_at;
    delete submission.updated_at;
    return submission;

  }
  private extractDataOld(res: Response) {
    let body = res;
    return body || { };
  }

  // returns a calevent (event for full calendar different than event model)
    saveEvent(newEventJson: any): any {
        const body = newEventJson;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'charset': 'utf-8'
            })
        };
        return this.http.post(`${this.baseUrl}/events.json`, body, httpOptions); // .share();
    }

  private extractData(res: any) {
    if (res.status < 200 || res.status >= 300) {
      console.log('error in extracting data:');
      throw new Error('Bad response status: ' + res.status);
    }
    const body = res.json();
    console.log('extracted data');
    console.log(body);
    return body || { };
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  private handleError2 (error: any) {
    const errMsg = error.message || 'Event Service error';
    console.log('EventService: error: ' + errMsg);

    // return Observable.throw(errMsg);
  }

  oldupdate(eventId: any, eventJson: any, callBackFunction: Function) {
      let body: any;
      body = eventJson;
      const httpOptions = {
          headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'charset': 'utf-8'
          })
      };

    return this.http.put(`${this.baseUrl}/events/${eventId}.json`, body, httpOptions)
        .subscribe(
        data => {
          console.log('update success');
          this.dataStore.events.forEach((t, i) => {
            const event = <Event>data;
            if (t.id === event.id) {
              this.dataStore.events[i] = event;
            }
          });

          this._events.next(Object.assign({}, this.dataStore).events);

          callBackFunction(data);
        },

        error => {callBackFunction(null);
          console.log('error: ' + error); }
      );
  }



  oldgetEvents() { // legacy stuff
    return this.http.get('assets/demo/data/scheduleevents.json')
      .toPromise()
      .then(res => <any[]> res)
      .then(data => data);
  }

  oldgetEvent(id: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/${id}.json`).map(response => response);
  }


  oldload(id: number | string): any {
    console.log('loading event id:' + id);
    return this.http.get(`${this.baseUrl}/events/${id}.json`).subscribe(data => {
      let notFound = true;
      const event = <Event>data;
      this.dataStore.events.forEach((item, index) => {
        if (item.id === event.id) {
          this.dataStore.events[index] = event;
          notFound = false;
        }
      });

      if (notFound) {
        console.log('event grabbed from db not found ... will write to datastore');
        this.dataStore.events.push(event);
      }

      this._events.next(Object.assign({}, this.dataStore).events);
      console.log('sending back data from event service');
      console.log(data);
      return data;
    }, error => console.log('Could not load event.'));
  }



 oldupdateMap(eventId: any, eventJson: any) {
      let body: any;
      body = eventJson;
      const httpOptions = {
          headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'charset': 'utf-8'
          })
      };

    return this.http.put(`${this.baseUrl}/events/${eventId}.json`, body, httpOptions)
      .subscribe(data => {
        this.dataStore.events.forEach((t, i) => {
          const event = <Event>data;
          if (t.id === event.id) {
            this.dataStore.events[i] = event;
          }
        });

        this._events.next(Object.assign({}, this.dataStore).events);
      },  error => console.log('Could not update event.'));
  }

  oldremove(eventId: number) {
    this.http.delete(`${this.baseUrl}/events/${eventId}.json`).subscribe(response => {
      this.dataStore.events.forEach((t, i) => {
        if (t.id === eventId) { this.dataStore.events.splice(i, 1); }
      });

      this._events.next(Object.assign({}, this.dataStore).events);
    }, error => console.log('Could not delete event.'));
  }
}


const EVENTS = [
  {
    "id": "_70q30chh6l14aba36p148b9k6h0k6b9p7523aba58gr30c9i6cq3gcpj6o_20181205T010000Z",
    "title": "EC Meeting",
    "start": "2018-12-04T20:00:00-05:00",
    "end": "2018-12-04T21:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzcwcTMwY2hoNmwxNGFiYTM2cDE0OGI5azZoMGs2YjlwNzUyM2FiYTU4Z3IzMGM5aTZjcTNnY3BqNm9fMjAxODEyMDVUMDEwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6kp38c21890jcb9p84r38b9k6h23gba17533ab9n6h334e9g65246dhi70",
    "title": "Cooper Appt",
    "start": "2018-12-10T10:20:00-05:00",
    "end": "2018-12-10T11:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZrcDM4YzIxODkwamNiOXA4NHIzOGI5azZoMjNnYmExNzUzM2FiOW42aDMzNGU5ZzY1MjQ2ZGhpNzAgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "h967v1sn36od1liqgepohsveg4_20181217T170000Z",
    "title": "peer supervision here",
    "start": "2018-12-17T12:00:00-05:00",
    "end": "2018-12-17T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=aDk2N3Yxc24zNm9kMWxpcWdlcG9oc3ZlZzRfMjAxODEyMTdUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_68o44da26oo4ab9i88p4cb9k64p36b9o692j0ba2692j0d9l74ojig9n60_20181214T120000Z",
    "title": "Michael Levine",
    "start": "2018-12-14T07:00:00-05:00",
    "end": "2018-12-14T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY4bzQ0ZGEyNm9vNGFiOWk4OHA0Y2I5azY0cDM2YjlvNjkyajBiYTI2OTJqMGQ5bDc0b2ppZzluNjBfMjAxODEyMTRUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_68o44da26oo4ab9i88p4cb9k64p36b9o692j0ba2692j0d9l74ojig9n60_20181221T120000Z",
    "title": "Michael Levine",
    "start": "2018-12-21T07:00:00-05:00",
    "end": "2018-12-21T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY4bzQ0ZGEyNm9vNGFiOWk4OHA0Y2I5azY0cDM2YjlvNjkyajBiYTI2OTJqMGQ5bDc0b2ppZzluNjBfMjAxODEyMjFUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_8gq3aca584q3aba66spjab9k8d2j6b9p6kp3aba56gqk8cph71138dq46c",
    "title": "Alexa Steinbuch",
    "start": "2018-12-05T08:40:00-05:00",
    "end": "2018-12-05T09:25:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzhncTNhY2E1ODRxM2FiYTY2c3BqYWI5azhkMmo2YjlwNmtwM2FiYTU2Z3FrOGNwaDcxMTM4ZHE0NmMgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "4brqhg0vfeh3r2hlgsc77hun62",
    "title": "leslie kaplan",
    "start": "2018-12-19T14:30:00-05:00",
    "end": "2018-12-19T15:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NGJycWhnMHZmZWgzcjJobGdzYzc3aHVuNjIgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_95hm2r1p6gpjadhp6pim4cj564s6aoph74r3go9h6dj38phicgs66cr46s_20181130T163000Z",
    "title": "Analysis",
    "start": "2018-11-30T11:30:00-05:00",
    "end": "2018-11-30T12:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFwNmdwamFkaHA2cGltNGNqNTY0czZhb3BoNzRyM2dvOWg2ZGozOHBoaWNnczY2Y3I0NnNfMjAxODExMzBUMTYzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1p6gpjadhp6pim4cj564s6aoph74r3go9h6dj38phicgs66cr46s_20181207T163000Z",
    "title": "Analysis",
    "start": "2018-12-07T11:30:00-05:00",
    "end": "2018-12-07T12:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFwNmdwamFkaHA2cGltNGNqNTY0czZhb3BoNzRyM2dvOWg2ZGozOHBoaWNnczY2Y3I0NnNfMjAxODEyMDdUMTYzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1p6gpjadhp6pim4cj564s6aoph74r3go9h6dj38phicgs66cr46s_20181214T163000Z",
    "title": "Analysis",
    "start": "2018-12-14T11:30:00-05:00",
    "end": "2018-12-14T12:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFwNmdwamFkaHA2cGltNGNqNTY0czZhb3BoNzRyM2dvOWg2ZGozOHBoaWNnczY2Y3I0NnNfMjAxODEyMTRUMTYzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1p6gpjadhp6pim4cj564s6aoph74r3go9h6dj38phicgs66cr46s_20181221T163000Z",
    "title": "Analysis",
    "start": "2018-12-21T11:30:00-05:00",
    "end": "2018-12-21T12:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFwNmdwamFkaHA2cGltNGNqNTY0czZhb3BoNzRyM2dvOWg2ZGozOHBoaWNnczY2Y3I0NnNfMjAxODEyMjFUMTYzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "2uakegerapfpa7ps9eb5eao6lg",
    "title": "John Snow",
    "start": "2018-12-03T13:30:00-05:00",
    "end": "2018-12-03T14:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MnVha2VnZXJhcGZwYTdwczllYjVlYW82bGcgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_6cp36h9p711j8b9g8cqj8b9k7513gba26p2jeb9j6opj2ghl88s4ae1p68_20181204T125000Z",
    "title": "Whitney McFadden",
    "start": "2018-12-04T10:05:00-05:00",
    "end": "2018-12-04T10:50:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjcDM2aDlwNzExajhiOWc4Y3FqOGI5azc1MTNnYmEyNnAyamViOWo2b3BqMmdobDg4czRhZTFwNjhfMjAxODEyMDRUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_8os3aghm64pj4b9l8cskcb9k68rj2b9o650jab9h6op3cga38os30e9k6k",
    "title": "Matthew Carpenter",
    "start": "2018-12-04T11:00:00-05:00",
    "end": "2018-12-04T11:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzhvczNhZ2htNjRwajRiOWw4Y3NrY2I5azY4cmoyYjlvNjUwamFiOWg2b3AzY2dhMzhvczMwZTlrNmsgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "0sffpbkoi7nsb1c1ok491pbdbm",
    "title": "Nathan LaLiberte",
    "start": "2018-12-04T18:30:00-05:00",
    "end": "2018-12-04T19:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MHNmZnBia29pN25zYjFjMW9rNDkxcGJkYm0gcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "0199n5t3q9hhr9m8ae3daojdk4",
    "title": "Mike Mense",
    "start": "2018-12-04T12:00:00-05:00",
    "end": "2018-12-04T12:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MDE5OW41dDNxOWhocjltOGFlM2Rhb2pkazQgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "4bhne3crj9ksebpp7f3mmrs8lr",
    "title": "Lucretia Lamora",
    "start": "2018-12-04T15:00:00-05:00",
    "end": "2018-12-04T15:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NGJobmUzY3JqOWtzZWJwcDdmM21tcnM4bHIgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_88q4ce1k8cqj8b9p8csj4b9k6sp48ba16d134b9p8p14cda28oq38c1l70",
    "title": "Peter Rihs",
    "start": "2018-12-05T07:50:00-05:00",
    "end": "2018-12-05T08:50:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzg4cTRjZTFrOGNxajhiOXA4Y3NqNGI5azZzcDQ4YmExNmQxMzRiOXA4cDE0Y2RhMjhvcTM4YzFsNzAgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_692k6g9o711jgb9g6ks48b9k8cqjeb9p6533eb9j8cq3gc1n6p134g9p70",
    "title": "Alexa Steinbuch",
    "start": "2018-12-19T08:40:00-05:00",
    "end": "2018-12-19T09:25:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY5Mms2ZzlvNzExamdiOWc2a3M0OGI5azhjcWplYjlwNjUzM2ViOWo4Y3EzZ2MxbjZwMTM0ZzlwNzAgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_74qj4ea460q34b9p8kq46b9k88o4cba170rk4b9o74q44d1g6gq3adi384",
    "title": "Robert Pennoyer ",
    "start": "2018-12-05T09:40:00-05:00",
    "end": "2018-12-05T10:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc0cWo0ZWE0NjBxMzRiOXA4a3E0NmI5azg4bzRjYmExNzByazRiOW83NHE0NGQxZzZncTNhZGkzODQgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "6u8h5ngdraa919fpclkj0gdk6p_20181205T213000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-05T16:30:00-05:00",
    "end": "2018-12-05T17:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NnU4aDVuZ2RyYWE5MTlmcGNsa2owZ2RrNnBfMjAxODEyMDVUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6u8h5ngdraa919fpclkj0gdk6p_20181212T213000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-12T16:30:00-05:00",
    "end": "2018-12-12T17:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NnU4aDVuZ2RyYWE5MTlmcGNsa2owZ2RrNnBfMjAxODEyMTJUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6u8h5ngdraa919fpclkj0gdk6p_20181219T213000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-19T16:30:00-05:00",
    "end": "2018-12-19T17:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NnU4aDVuZ2RyYWE5MTlmcGNsa2owZ2RrNnBfMjAxODEyMTlUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6u8h5ngdraa919fpclkj0gdk6p_20181226T213000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-26T16:30:00-05:00",
    "end": "2018-12-26T17:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NnU4aDVuZ2RyYWE5MTlmcGNsa2owZ2RrNnBfMjAxODEyMjZUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "2b2gl6b6ql3qp038e3jg0i93qm_20181129T232000Z",
    "title": "Jordan Hare",
    "start": "2018-11-29T18:20:00-05:00",
    "end": "2018-11-29T19:10:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MmIyZ2w2YjZxbDNxcDAzOGUzamcwaTkzcW1fMjAxODExMjlUMjMyMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "2b2gl6b6ql3qp038e3jg0i93qm_20181213T232000Z",
    "title": "Jordan Hare",
    "start": "2018-12-13T18:20:00-05:00",
    "end": "2018-12-13T19:10:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MmIyZ2w2YjZxbDNxcDAzOGUzamcwaTkzcW1fMjAxODEyMTNUMjMyMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "2b2gl6b6ql3qp038e3jg0i93qm_20181206T232000Z",
    "title": "Jordan Hare",
    "start": "2018-12-05T18:20:00-05:00",
    "end": "2018-12-05T19:10:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MmIyZ2w2YjZxbDNxcDAzOGUzamcwaTkzcW1fMjAxODEyMDZUMjMyMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6gq44ea370p42b9g8d336b9k6t2j6b9p8go30ba26sr48dho6ssjidq18k_20181220T134000Z",
    "title": "Spencer Cherry ",
    "start": "2018-12-21T10:25:00-05:00",
    "end": "2018-12-21T11:25:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZncTQ0ZWEzNzBwNDJiOWc4ZDMzNmI5azZ0Mmo2YjlwOGdvMzBiYTI2c3I0OGRobzZzc2ppZHExOGtfMjAxODEyMjBUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_95hm2r1g61hmadhk6crjecpkc9h34p9ic4r66cpk6koj2ohh6cq30d9k70_20181129T213000Z",
    "title": "Analysis",
    "start": "2018-11-29T16:30:00-05:00",
    "end": "2018-11-29T17:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFnNjFobWFkaGs2Y3JqZWNwa2M5aDM0cDlpYzRyNjZjcGs2a29qMm9oaDZjcTMwZDlrNzBfMjAxODExMjlUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1g61hmadhk6crjecpkc9h34p9ic4r66cpk6koj2ohh6cq30d9k70_20181206T213000Z",
    "title": "Analysis",
    "start": "2018-12-06T16:30:00-05:00",
    "end": "2018-12-06T17:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFnNjFobWFkaGs2Y3JqZWNwa2M5aDM0cDlpYzRyNjZjcGs2a29qMm9oaDZjcTMwZDlrNzBfMjAxODEyMDZUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1g61hmadhk6crjecpkc9h34p9ic4r66cpk6koj2ohh6cq30d9k70_20181213T213000Z",
    "title": "Analysis",
    "start": "2018-12-13T16:30:00-05:00",
    "end": "2018-12-13T17:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFnNjFobWFkaGs2Y3JqZWNwa2M5aDM0cDlpYzRyNjZjcGs2a29qMm9oaDZjcTMwZDlrNzBfMjAxODEyMTNUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1g61hmadhk6crjecpkc9h34p9ic4r66cpk6koj2ohh6cq30d9k70_20181220T213000Z",
    "title": "Analysis",
    "start": "2018-12-20T16:30:00-05:00",
    "end": "2018-12-20T17:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFnNjFobWFkaGs2Y3JqZWNwa2M5aDM0cDlpYzRyNjZjcGs2a29qMm9oaDZjcTMwZDlrNzBfMjAxODEyMjBUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "q3jcnua5igtquneds175mup12k_20181129T223000Z",
    "title": "Whitney McFadden",
    "start": "2018-11-29T17:30:00-05:00",
    "end": "2018-11-29T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=cTNqY251YTVpZ3RxdW5lZHMxNzVtdXAxMmtfMjAxODExMjlUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "q3jcnua5igtquneds175mup12k_20181206T223000Z",
    "title": "Whitney McFadden",
    "start": "2018-12-06T17:30:00-05:00",
    "end": "2018-12-06T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=cTNqY251YTVpZ3RxdW5lZHMxNzVtdXAxMmtfMjAxODEyMDZUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "q3jcnua5igtquneds175mup12k_20181213T223000Z",
    "title": "Whitney McFadden",
    "start": "2018-12-13T17:30:00-05:00",
    "end": "2018-12-13T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=cTNqY251YTVpZ3RxdW5lZHMxNzVtdXAxMmtfMjAxODEyMTNUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "q3jcnua5igtquneds175mup12k_20181220T223000Z",
    "title": "Whitney McFadden",
    "start": "2018-12-20T17:30:00-05:00",
    "end": "2018-12-20T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=cTNqY251YTVpZ3RxdW5lZHMxNzVtdXAxMmtfMjAxODEyMjBUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6cs3ic1i68s3ib9p84rk2b9k752jeba28gqk4b9h8gpjcdpg8h23gcph60",
    "title": "Eugenia Mejia",
    "start": "2018-12-07T07:00:00-05:00",
    "end": "2018-12-07T08:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjczNpYzFpNjhzM2liOXA4NHJrMmI5azc1MmplYmEyOGdxazRiOWg4Z3BqY2RwZzhoMjNnY3BoNjAgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "72ut67apscbpdjggan3apbjijh_20181130T134000Z",
    "title": "Gustavo Restrepo",
    "start": "2018-11-30T08:40:00-05:00",
    "end": "2018-11-30T09:25:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NzJ1dDY3YXBzY2JwZGpnZ2FuM2FwYmppamhfMjAxODExMzBUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "72ut67apscbpdjggan3apbjijh_20181221T134000Z",
    "title": "Gustavo Restrepo",
    "start": "2018-12-21T08:40:00-05:00",
    "end": "2018-12-21T09:25:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NzJ1dDY3YXBzY2JwZGpnZ2FuM2FwYmppamhfMjAxODEyMjFUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "45lapoujd2m6khigv0bh3glhic_20181130T125000Z",
    "title": "Josselyn Sheer",
    "start": "2018-11-30T07:50:00-05:00",
    "end": "2018-11-30T08:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NDVsYXBvdWpkMm02a2hpZ3YwYmgzZ2xoaWNfMjAxODExMzBUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "45lapoujd2m6khigv0bh3glhic_20181207T125000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-07T07:50:00-05:00",
    "end": "2018-12-07T08:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NDVsYXBvdWpkMm02a2hpZ3YwYmgzZ2xoaWNfMjAxODEyMDdUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "45lapoujd2m6khigv0bh3glhic_20181214T125000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-14T07:50:00-05:00",
    "end": "2018-12-14T08:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NDVsYXBvdWpkMm02a2hpZ3YwYmgzZ2xoaWNfMjAxODEyMTRUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "45lapoujd2m6khigv0bh3glhic_20181221T125000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-21T07:50:00-05:00",
    "end": "2018-12-21T08:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NDVsYXBvdWpkMm02a2hpZ3YwYmgzZ2xoaWNfMjAxODEyMjFUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_8kskce2488sj6ba2710j0b9k8kqj2b9p6cs3eb9j8krk6da66gq3gc9j8k_20181130T143000Z",
    "title": "Cara O'Connor",
    "start": "2018-11-30T09:30:00-05:00",
    "end": "2018-11-30T10:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzhrc2tjZTI0ODhzajZiYTI3MTBqMGI5azhrcWoyYjlwNmNzM2ViOWo4a3JrNmRhNjZncTNnYzlqOGtfMjAxODExMzBUMTQzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_8kskce2488sj6ba2710j0b9k8kqj2b9p6cs3eb9j8krk6da66gq3gc9j8k_20181207T143000Z",
    "title": "Cara O'Connor",
    "start": "2018-12-07T09:30:00-05:00",
    "end": "2018-12-07T10:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzhrc2tjZTI0ODhzajZiYTI3MTBqMGI5azhrcWoyYjlwNmNzM2ViOWo4a3JrNmRhNjZncTNnYzlqOGtfMjAxODEyMDdUMTQzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_8kskce2488sj6ba2710j0b9k8kqj2b9p6cs3eb9j8krk6da66gq3gc9j8k_20181214T143000Z",
    "title": "Cara O'Connor",
    "start": "2018-12-14T09:30:00-05:00",
    "end": "2018-12-14T10:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzhrc2tjZTI0ODhzajZiYTI3MTBqMGI5azhrcWoyYjlwNmNzM2ViOWo4a3JrNmRhNjZncTNnYzlqOGtfMjAxODEyMTRUMTQzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_8kskce2488sj6ba2710j0b9k8kqj2b9p6cs3eb9j8krk6da66gq3gc9j8k_20181221T143000Z",
    "title": "Cara O'Connor",
    "start": "2018-12-21T09:30:00-05:00",
    "end": "2018-12-21T10:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzhrc2tjZTI0ODhzajZiYTI3MTBqMGI5azhrcWoyYjlwNmNzM2ViOWo4a3JrNmRhNjZncTNnYzlqOGtfMjAxODEyMjFUMTQzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_8oq3gc9h70rk2b9n890jgb9k8csjgba26514ab9n652jeghp70ok8g9g84",
    "title": "Fred Agcaoili",
    "start": "2018-12-07T10:30:00-05:00",
    "end": "2018-12-07T11:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzhvcTNnYzloNzByazJiOW44OTBqZ2I5azhjc2pnYmEyNjUxNGFiOW42NTJqZWdocDcwb2s4ZzlnODQgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_6grk4d1o6p1j8ba48kpjib9k8kqj4ba18gq3cb9j751jac9l652j2g9h8k",
    "title": "Spencer Cherry",
    "start": "2018-12-07T13:00:00-05:00",
    "end": "2018-12-07T14:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZncms0ZDFvNnAxajhiYTQ4a3BqaWI5azhrcWo0YmExOGdxM2NiOWo3NTFqYWM5bDY1MmoyZzloOGsgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "5r1o57kp6bot4qscircrm0rq43_20181204T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-07T14:00:00-05:00",
    "end": "2018-12-07T15:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NXIxbzU3a3A2Ym90NHFzY2lyY3JtMHJxNDNfMjAxODEyMDRUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "e5hchd7cbtciadnhdels69dmvs_20181201T160000Z",
    "title": "Francis Biro",
    "start": "2018-12-01T11:00:00-05:00",
    "end": "2018-12-01T12:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=ZTVoY2hkN2NidGNpYWRuaGRlbHM2OWRtdnNfMjAxODEyMDFUMTYwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "e5hchd7cbtciadnhdels69dmvs_20181208T160000Z",
    "title": "Francis Biro",
    "start": "2018-12-08T11:00:00-05:00",
    "end": "2018-12-08T12:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=ZTVoY2hkN2NidGNpYWRuaGRlbHM2OWRtdnNfMjAxODEyMDhUMTYwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "e5hchd7cbtciadnhdels69dmvs_20181215T160000Z",
    "title": "Francis Biro",
    "start": "2018-12-15T11:00:00-05:00",
    "end": "2018-12-15T12:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=ZTVoY2hkN2NidGNpYWRuaGRlbHM2OWRtdnNfMjAxODEyMTVUMTYwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "e5hchd7cbtciadnhdels69dmvs_20181222T160000Z",
    "title": "Francis Biro",
    "start": "2018-12-22T11:00:00-05:00",
    "end": "2018-12-22T12:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=ZTVoY2hkN2NidGNpYWRuaGRlbHM2OWRtdnNfMjAxODEyMjJUMTYwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_68qk8hhh6d1jgb9m6t1kab9k60okaba275336b9l8kp3adpp6cojgh1k6o",
    "title": "nathan laliberte",
    "start": "2018-12-08T12:00:00-05:00",
    "end": "2018-12-08T12:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY4cWs4aGhoNmQxamdiOW02dDFrYWI5azYwb2thYmEyNzUzMzZiOWw4a3AzYWRwcDZjb2pnaDFrNm8gcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_60sj4gi561144ba48osjgb9k6sp4cba164pjeba46h0k2chh6os48gpg6s",
    "title": "Patrick Doyle 917-747-3844",
    "start": "2018-12-15T13:00:00-05:00",
    "end": "2018-12-15T14:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzYwc2o0Z2k1NjExNDRiYTQ4b3NqZ2I5azZzcDRjYmExNjRwamViYTQ2aDBrMmNoaDZvczQ4Z3BnNnMgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "72ut67apscbpdjggan3apbjijh_20181214T134000Z",
    "title": "Gustavo Restrepo ; cancelled sick child",
    "start": "2018-12-07T08:40:00-05:00",
    "end": "2018-12-07T09:25:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NzJ1dDY3YXBzY2JwZGpnZ2FuM2FwYmppamhfMjAxODEyMTRUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_691kacq26gsk4b9o6cr32b9k74s3gb9p8d2jib9p6p14cc9l6so46g9i6s",
    "title": "Betsy Laikin",
    "start": "2018-12-06T13:00:00-05:00",
    "end": "2018-12-06T13:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY5MWthY3EyNmdzazRiOW82Y3IzMmI5azc0czNnYjlwOGQyamliOXA2cDE0Y2M5bDZzbzQ2ZzlpNnMgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "0ehe56d3otkvbjha6gp1ko3m7b",
    "title": "Brian Kinsella",
    "start": "2018-12-07T15:00:00-05:00",
    "end": "2018-12-07T15:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MGVoZTU2ZDNvdGt2YmpoYTZncDFrbzNtN2Igcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "h967v1sn36od1liqgepohsveg4_20181203T170000Z",
    "title": "peer supervision",
    "start": "2018-12-03T12:00:00-05:00",
    "end": "2018-12-03T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=aDk2N3Yxc24zNm9kMWxpcWdlcG9oc3ZlZzRfMjAxODEyMDNUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "h967v1sn36od1liqgepohsveg4_20181210T170000Z",
    "title": "peer supervision",
    "start": "2018-12-10T12:00:00-05:00",
    "end": "2018-12-10T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=aDk2N3Yxc24zNm9kMWxpcWdlcG9oc3ZlZzRfMjAxODEyMTBUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "h967v1sn36od1liqgepohsveg4_20181224T170000Z",
    "title": "peer supervision",
    "start": "2018-12-24T12:00:00-05:00",
    "end": "2018-12-24T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=aDk2N3Yxc24zNm9kMWxpcWdlcG9oc3ZlZzRfMjAxODEyMjRUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_74r3ee1g74s48ba470ojab9k8l230b9o8kq42ba46so30hi18oq3echm8c_20181203T193000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-03T14:30:00-05:00",
    "end": "2018-12-03T15:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc0cjNlZTFnNzRzNDhiYTQ3MG9qYWI5azhsMjMwYjlvOGtxNDJiYTQ2c28zMGhpMThvcTNlY2htOGNfMjAxODEyMDNUMTkzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_74r3ee1g74s48ba470ojab9k8l230b9o8kq42ba46so30hi18oq3echm8c_20181217T193000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-17T14:30:00-05:00",
    "end": "2018-12-17T15:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc0cjNlZTFnNzRzNDhiYTQ3MG9qYWI5azhsMjMwYjlvOGtxNDJiYTQ2c28zMGhpMThvcTNlY2htOGNfMjAxODEyMTdUMTkzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_74r3ee1g74s48ba470ojab9k8l230b9o8kq42ba46so30hi18oq3echm8c_20181224T193000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-24T14:30:00-05:00",
    "end": "2018-12-24T15:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc0cjNlZTFnNzRzNDhiYTQ3MG9qYWI5azhsMjMwYjlvOGtxNDJiYTQ2c28zMGhpMThvcTNlY2htOGNfMjAxODEyMjRUMTkzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_74r3ee1g74s48ba470ojab9k8l230b9o8kq42ba46so30hi18oq3echm8c_20181210T193000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-10T14:30:00-05:00",
    "end": "2018-12-10T15:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc0cjNlZTFnNzRzNDhiYTQ3MG9qYWI5azhsMjMwYjlvOGtxNDJiYTQ2c28zMGhpMThvcTNlY2htOGNfMjAxODEyMTBUMTkzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "59t7hnfn77b4vtf1bun5goo34t_20181203T203000Z",
    "title": "Kamran Manoocheri",
    "start": "2018-12-03T15:30:00-05:00",
    "end": "2018-12-03T16:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NTl0N2huZm43N2I0dnRmMWJ1bjVnb28zNHRfMjAxODEyMDNUMjAzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "59t7hnfn77b4vtf1bun5goo34t_20181210T203000Z",
    "title": "Kamran Manoocheri",
    "start": "2018-12-10T15:30:00-05:00",
    "end": "2018-12-10T16:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NTl0N2huZm43N2I0dnRmMWJ1bjVnb28zNHRfMjAxODEyMTBUMjAzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "59t7hnfn77b4vtf1bun5goo34t_20181217T203000Z",
    "title": "Kamran Manoocheri",
    "start": "2018-12-17T15:30:00-05:00",
    "end": "2018-12-17T16:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NTl0N2huZm43N2I0dnRmMWJ1bjVnb28zNHRfMjAxODEyMTdUMjAzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "59t7hnfn77b4vtf1bun5goo34t_20181224T203000Z",
    "title": "Kamran Manoocheri",
    "start": "2018-12-24T15:30:00-05:00",
    "end": "2018-12-24T16:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NTl0N2huZm43N2I0dnRmMWJ1bjVnb28zNHRfMjAxODEyMjRUMjAzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6h02e7v7t83jhurmv4l0p44o8k_20181210T213000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-10T16:15:00-05:00",
    "end": "2018-12-10T17:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NmgwMmU3djd0ODNqaHVybXY0bDBwNDRvOGtfMjAxODEyMTBUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6h02e7v7t83jhurmv4l0p44o8k_20181203T213000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-03T16:30:00-05:00",
    "end": "2018-12-03T17:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NmgwMmU3djd0ODNqaHVybXY0bDBwNDRvOGtfMjAxODEyMDNUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6h02e7v7t83jhurmv4l0p44o8k_20181217T213000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-17T16:30:00-05:00",
    "end": "2018-12-17T17:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NmgwMmU3djd0ODNqaHVybXY0bDBwNDRvOGtfMjAxODEyMTdUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6h02e7v7t83jhurmv4l0p44o8k_20181224T213000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-24T16:30:00-05:00",
    "end": "2018-12-24T17:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NmgwMmU3djd0ODNqaHVybXY0bDBwNDRvOGtfMjAxODEyMjRUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_751jae2184q3cb9i6crk6b9k6d1jcb9p750jgba360s30d9j68oj6d1h64_20181203T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-03T17:30:00-05:00",
    "end": "2018-12-03T18:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc1MWphZTIxODRxM2NiOWk2Y3JrNmI5azZkMWpjYjlwNzUwamdiYTM2MHMzMGQ5ajY4b2o2ZDFoNjRfMjAxODEyMDNUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_751jae2184q3cb9i6crk6b9k6d1jcb9p750jgba360s30d9j68oj6d1h64_20181210T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-10T17:30:00-05:00",
    "end": "2018-12-10T18:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc1MWphZTIxODRxM2NiOWk2Y3JrNmI5azZkMWpjYjlwNzUwamdiYTM2MHMzMGQ5ajY4b2o2ZDFoNjRfMjAxODEyMTBUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_751jae2184q3cb9i6crk6b9k6d1jcb9p750jgba360s30d9j68oj6d1h64_20181217T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-17T17:30:00-05:00",
    "end": "2018-12-17T18:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc1MWphZTIxODRxM2NiOWk2Y3JrNmI5azZkMWpjYjlwNzUwamdiYTM2MHMzMGQ5ajY4b2o2ZDFoNjRfMjAxODEyMTdUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_751jae2184q3cb9i6crk6b9k6d1jcb9p750jgba360s30d9j68oj6d1h64_20181224T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-24T17:30:00-05:00",
    "end": "2018-12-24T18:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzc1MWphZTIxODRxM2NiOWk2Y3JrNmI5azZkMWpjYjlwNzUwamdiYTM2MHMzMGQ5ajY4b2o2ZDFoNjRfMjAxODEyMjRUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "29ue7a4ij8vltg4baoiji6l1n5_20181204T120000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-04T07:00:00-05:00",
    "end": "2018-12-04T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Mjl1ZTdhNGlqOHZsdGc0YmFvaWppNmwxbjVfMjAxODEyMDRUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "29ue7a4ij8vltg4baoiji6l1n5_20181211T120000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-11T07:00:00-05:00",
    "end": "2018-12-11T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Mjl1ZTdhNGlqOHZsdGc0YmFvaWppNmwxbjVfMjAxODEyMTFUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "29ue7a4ij8vltg4baoiji6l1n5_20181218T120000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-18T07:00:00-05:00",
    "end": "2018-12-18T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Mjl1ZTdhNGlqOHZsdGc0YmFvaWppNmwxbjVfMjAxODEyMThUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "29ue7a4ij8vltg4baoiji6l1n5_20181225T120000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-25T07:00:00-05:00",
    "end": "2018-12-25T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Mjl1ZTdhNGlqOHZsdGc0YmFvaWppNmwxbjVfMjAxODEyMjVUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6cp36h9p711j8b9g8cqj8b9k7513gba26p2jeb9j6opj2ghl88s4ae1p68_20181211T125000Z",
    "title": "Whitney McFadden",
    "start": "2018-12-11T07:50:00-05:00",
    "end": "2018-12-11T08:35:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjcDM2aDlwNzExajhiOWc4Y3FqOGI5azc1MTNnYmEyNnAyamViOWo2b3BqMmdobDg4czRhZTFwNjhfMjAxODEyMTFUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6cp36h9p711j8b9g8cqj8b9k7513gba26p2jeb9j6opj2ghl88s4ae1p68_20181218T125000Z",
    "title": "Whitney McFadden",
    "start": "2018-12-18T07:50:00-05:00",
    "end": "2018-12-18T08:35:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjcDM2aDlwNzExajhiOWc4Y3FqOGI5azc1MTNnYmEyNnAyamViOWo2b3BqMmdobDg4czRhZTFwNjhfMjAxODEyMThUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6cp36h9p711j8b9g8cqj8b9k7513gba26p2jeb9j6opj2ghl88s4ae1p68_20181225T125000Z",
    "title": "Whitney McFadden",
    "start": "2018-12-25T07:50:00-05:00",
    "end": "2018-12-25T08:35:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjcDM2aDlwNzExajhiOWc4Y3FqOGI5azc1MTNnYmEyNnAyamViOWo2b3BqMmdobDg4czRhZTFwNjhfMjAxODEyMjVUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_70qj6cpm6go32b9o89336b9k8cr34b9o68ojib9m891j0c9i6koj8gpi60_20181204T134000Z",
    "title": "Spencer Cherry",
    "start": "2018-12-04T08:40:00-05:00",
    "end": "2018-12-04T09:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzcwcWo2Y3BtNmdvMzJiOW84OTMzNmI5azhjcjM0YjlvNjhvamliOW04OTFqMGM5aTZrb2o4Z3BpNjBfMjAxODEyMDRUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_70qj6cpm6go32b9o89336b9k8cr34b9o68ojib9m891j0c9i6koj8gpi60_20181211T134000Z",
    "title": "Spencer Cherry",
    "start": "2018-12-11T08:40:00-05:00",
    "end": "2018-12-11T09:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzcwcWo2Y3BtNmdvMzJiOW84OTMzNmI5azhjcjM0YjlvNjhvamliOW04OTFqMGM5aTZrb2o4Z3BpNjBfMjAxODEyMTFUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_70qj6cpm6go32b9o89336b9k8cr34b9o68ojib9m891j0c9i6koj8gpi60_20181218T134000Z",
    "title": "Spencer Cherry",
    "start": "2018-12-18T08:40:00-05:00",
    "end": "2018-12-18T09:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzcwcWo2Y3BtNmdvMzJiOW84OTMzNmI5azhjcjM0YjlvNjhvamliOW04OTFqMGM5aTZrb2o4Z3BpNjBfMjAxODEyMThUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_70qj6cpm6go32b9o89336b9k8cr34b9o68ojib9m891j0c9i6koj8gpi60_20181225T134000Z",
    "title": "Spencer Cherry",
    "start": "2018-12-25T08:40:00-05:00",
    "end": "2018-12-25T09:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzcwcWo2Y3BtNmdvMzJiOW84OTMzNmI5azhjcjM0YjlvNjhvamliOW04OTFqMGM5aTZrb2o4Z3BpNjBfMjAxODEyMjVUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "4o41hojv9epcg4p5j0483b6jvs",
    "title": "Rodrigo Garcia",
    "start": "2018-12-12T18:30:00-05:00",
    "end": "2018-12-12T19:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NG80MWhvanY5ZXBjZzRwNWowNDgzYjZqdnMgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "5r1o57kp6bot4qscircrm0rq43_20181211T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-11T12:00:00-05:00",
    "end": "2018-12-11T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NXIxbzU3a3A2Ym90NHFzY2lyY3JtMHJxNDNfMjAxODEyMTFUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "5r1o57kp6bot4qscircrm0rq43_20181218T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-18T12:00:00-05:00",
    "end": "2018-12-18T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NXIxbzU3a3A2Ym90NHFzY2lyY3JtMHJxNDNfMjAxODEyMThUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "5r1o57kp6bot4qscircrm0rq43_20181225T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-25T12:00:00-05:00",
    "end": "2018-12-25T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NXIxbzU3a3A2Ym90NHFzY2lyY3JtMHJxNDNfMjAxODEyMjVUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "0qioud59i9vdkciiuvo81t2eif",
    "title": "Mike Mense",
    "start": "2018-12-11T13:00:00-05:00",
    "end": "2018-12-11T13:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MHFpb3VkNTlpOXZka2NpaXV2bzgxdDJlaWYgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_95hm2r1ncco3gcj16go36e1m6co68phnclj6ac1k6ks66p1l6gojgc1ick_20181204T213000Z",
    "title": "Analysis",
    "start": "2018-12-04T16:30:00-05:00",
    "end": "2018-12-04T17:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFuY2NvM2djajE2Z28zNmUxbTZjbzY4cGhuY2xqNmFjMWs2a3M2NnAxbDZnb2pnYzFpY2tfMjAxODEyMDRUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1ncco3gcj16go36e1m6co68phnclj6ac1k6ks66p1l6gojgc1ick_20181211T213000Z",
    "title": "Analysis",
    "start": "2018-12-11T16:30:00-05:00",
    "end": "2018-12-11T17:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFuY2NvM2djajE2Z28zNmUxbTZjbzY4cGhuY2xqNmFjMWs2a3M2NnAxbDZnb2pnYzFpY2tfMjAxODEyMTFUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1ncco3gcj16go36e1m6co68phnclj6ac1k6ks66p1l6gojgc1ick_20181218T213000Z",
    "title": "Analysis",
    "start": "2018-12-18T16:30:00-05:00",
    "end": "2018-12-18T17:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFuY2NvM2djajE2Z28zNmUxbTZjbzY4cGhuY2xqNmFjMWs2a3M2NnAxbDZnb2pnYzFpY2tfMjAxODEyMThUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_95hm2r1ncco3gcj16go36e1m6co68phnclj6ac1k6ks66p1l6gojgc1ick_20181225T213000Z",
    "title": "Analysis",
    "start": "2018-12-25T16:30:00-05:00",
    "end": "2018-12-25T17:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzk1aG0ycjFuY2NvM2djajE2Z28zNmUxbTZjbzY4cGhuY2xqNmFjMWs2a3M2NnAxbDZnb2pnYzFpY2tfMjAxODEyMjVUMjEzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_88ojcchi70pjab9g6cp3eb9k6gp36ba16gpjab9m64q30d248l1j4c9l6k_20181204T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-04T17:30:00-05:00",
    "end": "2018-12-04T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzg4b2pjY2hpNzBwamFiOWc2Y3AzZWI5azZncDM2YmExNmdwamFiOW02NHEzMGQyNDhsMWo0YzlsNmtfMjAxODEyMDRUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_88ojcchi70pjab9g6cp3eb9k6gp36ba16gpjab9m64q30d248l1j4c9l6k_20181211T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-11T17:30:00-05:00",
    "end": "2018-12-11T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzg4b2pjY2hpNzBwamFiOWc2Y3AzZWI5azZncDM2YmExNmdwamFiOW02NHEzMGQyNDhsMWo0YzlsNmtfMjAxODEyMTFUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_88ojcchi70pjab9g6cp3eb9k6gp36ba16gpjab9m64q30d248l1j4c9l6k_20181218T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-18T17:30:00-05:00",
    "end": "2018-12-18T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzg4b2pjY2hpNzBwamFiOWc2Y3AzZWI5azZncDM2YmExNmdwamFiOW02NHEzMGQyNDhsMWo0YzlsNmtfMjAxODEyMThUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_88ojcchi70pjab9g6cp3eb9k6gp36ba16gpjab9m64q30d248l1j4c9l6k_20181225T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-25T17:30:00-05:00",
    "end": "2018-12-25T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzg4b2pjY2hpNzBwamFiOWc2Y3AzZWI5azZncDM2YmExNmdwamFiOW02NHEzMGQyNDhsMWo0YzlsNmtfMjAxODEyMjVUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_891jic1p6go44b9p8l238b9k6l0kab9p8gqjib9k70sj4c2388pj0h1o64",
    "title": "Betsy Laikin",
    "start": "2018-12-13T15:30:00-05:00",
    "end": "2018-12-13T16:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzg5MWppYzFwNmdvNDRiOXA4bDIzOGI5azZsMGthYjlwOGdxamliOWs3MHNqNGMyMzg4cGowaDFvNjQgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_88qk8chh60qj6b9p68r3ib9k691k8ba160q3eba2850k4ha36cs3gg9h64",
    "title": "Jake Mcfadden",
    "start": "2018-12-12T14:00:00-05:00",
    "end": "2018-12-12T15:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzg4cWs4Y2hoNjBxajZiOXA2OHIzaWI5azY5MWs4YmExNjBxM2ViYTI4NTBrNGhhMzZjczNnZzloNjQgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_6d2j2hhk75346b9l650jcb9k64sj4ba16cs30b9h6sr3ici560s32dhg68",
    "title": "Stephan Ahron",
    "start": "2018-12-19T10:00:00-05:00",
    "end": "2018-12-19T10:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZkMmoyaGhrNzUzNDZiOWw2NTBqY2I5azY0c2o0YmExNmNzMzBiOWg2c3IzaWNpNTYwczMyZGhnNjggcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "6qcdr412m6uhu3e66603p98fs4_20181205T161500Z",
    "title": "Daniel Suter",
    "start": "2018-12-05T11:15:00-05:00",
    "end": "2018-12-05T12:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NnFjZHI0MTJtNnVodTNlNjY2MDNwOThmczRfMjAxODEyMDVUMTYxNTAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6qcdr412m6uhu3e66603p98fs4_20181212T161500Z",
    "title": "Daniel Suter",
    "start": "2018-12-12T11:15:00-05:00",
    "end": "2018-12-12T12:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NnFjZHI0MTJtNnVodTNlNjY2MDNwOThmczRfMjAxODEyMTJUMTYxNTAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6qcdr412m6uhu3e66603p98fs4_20181219T161500Z",
    "title": "Daniel Suter",
    "start": "2018-12-19T11:15:00-05:00",
    "end": "2018-12-19T12:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NnFjZHI0MTJtNnVodTNlNjY2MDNwOThmczRfMjAxODEyMTlUMTYxNTAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "6qcdr412m6uhu3e66603p98fs4_20181226T161500Z",
    "title": "Daniel Suter",
    "start": "2018-12-26T11:15:00-05:00",
    "end": "2018-12-26T12:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=NnFjZHI0MTJtNnVodTNlNjY2MDNwOThmczRfMjAxODEyMjZUMTYxNTAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_68o46d9g6p1k4b9h8l13ib9k891k6b9o84rjcb9g6op48h1g6oq3ge2688_20181205T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-05T12:00:00-05:00",
    "end": "2018-12-05T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY4bzQ2ZDlnNnAxazRiOWg4bDEzaWI5azg5MWs2YjlvODRyamNiOWc2b3A0OGgxZzZvcTNnZTI2ODhfMjAxODEyMDVUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_68o46d9g6p1k4b9h8l13ib9k891k6b9o84rjcb9g6op48h1g6oq3ge2688_20181226T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-26T12:00:00-05:00",
    "end": "2018-12-26T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY4bzQ2ZDlnNnAxazRiOWg4bDEzaWI5azg5MWs2YjlvODRyamNiOWc2b3A0OGgxZzZvcTNnZTI2ODhfMjAxODEyMjZUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_68o46d9g6p1k4b9h8l13ib9k891k6b9o84rjcb9g6op48h1g6oq3ge2688_20181212T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-12T12:00:00-05:00",
    "end": "2018-12-12T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY4bzQ2ZDlnNnAxazRiOWg4bDEzaWI5azg5MWs2YjlvODRyamNiOWc2b3A0OGgxZzZvcTNnZTI2ODhfMjAxODEyMTJUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_8h0kcghl8p13cb9n60s3eb9k70s30b9p89146b9p6513ed2588p4cda36k",
    "title": "Robert Pennoyer ",
    "start": "2018-12-12T13:00:00-05:00",
    "end": "2018-12-12T14:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzhoMGtjZ2hsOHAxM2NiOW42MHMzZWI5azcwczMwYjlwODkxNDZiOXA2NTEzZWQyNTg4cDRjZGEzNmsgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_6cq42e2260r30ba16kp36b9k84r3cba16sq3ab9i65142ga56op3ggpm8k_20181205T203000Z",
    "title": "Analysis",
    "start": "2018-12-05T15:30:00-05:00",
    "end": "2018-12-05T16:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjcTQyZTIyNjByMzBiYTE2a3AzNmI5azg0cjNjYmExNnNxM2FiOWk2NTE0MmdhNTZvcDNnZ3BtOGtfMjAxODEyMDVUMjAzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_6cq42e2260r30ba16kp36b9k84r3cba16sq3ab9i65142ga56op3ggpm8k_20181212T203000Z",
    "title": "Analysis",
    "start": "2018-12-12T15:30:00-05:00",
    "end": "2018-12-12T16:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjcTQyZTIyNjByMzBiYTE2a3AzNmI5azg0cjNjYmExNnNxM2FiOWk2NTE0MmdhNTZvcDNnZ3BtOGtfMjAxODEyMTJUMjAzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_6cq42e2260r30ba16kp36b9k84r3cba16sq3ab9i65142ga56op3ggpm8k_20181219T203000Z",
    "title": "Analysis",
    "start": "2018-12-19T15:30:00-05:00",
    "end": "2018-12-19T16:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjcTQyZTIyNjByMzBiYTE2a3AzNmI5azg0cjNjYmExNnNxM2FiOWk2NTE0MmdhNTZvcDNnZ3BtOGtfMjAxODEyMTlUMjAzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "_6cq42e2260r30ba16kp36b9k84r3cba16sq3ab9i65142ga56op3ggpm8k_20181226T203000Z",
    "title": "Analysis",
    "start": "2018-12-26T15:30:00-05:00",
    "end": "2018-12-26T16:20:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZjcTQyZTIyNjByMzBiYTE2a3AzNmI5azg0cjNjYmExNnNxM2FiOWk2NTE0MmdhNTZvcDNnZ3BtOGtfMjAxODEyMjZUMjAzMDAwWiByb3NlbmRhaGwubWRAbQ",
    "location": "1"
  },
  {
    "id": "688kqthcbrf21loqrocjfh4mha_20181205T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-05T17:30:00-05:00",
    "end": "2018-12-05T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Njg4a3F0aGNicmYyMWxvcXJvY2pmaDRtaGFfMjAxODEyMDVUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "688kqthcbrf21loqrocjfh4mha_20181212T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-12T17:30:00-05:00",
    "end": "2018-12-12T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Njg4a3F0aGNicmYyMWxvcXJvY2pmaDRtaGFfMjAxODEyMTJUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "688kqthcbrf21loqrocjfh4mha_20181219T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-19T17:30:00-05:00",
    "end": "2018-12-19T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Njg4a3F0aGNicmYyMWxvcXJvY2pmaDRtaGFfMjAxODEyMTlUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "688kqthcbrf21loqrocjfh4mha_20181226T223000Z",
    "title": "Josselyn Sheer",
    "start": "2018-12-26T17:30:00-05:00",
    "end": "2018-12-26T18:15:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Njg4a3F0aGNicmYyMWxvcXJvY2pmaDRtaGFfMjAxODEyMjZUMjIzMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_84q4ahhm60q46ba18opk8b9k68r3aba28ooj8b9m8krj2ci26t332h2684",
    "title": "Rodrigo Garcia",
    "start": "2018-12-18T18:20:00-05:00",
    "end": "2018-12-18T19:05:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzg0cTRhaGhtNjBxNDZiYTE4b3BrOGI5azY4cjNhYmEyOG9vajhiOW04a3JqMmNpMjZ0MzMyaDI2ODQgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_60pkcd1h88pjcb9p6gsj0b9k64pj4b9o69344b9n8oqj2dho64o3id1m6c",
    "title": "Stephan Ahron",
    "start": "2018-12-12T10:00:00-05:00",
    "end": "2018-12-12T10:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzYwcGtjZDFoODhwamNiOXA2Z3NqMGI5azY0cGo0YjlvNjkzNDRiOW44b3FqMmRobzY0bzNpZDFtNmMgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "0gtkj4q0qrl9h7047hmho19s0f_20181206T120000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-06T07:00:00-05:00",
    "end": "2018-12-06T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MGd0a2o0cTBxcmw5aDcwNDdobWhvMTlzMGZfMjAxODEyMDZUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "0gtkj4q0qrl9h7047hmho19s0f_20181213T120000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-13T07:00:00-05:00",
    "end": "2018-12-13T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MGd0a2o0cTBxcmw5aDcwNDdobWhvMTlzMGZfMjAxODEyMTNUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "0gtkj4q0qrl9h7047hmho19s0f_20181220T120000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-20T07:00:00-05:00",
    "end": "2018-12-20T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MGd0a2o0cTBxcmw5aDcwNDdobWhvMTlzMGZfMjAxODEyMjBUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "0gtkj4q0qrl9h7047hmho19s0f_20181227T120000Z",
    "title": "Eugenia Mejia",
    "start": "2018-12-27T07:00:00-05:00",
    "end": "2018-12-27T07:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=MGd0a2o0cTBxcmw5aDcwNDdobWhvMTlzMGZfMjAxODEyMjdUMTIwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6oo42dhp6co46b9p88r4ab9k6gok6b9p6t332ba668qkcgi46gok6e1g60_20181206T125000Z",
    "title": "Dana zeller",
    "start": "2018-12-06T07:50:00-05:00",
    "end": "2018-12-06T08:50:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZvbzQyZGhwNmNvNDZiOXA4OHI0YWI5azZnb2s2YjlwNnQzMzJiYTY2OHFrY2dpNDZnb2s2ZTFnNjBfMjAxODEyMDZUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6oo42dhp6co46b9p88r4ab9k6gok6b9p6t332ba668qkcgi46gok6e1g60_20181213T125000Z",
    "title": "Dana zeller",
    "start": "2018-12-13T07:50:00-05:00",
    "end": "2018-12-13T08:50:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZvbzQyZGhwNmNvNDZiOXA4OHI0YWI5azZnb2s2YjlwNnQzMzJiYTY2OHFrY2dpNDZnb2s2ZTFnNjBfMjAxODEyMTNUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6oo42dhp6co46b9p88r4ab9k6gok6b9p6t332ba668qkcgi46gok6e1g60_20181220T125000Z",
    "title": "Dana zeller",
    "start": "2018-12-20T07:50:00-05:00",
    "end": "2018-12-20T08:50:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZvbzQyZGhwNmNvNDZiOXA4OHI0YWI5azZnb2s2YjlwNnQzMzJiYTY2OHFrY2dpNDZnb2s2ZTFnNjBfMjAxODEyMjBUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6oo42dhp6co46b9p88r4ab9k6gok6b9p6t332ba668qkcgi46gok6e1g60_20181227T125000Z",
    "title": "Dana zeller",
    "start": "2018-12-27T07:50:00-05:00",
    "end": "2018-12-27T08:50:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZvbzQyZGhwNmNvNDZiOXA4OHI0YWI5azZnb2s2YjlwNnQzMzJiYTY2OHFrY2dpNDZnb2s2ZTFnNjBfMjAxODEyMjdUMTI1MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6gq44ea370p42b9g8d336b9k6t2j6b9p8go30ba26sr48dho6ssjidq18k_20181206T134000Z",
    "title": "Spencer Cherry ",
    "start": "2018-12-06T08:40:00-05:00",
    "end": "2018-12-06T09:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZncTQ0ZWEzNzBwNDJiOWc4ZDMzNmI5azZ0Mmo2YjlwOGdvMzBiYTI2c3I0OGRobzZzc2ppZHExOGtfMjAxODEyMDZUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6gq44ea370p42b9g8d336b9k6t2j6b9p8go30ba26sr48dho6ssjidq18k_20181213T134000Z",
    "title": "Spencer Cherry ",
    "start": "2018-12-13T08:40:00-05:00",
    "end": "2018-12-13T09:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZncTQ0ZWEzNzBwNDJiOWc4ZDMzNmI5azZ0Mmo2YjlwOGdvMzBiYTI2c3I0OGRobzZzc2ppZHExOGtfMjAxODEyMTNUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_6gq44ea370p42b9g8d336b9k6t2j6b9p8go30ba26sr48dho6ssjidq18k_20181227T134000Z",
    "title": "Spencer Cherry ",
    "start": "2018-12-27T08:40:00-05:00",
    "end": "2018-12-27T09:40:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZncTQ0ZWEzNzBwNDJiOWc4ZDMzNmI5azZ0Mmo2YjlwOGdvMzBiYTI2c3I0OGRobzZzc2ppZHExOGtfMjAxODEyMjdUMTM0MDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "3gunjjs7tup5s2hhfrq8qjvt0j",
    "title": "Lucretia Lamora",
    "start": "2018-12-18T13:00:00-05:00",
    "end": "2018-12-18T13:45:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=M2d1bmpqczd0dXA1czJoaGZycThxanZ0MGogcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_68o46d9g6p1k4b9h8l13ib9k891k6b9o84rjcb9g6op48h1g6oq3ge2688_20181219T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-19T14:30:00-05:00",
    "end": "2018-12-19T15:30:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzY4bzQ2ZDlnNnAxazRiOWg4bDEzaWI5azg5MWs2YjlvODRyamNiOWc2b3A0OGgxZzZvcTNnZTI2ODhfMjAxODEyMTlUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_70ojeca274o32b9g7123eb9k8gp30ba26gsk6b9k8d344gq588q4cgpk74",
    "title": "Fred Agcaoili",
    "start": "2018-12-13T13:00:00-05:00",
    "end": "2018-12-13T14:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=Xzcwb2plY2EyNzRvMzJiOWc3MTIzZWI5azhncDMwYmEyNmdzazZiOWs4ZDM0NGdxNTg4cTRjZ3BrNzQgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "_6gqj0ghn70q34ba16t23eb9k8kq3cb9o64p36b9j6cs44e238514cga18c",
    "title": "Alex  mullaney ",
    "start": "2018-12-14T12:00:00-05:00",
    "end": "2018-12-14T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzZncWowZ2huNzBxMzRiYTE2dDIzZWI5azhrcTNjYjlvNjRwMzZiOWo2Y3M0NGUyMzg1MTRjZ2ExOGMgcm9zZW5kYWhsLm1kQG0"
  },
  {
    "id": "kg0ga4pe9802rbsgofu0lai1s8_20181206T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-06T12:00:00-05:00",
    "end": "2018-12-06T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=a2cwZ2E0cGU5ODAycmJzZ29mdTBsYWkxczhfMjAxODEyMDZUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "kg0ga4pe9802rbsgofu0lai1s8_20181220T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-20T12:00:00-05:00",
    "end": "2018-12-20T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=a2cwZ2E0cGU5ODAycmJzZ29mdTBsYWkxczhfMjAxODEyMjBUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "kg0ga4pe9802rbsgofu0lai1s8_20181227T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-27T12:00:00-05:00",
    "end": "2018-12-27T13:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=a2cwZ2E0cGU5ODAycmJzZ29mdTBsYWkxczhfMjAxODEyMjdUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "kg0ga4pe9802rbsgofu0lai1s8_20181213T170000Z",
    "title": "Alexander Mullaney",
    "start": "2018-12-14T13:00:00-05:00",
    "end": "2018-12-14T14:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=a2cwZ2E0cGU5ODAycmJzZ29mdTBsYWkxczhfMjAxODEyMTNUMTcwMDAwWiByb3NlbmRhaGwubWRAbQ"
  },
  {
    "id": "_70r44c9g8krk8ba66gr3cb9k6koj6ba18l2kab9o6gsj0di38cs3gh266g",
    "title": "Fred Agcaoili",
    "start": "2018-12-19T13:00:00-05:00",
    "end": "2018-12-19T14:00:00-05:00",
    "url": "https://www.google.com/calendar/event?eid=XzcwcjQ0YzlnOGtyazhiYTY2Z3IzY2I5azZrb2o2YmExOGwya2FiOW82Z3NqMGRpMzhjczNnaDI2Nmcgcm9zZW5kYWhsLm1kQG0"
  }
];
