import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

import {Invoice} from '../models/invoice';

@Injectable()
export class InvoiceService {
    urlStub = 'invoices';
    endpoint = 'http://localhost:3000/emr/';
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })
    };
    private invoiceFields = 'patient_id: integer, provider_id: integer, payee_name: string, invoice_date: date, ' +
      'period_start_date: date, period_end_date: date, session_number: integer, amount: float, note: string';

    private invoices: Observable<any[]>; // <Invoice[]>;
    private _invoices: BehaviorSubject<Invoice[]>;
    private dataStore: {invoices: Invoice[] };

    constructor(private http: HttpClient) {
        this.dataStore = { invoices: [] };
        this._invoices = <BehaviorSubject<Invoice[]>>new BehaviorSubject([]);
        this.invoices = this._invoices.asObservable();
        this.loadAll();
    }


    private loadAll(): any {
        this.getAll().subscribe(data => {
            this.dataStore.invoices = <any[]>data;
            this._invoices.next(Object.assign({}, this.dataStore).invoices);
        });
    }
    getFieldsString(): string {return this.invoiceFields};
    getAll(): Observable<any> {
        return this.http.get(this.endpoint + this.urlStub + '.json').pipe(
            map(this.extractData));
    }

    get(id: number): Observable<Invoice> {
        const url = `${this.endpoint + this.urlStub + '/' }${id}` + '.json';
        return this.http.get<Invoice>(url).pipe(
            tap(_ => console.log(`fetched invoice id=${id}`)),
            catchError(this.handleError<Invoice>(`getInvoice id=${id}`))
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
            tap(_ => console.log(`updated invoice id=${id}`)),
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
