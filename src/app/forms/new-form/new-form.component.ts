import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-new-form',
  templateUrl: './new-form.component.html',
  styleUrls: ['./new-form.component.scss']
})

export class NewFormComponent implements OnInit {
  @Input() formCommand: string;

  constructor() {

  }

  ngOnInit() {
  }

}
