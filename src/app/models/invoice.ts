// :patient_id, :provider_id, :payee_name, :invoice_date, :period_start_date, :period_end_date, :session_number, :amount, :note


export class InvoiceInterface {
  id: number | string;
  patient_id: number | string;
  provider_id: number | string;
  payee_name: string;
  invoice_date: Date = null;
  period_start_date: Date = null;
  period_end_date: Date = null;
  session_number: number;
  amount: number;
  note: string;
  updated_at: Date  = null;
  created_at: Date  = null;
}
  
export class Invoice implements InvoiceInterface {
    id: number | string;
    patient_id: null;
    provider_id: null;
    payee_name: string = null;
    invoice_date: Date = null;
    period_start_date: Date = null;
    period_end_date: Date = null;
    session_number: number;
    amount: number;
    note: string = null;
    updated_at: Date  = null;
    created_at: Date  = null;

  constructor(properties: InvoiceInterface)
  {
      this.assing(properties);
  }

  assing(o: InvoiceInterface): void
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
