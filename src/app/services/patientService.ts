import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

import {Patient} from '../models/patient';

@Injectable()
export class PatientService {
    urlStub = 'patients';
    endpoint = 'http://localhost:3000/emr/';
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })
    };
    private patients: Observable<any[]>; // <Patient[]>;
    private _patients: BehaviorSubject<Patient[]>;
    private dataStore: {patients: Patient[] };


    private patientFields = 'first_name: string, middle_name: string, last_name: string, date_of_birth: date, sex: string, ' +
    'marital_status: string, name: string, username: string, nickname: string, image: string, primary_email: string, ' +
    'secondary_email: string, primary_telephone_number: string, primary_telephone_type: string, ' +
    'secondary_telephone_number: string, secondary_telephone_type: string, sms_number: string, preferred_contact_type: string, ' +
    'address_line_one: string, address_line_two: string, city: string, state: string, zipcode: string, notes: string, ' +
    'misc: string, details: string, history: string, school: string, work: string, obfuscated_name: string, ' +
    'patient_key: string, referral_name: string, referral_number: string, referral_email: string, referral_note: text, ' +
    'notes_cc: string, notes_history: string, notes_other: string, insurance_id: integer, primary_cpt: string, ' +
    'secondary_cpt: string, primary_fee: float, secondary_fee: float, meds_on_import: string, is_active: boolean, ' +
    'date_made_inactive: date, diagnostic_codes_on_import: string';


    constructor(private http: HttpClient) {
        this.dataStore = { patients: [] };
        this._patients = <BehaviorSubject<Patient[]>>new BehaviorSubject([]);
        this.patients = this._patients.asObservable();
        this.loadAll();
    }

    private loadAll(): any {
        this.getAll().subscribe(data => {
            this.dataStore.patients = <any[]>data;
            this._patients.next(Object.assign({}, this.dataStore).patients);
        });
    }

    // wnat to get list with {id: firstname lastname firstandlastname}
    getIdMapping() {
      let out = {};
      this.getAll().subscribe(data => {
        this.dataStore.patients = <any[]>data;
        this._patients.next(Object.assign({}, this.dataStore).patients);
        const these_patients = this.dataStore.patients.map(function(pat) {
          return {'id' : pat.id,
                  'first_name' : pat.first_name.trim().toLowerCase(),
                  'last_name' : pat.last_name.trim().toLowerCase(),
                  'first_last_name' : pat.first_name.trim().toLowerCase() + ' ' + pat.last_name.trim().toLowerCase(),
          };
        });
        console.log('getting patient list');
        console.log(JSON.stringify(these_patients));
        return these_patients;
      });
    }
    getFieldsString(): string {return this.patientFields};

    getAll(): Observable<any> {
        return this.http.get(this.endpoint + this.urlStub + '.json').pipe(
            map(this.extractData));
    }
    getAllForSelect(): Observable<any> {
        return this.http.get(this.endpoint + this.urlStub + '/getAllForSelect').pipe(
            map(this.extractData));
    }
    getAccount(id: string): Observable<any> {
      const url = `${this.endpoint + this.urlStub + '/' }${id}` + '/account.json';
      return this.http.get<Patient>(url).pipe(
        tap(_ => console.log(`fetched patient id=${id}`)),
        catchError(this.handleError<Patient>(`getPatient id=${id}`))
      );
    }
    get(id: number): Observable<Patient> {
        const url = `${this.endpoint + this.urlStub + '/' }${id}` + '.json';
        return this.http.get<Patient>(url).pipe(
            tap(_ => console.log(`fetched patient id=${id}`)),
            catchError(this.handleError<Patient>(`getPatient id=${id}`))
        );
    }
    add (data): Observable<any> {
        console.log(data);
        return this.http.post<any>(this.endpoint + this.urlStub + '.json', JSON.stringify(data), this.httpOptions).pipe(
            tap((res) => console.log(`added ' + this.urlStub' + ' w/ id=${res.id}`)),
            catchError(this.handleError<any>('add'))
        );
    }

    update (id, data): Observable<any> {
        console.log();
        return this.http.put(this.endpoint + this.urlStub + '/' + id + '.json', (
            JSON.stringify(this.removeUnpermittedParameters(data))), this.httpOptions).pipe(
            tap(_ => console.log(`updated patient id=${id}`)),
            catchError(this.handleError<any>('update'))
        );
    }

    delete (id): Observable<any> {
        console.log('deleting here: ' + id);
        return this.http.delete<any>(this.endpoint + this.urlStub + '/' + id + '.json', this.httpOptions).pipe(
            tap(_ => console.log(`deleted ' + this.urlStub + id=${id}`)),
            catchError(this.handleError<any>('delete'))
        );
    }

    removeUnpermittedParameters(submission): any {
        delete submission.id;
        delete submission.created_at;
        delete submission.updated_at;
        return submission;

    }
    private extractData(res: Response) {
        let body = res;
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
}
