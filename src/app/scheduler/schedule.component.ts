import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {CalendarComponent} from 'ng-fullcalendar';
import {Options} from 'fullcalendar';
import { Appointment } from './state';
import { AppointmentsQuery } from './state';
import {EventService} from './state/eventService';
import {AppointmentsService} from './state';
import {Event} from './state/event';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { map } from 'rxjs/operators';
import {TodosQuery} from '../todos/state';
import {NewFormDialogComponent} from '../forms/new-form-dialog/new-form-dialog.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {FullCalendar} from 'primeng/fullcalendar';
import * as moment from 'moment';

const CAL_OPTIONS = {
  // defaultView: 'agendaDay',
  // defaultDate: '2018-07-26',
  timezone: 'local',
  allDay: false,
  editable: true,
  dragRevertDuration: 200,
  eventLimit: false,
  header: {
    left: 'prev,next today',
    center: 'title',
    right: 'month,agendaWeek,agendaDay,listMonth'
  },
  selectable: true,
  droppable: true,
  slotEventOverlap: true,
  minTime: moment.duration('07:00:00'),
  maxTime: moment.duration('19:00:00'),
  events: null
}

@Component({
  selector: 'app-schedule',
  template: `
    <button mat-mini-fab class="spemr-lightgray-bkg mat-elevation-z2" style="margin:5px;color:white; background-color:lightgrey" (click)="newEvent()" >
      <mat-icon aria-label="Close">add</mat-icon>
    </button>
    <button mat-mini-fab class="spemr-lightgray-bkg  mat-elevation-z2" style="margin:5px; color:white; background-color:lightgrey; display:inline-block; float:right;" (click)="reload()">
      <mat-icon aria-label="reload">autorenew</mat-icon>
    </button>
    <div *ngIf="events"><ng-fullcalendar #ucCalendar
        [options]="calendarOptions" 
        (dayClick)="dateClicked($event.detail)"                                 
        (eventClick)="eventClick($event.detail)" 
        (eventDrop)="eventDrop($event.detail)"
        (eventResize)="eventResize($event.detail)" 
        (clickButton)="buttonClicked($event.detail)">
    </ng-fullcalendar></div> 
  `,
  styles: []
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  displayEvent: any;
  dstep = 5;
  events: any;
  calendarOptions: Options;
  settings = {
    defaultEventDuration: "45"
  };
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  dialogIsOpen = false;

  clickDate = null; clickEventId = null;

  constructor(
    private apptsService: AppointmentsService,
    private apptsQuery: AppointmentsQuery,
    private dialog: MatDialog
  ) {
    this.calendarOptions = CAL_OPTIONS;
  }

  ngOnInit() {
    this.fetchEvents();
  }

  async ngAfterViewInit() {
    await delay(1500);
    this.reload();
  }

  eventClick(event) {
    debug('test event', event);
    const id = event.event.id
    if (id === this.clickEventId) {
      debug('event double click', id);
      this.clickEventId = null;
      this.loadFormComponent('new appointment', this.apptsQuery.getEntity(event.event.id));
    }
    else {
      debug('event single click', id);
      this.clickEventId = id;
    }
  }
  eventDrop(event) {
    debug('event drop', event);
    event = {
      event: {
        id: event.event.id,
        start: event.event.start,
        end: event.event.end,
        title: event.event.title
        // other params
      },
      duration: {
        _data: event.duration._data
      }
    }
    const id = event.event.id, out = false;
    this.apptsService.update(id, event);
  }
  eventResize(event) {
    debug('event resize', event);
    event = {
      event: {
        id: event.event.id,
        start: event.event.start,
        end: event.event.end,
        title: event.event.title
        // other params
      },
      duration: {
        _data: event.duration._data
      }
    }
    const id = event.event.id, out = false;
    this.apptsService.update(id, event);
  }
  dateClicked(event) {
    let date = event.date;
    if (date.format() === this.clickDate) {
      this.clickDate = null;
      debug('date double click', date.format());
      if (date.get('hour') + date.get('minute') === 0) {
        const dateStr = date.format('YYYY-MM-DD');
        const timeStr = moment().format('HH:mm');
        date  = moment(dateStr);
        const time  = moment(timeStr, 'HH:mm');
        date.set({
          hour:   time.get('hour'),
          minute: time.get('minute'),
          second: time.get('second')
        });
      }
      const event = {
        title: 'New Appt',
        start: date.add(1, 'second').format(),
        end: date.add(1, 'second').add(this.settings.defaultEventDuration, 'minutes').format(),
        duration: this.settings.defaultEventDuration
      };
      this.loadFormComponent('new appointment', event);
    }
    else {
      this.clickDate = date.format();
      debug('date single click', date.add(1, 'second').format('YYYY-MM-DDTHH:mm:ssZ'));

    }
  }
  buttonClicked(event) {
    debug('button clicked', event);
  }

  updateEvent(model: any) {
    debug('updating event...', model );
    model = {
      event: {
        id: model.event.id,
        start: model.event.start,
        end: model.event.end,
        title: model.event.title
        // other params
      },
      duration: {
        _data: model.duration._data
      }
    }
    if (model.event.id) {
      this.apptsService.update(model.event.id, model);
    }

  }


  fetchEvents() {
    debug('fetching events...');
    this.apptsQuery.selectAll().subscribe( events => {
      debug('Event store change', events);
      this.calendarOptions = {...CAL_OPTIONS, events: events};
      if (this.ucCalendar) {
        if (this.ucCalendar.fullCalendar()) {
          this.ucCalendar.fullCalendar('removeEvents');
          this.ucCalendar.fullCalendar('addEventSource', events);
        }
      }
      this.events = events;
      return events;
    }), err => {console.log('error in event fetch: ', err)};
  }

  async reload() {
      debug('reloading events...');
      await delay(600);
      this.ucCalendar.fullCalendar('removeEvents');
      this.ucCalendar.fullCalendar('addEventSource', this.events);
  }

  openPatient(event=null) {
    this.loadFormComponent('new patient', event);
  }
  newEvent() {
    debug('creating event from schedule');
    this.loadFormComponent('new appointment', null);
  }
  openEvent() {
    debug('opening event from schedule');
    this.loadFormComponent('new appointment', event);
  }

  loadFormComponent(formCommand: string, event = null) {
    if (this.dialogIsOpen) {return};
    const apptFormRef = this.dialog.open( NewFormDialogComponent, {// emrFormItem.component, {
      width: '700px',
      height:'640px',
      position: {'top': '10px'},
      disableClose: false,
      data: {formName: 'no-name', formCommand: formCommand, formModel: event}
    });
    apptFormRef.afterClosed().subscribe(result => {
      debug('close result:', result);
      this.reload();
      this.dialogIsOpen = false;
    });
  }
}

const DEBUG = true;
function debug(...stuff) {if (DEBUG) {console.log(stuff); }}
async function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

