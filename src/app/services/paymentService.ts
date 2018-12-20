import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

import {Payment} from '../models/payment';

@Injectable()
export class PaymentService {
    urlStub = 'payments';
    endpoint = 'http://localhost:3000/emr/';
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })
    };

    private paymentFields = 'patient_id: integer, provider_id: integer, payer_name: string, payment_date: date, ' +
      'deposit_date: date, invoice_date: date, payment_type: string, amount: float, note: string';

    private payments: Observable<any[]>; // <payments[]>;
    private _payments: BehaviorSubject<Payment[]>;
    private dataStore: {payments: Payment[] };

    constructor(private http: HttpClient) {
        this.dataStore = { payments: [] };
        this._payments = <BehaviorSubject<Payment[]>>new BehaviorSubject([]);
        this.payments = this._payments.asObservable();
        this.loadAll();
    }




    private loadAll(): any {
        this.getAll().subscribe(data => {
            this.dataStore.payments = <any[]>data;
            this._payments.next(Object.assign({}, this.dataStore).payments);
        });
    }

    getFieldsString(): string {return this.paymentFields};

    getAll(): Observable<any> {
        return this.http.get(this.endpoint + this.urlStub + '.json').pipe(
            map(this.extractData));
    }

    get(id: number): Observable<Payment> {
        const url = `${this.endpoint + this.urlStub + '/' }${id}` + '.json';
        return this.http.get<Payment>(url).pipe(
            tap(_ => console.log(`fetched payment id=${id}`)),
            catchError(this.handleError<Payment>(`getpayment id=${id}`))
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
            tap(_ => console.log(`updated payment id=${id}`)),
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
