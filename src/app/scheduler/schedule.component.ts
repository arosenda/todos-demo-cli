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

@Component({
  selector: 'app-schedule',
  template: `
    <button matButton color="primary" (click)="openEvent()">Open</button>
    <button matButton color="primary" (click)="reload()">Reload</button>
  <!--pre>{{events$ | async | json}}</pre-->
    <p>Display event : {{displayEvent | json}}</p>
    <div *ngIf="events">
    <ng-fullcalendar #ucCalendar [options]="calendarOptions" (eventClick)="eventClick($event.detail)" (eventDrop)="updateEvent($event.detail)"
        (eventResize)="updateEvent($event.detail)" (clickButton)="clickButton($event.detail)"></ng-fullcalendar>
    </div> 
  `,
  styles: []
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  displayEvent: any;
  events: any;
  calendarOptions: Options;


  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor(
    private apptsService: AppointmentsService,
    private apptsQuery: AppointmentsQuery,
    private dialog: MatDialog
  ) {
    this.calendarOptions = {
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
      eventClick: function(event) {
        if (event.url) {
          return false;
        }
      },
      events: []
    };
  }

  ngOnInit() {
    this.fetchEvents();
  }

  async ngAfterViewInit() {
    await delay(1500);
    this.reload();
  }

  updateEvent(model: any) {
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
    this.displayEvent = model;
    if (model.event.id) {
      this.apptsService.update(model.event.id, JSON.stringify(model));
    }
  }


  fetchEvents() {
    this.events = null;
    this.apptsQuery.selectAll().subscribe( ev => {
      this.events = ev;
      this.calendarOptions = {
        // defaultView: 'agendaDay',
        // defaultDate: '2018-07-26',
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
        eventClick: function(event) {
          if (event.url) {
            return false;
          }
        },
        events: this.events,
      };
    });
  }

  async reload() {
      console.log('reloading...');
      await delay(600);
      this.ucCalendar.fullCalendar('removeEvents');
      this.ucCalendar.fullCalendar('addEventSource', this.events);
  }

  clickButton(model: any) {
    console.log('click button here...');
    this.displayEvent = model;
  }
  eventClick(model: any) {
    const id = model.event.id;
    model = {
      event: {
        id: model.event.id,
        start: model.event.start,
        end: model.event.end,
        title: model.event.title,
        allDay: model.event.allDay
        // other params
      },
      duration: {}
    }
    this.displayEvent = model;
    if (model.event.id) {
      this.apptsQuery.selectEntity(id).subscribe( res => {
        console.log('opening appt id: ', id);
        this.openEvent(res);
      });
    }
  }

  openEvent(event = null) {
    this.loadFormComponent('new appointment', event);
  }

  loadFormComponent(formCommand: string, event = null) {
    const apptFormRef = this.dialog.open( NewFormDialogComponent, {// emrFormItem.component, {
      width: '500px',
      height:'600px',
      position: {'top': '50px'},
      disableClose: false,
      data: {formName: 'no-name', formCommand: formCommand, formModel: event}
    });
    apptFormRef.afterClosed().subscribe(result => {
      this.reload();
    });
  }
}

const DEBUG = true;
function debug(...stuff) {if (DEBUG) {console.log(stuff); }}
async function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

