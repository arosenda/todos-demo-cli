import {Component, OnInit, Input, Output, EventEmitter, SimpleChanges, SimpleChange} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MessageService, SelectItem} from 'primeng/api';
import { EventService} from '../../../scheduler/state/eventService';
import {AppointmentsQuery, AppointmentsService} from '../../../scheduler/state';

@Component({
  selector: 'app-new-appt-form',
  templateUrl: './new-appt-form.component.html',
  styleUrls: ['./new-appt-form.component.scss']
})
export class NewApptFormComponent implements OnInit {
  @Input() formModel: any = null;

  @Output() onEventUpdate: EventEmitter<string> = new EventEmitter();

  title = 'New Appt';
  form: FormGroup;
  today: number = Date.now();

  selectedView: any;
  selectedPatient: string

  viewOptions: SelectItem[];
  patientOptions: SelectItem[];
  repeatOptions: SelectItem[];
  repeatDayOptions: SelectItem[];
  repeatEndOptions: SelectItem[];
  primaryCodeOptions: SelectItem[];
  secondaryCodeOptions: SelectItem[];

  doCode: any;
  doFee: any;
  doRepeat: boolean = false;
  primaryCode: any;
  secondaryCode: any;
  primaryFee: any;
  secondaryFee: any;
  doRepeatEndsNever:  boolean = false;

  msgs: [];

  constructor(private eventService: EventService,
              private apptsService: AppointmentsService,
              private apptsQuery: AppointmentsQuery,
              private messageService: MessageService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    console.log('form model', this.formModel);
    this.initializeForm();
    this.initializeFormControls();
    this.initializeFormSelects();
  }

  formatSliderLabel(value: number | null) {if (!value) {return 0;} return '&nbsp;' + value + 'mins&nbsp;';}

  checkform(): any {
    this.msgs = [];
    if (this.form.dirty) {
      // this.msgs.push({severity: 'warn', summary: 'Warning', detail: 'There are unsaved changes'});
    }
    return this.msgs;
  }

  replacer(key: any, value: any): any {
    if (!value) return null;
    if (typeof value ===  "object" ) {
      if (value.hasOwnProperty('name')) {
        return value.name;
      }
    }
    return value;
  }

  setRepeat(currentState: any) {
    if (currentState === true) {
      this.doRepeat = true;
    }
  }

  patientSelected(patient) {
    if (!patient) {
      this.form.controls['title'].setValue(null);
      this.form.controls['patient_id'].setValue(null);
    } else {
      this.form.controls['title'].setValue(this.getTitle(patient));
      this.form.controls['patient_id'].setValue(patient.id);
    }
  }

  durationChanged(event) {
    console.log('duration changed:', event);
    console.log('start', this.form.controls['start']);
    const newDate = this.addMinutes(this.form.controls['start'].value, this.form.controls['duration'].value);
    this.form.controls['end'].setValue(newDate);
  }

  deleteAppt() {
    console.log('attempting to delete appt...');
    console.log(this.form.value);
    const event = this.form.value;
    if (event.id) {
      this.apptsService.delete(event.id);
    } else {
      console.log('no id to delete...');
    }
    this.durationChanged(null); //ensure end time set
    this.form.reset();
    this.onEventUpdate.emit('delete');
  }

  onSubmit() {
    console.log('attempting to save form with onsubmit...');
    console.log(this.form.value);
    this.durationChanged(null); //ensure end time set
    const event = this.form.value;
    if (event.id) {
      this.apptsService.update(event.id, event);
    } else {
      this.apptsService.add(event);
    }
    this.onEventUpdate.emit('success');
  }

  addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
  }
  pluralize(value: any): any { if (value.name) { return value.name.replace(/ly/i, 's');  } return "";}

  pwrap(inp: any): string {
    if (!inp) {
      return "";
    }
    return "(" + inp + ")";
  }
  dwrap(inp: any): string {
    if (!inp) {
      return "";
    }
    return "$" + inp;
  }
  codeString () {
    let dcode = this.doCode.value;
    if (!dcode) return "";
    let pcode = this.primaryCode.value.name;
    let scode = this.secondaryCode.value.name;
    if (!pcode) return "";
    if (scode) return pcode + "/" + scode
    return pcode;
  }

  feeString () {
    let dfee = this.doFee.value;
    if (!dfee) return "";
    let pfee = this.primaryFee.value;
    let sfee = this.secondaryFee.value;
    if (!pfee) return "";
    if (sfee) return "@" + this.dwrap(pfee) + '/' + this.dwrap(sfee);
    return "@" + this.dwrap(pfee);
  }

  codeLine() {
    let dcode = this.doCode.value;
    let dfee  = this.doFee.value;
    if (!dcode && !dfee) return "";

    let pcode = this.primaryCode.value;
    let scode = this.secondaryCode.value;
    let pfee = this.primaryFee.value;
    let sfee = this.secondaryFee.value;

    if (dcode && dfee) {
      return this.codeString() + " " + this.feeString();
    }
    else if (dcode && !dfee) {
      return this.codeString();
    }
    else if (!dcode && dfee) {
      return pfee ? "@" + this.dwrap(pfee) : "";
    }
    return "";
  }

  getTitle(patient) {
    if (!patient) {return null; }
    const name = [patient['first_name'], patient['last_name']]
    return name.join('').length > 1 ? name.join(' ') : null;
  }
  getEventName() {
    const name = [this.form.controls['first_name'], this.form.controls['last_name']]
    return name.join('').length > 1 ? name.join(' ') : false;
  }
  /*
  combineDateTime() {
    if(this.eventDateControl && this.eventTimeControl) {
      if(this.eventDateControl.value && this.eventTimeControl.value) {
        let d = this.eventDateControl.value;
        let t = this.eventTimeControl.value;
        let out = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          t.getHours(),
          t.getMinutes(),
          t.getSeconds(),
          t.getMilliseconds()
        );
        this.eventDateControl.setValue(out, {emitEvent: false});
        this.eventTimeControl.setValue(out, {emitEvent: false});
      }
    }
  }
*/

  populateForm() {
    if (!this.formModel) return;
    console.log('poplulate form', this.event);
    Object.keys(this.formModel).forEach( (key) => {
      console.log(key);
      if (this.form.controls[key]) {
        this.form.controls[key].setValue(this.formModel[key]);
      } else {
        this.form.addControl(key, new FormControl(this.formModel['key'], []));
      }
    });
  }

  ngOnChanges(simpleChange: SimpleChange) {
    console.log('form change ... populate form');
    this.populateForm();
  }


  initializeForm() {
    this.form = this.formBuilder.group({
      id: [null, []],
      title: ['', [<any>Validators.minLength(2)]],
      patient_id: [null, []],
      provider_id: ['', []],

      start: [new Date()],
      end: [new Date()],

      duration: [30, []],

      do_code: [false, []],
      do_fee: [false, []],

      primary_code: ['', []],
      secondary_code: ['', []],

      primary_fee: [, []],
      secondary_fee: [, []],

      do_repeat: [false, []],
      repeat_interval: [{id: 2, name: 'monthly', code: 'mo'}, []],
      repeat_frequency: ['1', []],
      repeat_start_date: ['', []],
      repeat_end_date: ['', []],
      repeat_end_type: [{id: 0, name: 'never', code: 'n'}, []],
      repeat_days_of_week: ['', []]
    });
    if (this.formModel) {
      console.log('processing form model');
      const controls = {};
      Object.keys(this.formModel).forEach( (key) => {
        console.log(key);
        if (this.form.controls[key]) {
          this.form.controls[key].setValue(this.formModel[key]);
        } else {
          this.form.addControl(key, new FormControl(this.formModel['key'], []));
        }
      });
    };
    console.log('form here...', this.form.value);
  }


  initializeFormControls() {
    this.doCode = this.form.controls['do_code'];
    this.doFee = this.form.controls['do_fee'];
  }

  initializeFormSelects() {
    this.viewOptions = [];
    this.viewOptions.push({label:'Month',  value:{id:0, name: 'month', code: 'm'}});
    this.viewOptions.push({label:'Week', value:{id:1, name: 'agendaWeek', code: 'w'}});
    this.viewOptions.push({label:'Day', value:{id:2, name: 'agendaDay', code: 'd'}});

    this.repeatOptions = [];
    this.repeatOptions.push({label:'Weekly',  value:{id:0, name: 'weekly', code: 'we'}});
    this.repeatOptions.push({label:'yearly', value:{id:1, name: 'yearly', code: 'ye'}});
    this.repeatOptions.push({label:'Monthly', value:{id:2, name: 'monthly', code: 'mo'}});
    this.repeatOptions.push({label:'daily', value:{id:3, name: 'daily', code: 'da'}});

    this.repeatDayOptions = [];
    this.repeatDayOptions.push({label:'Mondays',  value:{id:0, name: 'mondays', code: 'm'}});
    this.repeatDayOptions.push({label:'Tuesday', value:{id:1, name: 'tuesdays', code: 't'}});
    this.repeatDayOptions.push({label:'Wednesdays', value:{id:2, name: 'wednesdays', code: 'w'}});
    this.repeatDayOptions.push({label:'Thursdays', value:{id:3, name: 'thursdays', code: 'th'}});
    this.repeatDayOptions.push({label:'Fridays', value:{id:4, name: 'fridays', code: 'f'}});
    this.repeatDayOptions.push({label:'Saturdays', value:{id:5, name: 'saturdays', code: 's'}});
    this.repeatDayOptions.push({label:'Sundays', value:{id:6, name: 'sundays', code: 'su'}});

    this.repeatEndOptions = [];
    this.repeatEndOptions.push({label:'Never',  value:{id:0, name: 'never'	, code: 'n'}});
    this.repeatEndOptions.push({label:'On Date', value:{id:1, name: 'on date', code: 'o'}});

    this.primaryCodeOptions = [];
    this.primaryCodeOptions.push({label:"Primary CPT", value:null});
    this.primaryCodeOptions.push({label:'90791',  value:{id:0, name: '90791', code: 'we'}});
    this.primaryCodeOptions.push({label:'90792', value:{id:1, name: '90792', code: 'ye'}});
    this.primaryCodeOptions.push({label:'99212', value:{id:2, name: '99212', code: 'mo'}});
    this.primaryCodeOptions.push({label:'99213', value:{id:3, name: '99213', code: 'da'}});

    this.secondaryCodeOptions = [];
    this.secondaryCodeOptions.push({label:"2ndary CPT", value:null});
    this.secondaryCodeOptions.push({label:'90791',  value:{id:0, name: '90791', code: 'we'}});
    this.secondaryCodeOptions.push({label:'90792', value:{id:1, name: '90792', code: 'ye'}});
    this.secondaryCodeOptions.push({label:'99212', value:{id:2, name: '99212', code: 'mo'}});
    this.secondaryCodeOptions.push({label:'99213', value:{id:3, name: '99213', code: 'da'}});
  }

}
