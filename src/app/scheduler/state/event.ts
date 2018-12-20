export class Event {
	id: number | string;
    patient_name: string = null;
	event_title: string = null;

	event_start_date: Date = new Date();
	event_start_time: Date = new Date();
	event_end_date: Date = new Date();
	event_end_time:  Date = new Date();
	event_duration: number = 30;

	do_code: boolean = false;
	do_fee: boolean = false;

	primary_code: string = null;
	secondary_code: string = null;

	primary_fee: number = 125;
	secondary_fee: number = 125;

	do_repeat: boolean = false;
	repeat_interval: string = null;
	repeat_frequency: number = 1;
	repeat_start_date: Date = new Date();
	repeat_end_date: Date = new Date();
	repeat_end_type: string = null;
	repeat_days_of_week: string = null;

    updated_at: Date  = null;
    created_at: Date  = null;
}
