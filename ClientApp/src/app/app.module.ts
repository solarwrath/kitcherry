import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {TabsModule} from 'ngx-bootstrap/tabs';
import {RoundProgressModule} from "angular-svg-round-progressbar";

import {environment} from '../environments/environment';

import {MetaReducer, StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {storeFreeze} from "ngrx-store-freeze";
import {AppState} from "./core/store/orders-queue.reducer";
import * as fromOrdersQueue from './core/store/orders-queue.reducer';

import {AppComponent} from './app.component';
import {OrderComponent} from './ui/order/order.component';
import {OrdersQueueComponent} from './ui/orders-queue/orders-queue.component';
import {LoadingSpinnerComponent} from "./ui/loading-spinner/loading-spinner.component";
import {CashBoxQueueComponent} from './ui/cash-box-queue/cash-box-queue.component';

import { MillisecondsToMinutesPipe } from './milisecond-to-minutes.pipe';
import { ProductCategoryRemapPipe } from './product-category-remap.pipe';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze]: [];

@NgModule({
	declarations: [
		AppComponent,
		LoadingSpinnerComponent,
		OrdersQueueComponent,
		CashBoxQueueComponent,
		OrderComponent,
		MillisecondsToMinutesPipe,
		ProductCategoryRemapPipe,
	],
	imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
		CommonModule,
		BrowserAnimationsModule,
		RoundProgressModule,
    PerfectScrollbarModule,

		StoreModule.forRoot({ordersQueue: fromOrdersQueue.ordersQueueReducer}, { metaReducers }),
		!environment.production ? StoreDevtoolsModule.instrument() : [],

		TabsModule.forRoot(),
	],
	providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
	bootstrap: [AppComponent]
})
export class AppModule {
}
