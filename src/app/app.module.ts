import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {APP_BASE_HREF} from '@angular/common';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';

import {environment} from '../environments/environment';
import { TodosModule } from './todos/todos.module';

import {AppRoutingModule} from './routing/routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';


@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    TodosModule,
    AppRoutingModule,
    environment.production ? [] : AkitaNgDevtools.forRoot()],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [{provide: APP_BASE_HREF, useValue : '/' }]
})
export class AppModule { }




