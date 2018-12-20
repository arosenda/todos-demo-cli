// creating rails gen code
//    id: number | string;
//     patient_id: null;
//     payment_name: null;
//     payment_date: Date = null;
//     deposit_date: Date = null;
//     invoice_date: Date = null;
//     payment_type: string = null;
//     amount: number = null;
//     note: string = null;
//     updated_at: Date = null;
//     created_at: Date = null;
// rails g model payments patient_id: integer, provider_id: integer, payer_name: string,
// payment_date: date, deposit_date: date, invoice_date: date, payment_type: string, amount: float, note: string

export class PaymentInterface {
  id: number | string;
  patient_id: number | string;
  provider_id: number | string;
  payer_name: string;
  payment_date: Date  = null;
  deposit_date: Date = null;
  invoice_date: Date = null;
  payment_type: string;
  amount: number;
  note: string
  updated_at: Date  = null;
  created_at: Date  = null;
}
  
export class Payment implements PaymentInterface {
    id: number | string;
    patient_id: null;
    provider_id: null;
    payer_name: null;
    payment_date: Date = null;
    deposit_date: Date = null;
    invoice_date: Date = null;
    payment_type: string = null;
    amount: number = null;
    note: string = null;
    updated_at: Date = null;
    created_at: Date = null;

  constructor(properties: PaymentInterface)
  {
      this.assing(properties);
  }

  assing(o: PaymentInterface): void
  {
      let that = (<any>this);
      for (let key in o)
      {
          if (o.hasOwnProperty(key))
          {
              let value = (<any>o)[key];
              if (typeof value !== 'undefined' && typeof that[key] !== 'undefined')
                  that[key] = value;
          }
      }
  }
}
