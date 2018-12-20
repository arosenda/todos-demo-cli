import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { APP_BASE_HREF} from '@angular/common';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';

import { environment} from '../environments/environment';
import { TodosModule } from './todos/todos.module';

import { AppRoutingModule} from './routing/routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule} from '@angular/common/http';

import { FullCalendarModule } from 'ng-fullcalendar';
import { ScheduleComponent} from './scheduler/schedule.component';
import { TestingComponent } from './testing/testing.component';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';

import {NewPatientFormComponent} from './forms/new-form/new-patient-form/new-patient-form.component';
import {NewApptFormComponent} from './forms/new-form/new-appt-form/new-appt-form.component';
import {NewInvoiceFormComponent} from './forms/new-form/new-invoice-form/new-invoice-form.component';
import {NewPaymentFormComponent} from './forms/new-form/new-payment-form/new-payment-form.component';
import {NewFormDialogComponent} from './forms/new-form-dialog/new-form-dialog.component';
import {EventService} from './scheduler/state/eventService';
import {InvoiceService} from './services/invoice.service';
// import {PatientService} from './services/patientService';
import {PaymentService} from './services/paymentService';
import {UserSettingsService} from './services/user-settings.service';
import {CalendarModule, DropdownModule, MessageService, MessagesModule, SpinnerModule} from 'primeng/primeng';
import {PatientSelectorComponent} from './patients/patient-selector/patient-selector.component';
import {PatientsService} from './patients/state';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TodosModule,
    AppRoutingModule,
    FullCalendarModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),

    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatStepperModule,

    DropdownModule,
    CalendarModule,
    MessagesModule,
    SpinnerModule,
  ],
  declarations: [AppComponent,
    TestingComponent,
    ScheduleComponent,
    NewPatientFormComponent,
    NewApptFormComponent,
    NewInvoiceFormComponent,
    NewPaymentFormComponent,
    NewFormDialogComponent,
    PatientSelectorComponent,
  ],
  entryComponents: [
    ScheduleComponent,

    NewPatientFormComponent,
    NewApptFormComponent,
    NewInvoiceFormComponent,
    NewPaymentFormComponent,

    NewFormDialogComponent,
  ],

  bootstrap: [AppComponent,
  ],
  providers: [{provide: APP_BASE_HREF, useValue : '/' },
              EventService,
              InvoiceService,
              PatientsService,
              PaymentService,
              UserSettingsService,
              MessageService
  ]
})
export class AppModule { }




