export class PatientInterface {	
  id: number | string;
  first_name: string = null;
  middle_name: string  = null;
  last_name: string  = null;
  date_of_birth: Date  = null;
  sex: string  = null;
  marital_status: string  = null;
  name: string  = null;
  username: string  = null;
  nickname: string  = null;
  image: string  = null;
  primary_email: string  = null;
  secondary_email: string  = null;
  primary_telephone_number: string  = null;
  primary_telephone_type: string  = null;
  secondary_telephone_number: string  = null;
  secondary_telephone_type: string  = null;
  sms_number: string  = null;
  preferred_contact_type: string  = null; 
  address_line_one: string  = null;
  address_line_two: string  = null;
  city: string  = null;
  state: string  = null;
  zipcode: string = null;
  referral_name: string = null;
  referral_number: string = null;
  referral_email: string = null;
  referral_note: string = null;
  notes: string  = null;
  notes_cc: string = null;
  notes_other: string = null;
  notes_history: string = null;    
  misc: string  = null;
  details: string  = null;      
  history: string  = null;                      
  school: string  = null;
  work: string  = null;
  obfuscated_name: string  = null;
  patient_key: string  = null;
  insurance_id: number  = null;
  updated_at: Date  = null;
  created_at: Date  = null;
}
  
export class Patient implements PatientInterface {	
  id: number | string;
  first_name: string = null;
  middle_name: string  = null;
  last_name: string  = null;
  date_of_birth: Date  = null;
  sex: string  = null;
  marital_status: string  = null;
  name: string  = null;
  username: string  = null;
  nickname: string  = null;
  image: string  = null;
  primary_email: string  = null;
  secondary_email: string  = null;
  primary_telephone_number: string  = null;
  primary_telephone_type: string  = null;
  secondary_telephone_number: string  = null;
  secondary_telephone_type: string  = null;
  sms_number: string  = null;
  preferred_contact_type: string  = null; 
  address_line_one: string  = null;
  address_line_two: string  = null;
  city: string  = null;
  state: string  = null;
  zipcode: string = null;
  notes: string  = null;
  referral_name: string = null;
  referral_number: string = null;
  referral_email: string = null;
  referral_note: string = null;
  notes_cc: string = null;
  notes_other: string = null;
  notes_history: string = null;     
  misc: string  = null;
  details: string  = null;      
  history: string  = null;                      
  school: string  = null;
  work: string  = null;
  obfuscated_name: string  = null;
  patient_key: string  = null;
  insurance_id: number  = null;
  updated_at: Date  = null;
  created_at: Date  = null;

  constructor(properties: PatientInterface)
  {
      this.assing(properties);
  }

  assing(o: PatientInterface): void
  {
      let that = (<any>this);
      for (let key in o)
      {
          if (o.hasOwnProperty(key))
          {
              let value = (<any>o)[key];
              if (typeof value !== "undefined" && typeof that[key] !== "undefined")
                  that[key] = value;
          }
      }
  }
}
