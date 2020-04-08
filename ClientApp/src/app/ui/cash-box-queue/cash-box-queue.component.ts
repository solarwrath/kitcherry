import {ChangeDetectionStrategy, Component, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState, CashBox} from "../../core/store/orders-queue.reducer";
import {selectCashBox} from "../../core/store/orders-queue.selectors";
import {Observable} from "rxjs";
import Order from "../../core/models/order.model";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {OrderComponent} from "../order/order.component";

@Component({
	selector: 'app-cash-box-queue',
	templateUrl: './cash-box-queue.component.html',
	styleUrls: ['./cash-box-queue.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [trigger('fadeOut', [
		state('void', style({
			opacity: 0,
			transform: 'translateY(-100vh)',
		})),
		transition(':enter', [
			style({transform: 'translateY(100vh)', opacity: 0}),
			animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)'),
			style({transform: 'translateY(0)', opacity: 1}),
		]),
		transition('* => void', animate(300)),
	])],
})
export class CashBoxQueueComponent implements OnInit {
	@Input() cashBoxId: number;
	public currentCashBox: Observable<CashBox>;
	@ViewChildren(OrderComponent) orders: QueryList<OrderComponent>;

	constructor(public store: Store<AppState>) {
	}

	ngOnInit(): void {
		this.currentCashBox = this.store.select(selectCashBox, {id: this.cashBoxId});
	}

	trackByFunction(index: number, item: Order) {
		return item.id;
	}
}
