import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	OnDestroy,
	OnInit,
	Renderer2
} from '@angular/core';
import Order from "../../core/models/order.model";
import {AppState} from "../../core/store/orders-queue.reducer";
import {Store} from "@ngrx/store";
import {markOrderAsAssigned} from "../../core/store/orders-queue.actions";
import {TimeStatus} from "../../core/models/time-status.model";
import {BehaviorSubject} from "rxjs";

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderComponent implements OnInit, OnDestroy {
	@Input() public order: Order;

	public elapsedTime: number = 0;
	private static readonly TIME_INTERVAL_TICK: number = 1000;
	private elapsedTimeIntervalID;
	elapsedTimePercentage: number = 0;

	private estimatedTimeConverted: number;

	private timeStatus: BehaviorSubject<TimeStatus>;
	private static timeStatusClassNameTemplate: (timeStatusString: string) => string
		= (timeStatusString => `order-${timeStatusString}`);

	constructor(private store: Store<AppState>,
				private renderer: Renderer2,
				private hostElement: ElementRef,
				private chdRef: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		//Converting this property for further usage on time status check
		//Have to do it here as during property initialization order is not yet there
		this.estimatedTimeConverted = this.order.estimatedCookingTime.mul(60 * 1000).toNumber();

		//We have to use behaviour subject for fetching the persisted time status
		this.timeStatus = new BehaviorSubject<TimeStatus>(TimeStatus.NEW);
		this.timeStatus.subscribe(newTimeStatus => {
			this.setTimeStatusCssClasses(newTimeStatus);
		});

		this.elapsedTimeIntervalID = setInterval(() => {
			this.elapsedTime += OrderComponent.TIME_INTERVAL_TICK;
			this.checkTimeStatus();
			this.updateTimePercentage();

			//Due to the policy of changeDetection: ChangeDetectionStrategy.OnPush
			//we have to notify Angular that it has to check so that it updates at least elapsedTime
			this.chdRef.detectChanges();
		}, 1000);
	}

	private static timeStatusPredicates: Map<TimeStatus, (elapsedTime: number, estimatedTime: number) => boolean> = new Map(
		[
			[TimeStatus.NEW, (elapsedTime, estimatedTime) => elapsedTime <= estimatedTime / 3],
			[TimeStatus.WARNING, (elapsedTime, estimatedTime) => elapsedTime <= estimatedTime / 3 * 2],
			[TimeStatus.CRITICAL, (elapsedTime, estimatedTime) => elapsedTime > estimatedTime / 3 * 2],
		]
	);

	private checkTimeStatus(): void {
		for (const [timeStatus, predicate] of OrderComponent.timeStatusPredicates) {
			if (predicate(this.elapsedTime, this.estimatedTimeConverted)) {
				if (this.timeStatus.getValue() != timeStatus) {
					this.timeStatus.next(timeStatus);
				}

				break;
			}
		}
	}

	private setTimeStatusCssClasses(newTimeStatus: TimeStatus) {
		//Removing other time status css classes to avoid confusion and overlapping
		for (const currentTimeStatusEnumIterated in TimeStatus) {
			//There are also number values in enum enumerable properties, we want to display only strings
			if (typeof (TimeStatus[currentTimeStatusEnumIterated]) === "string") {
				this.renderer.removeClass(
					this.hostElement.nativeElement,
					OrderComponent.timeStatusClassNameTemplate(TimeStatus[currentTimeStatusEnumIterated].toLowerCase())
				);
			}
		}

		this.renderer.addClass(this.hostElement.nativeElement, OrderComponent.timeStatusClassNameTemplate(TimeStatus[newTimeStatus].toLowerCase()));
	}

	markAsAssigned(): void {
		this.store.dispatch(markOrderAsAssigned({orderToMarkAsAssigned: this.order}));
	}

	private updateTimePercentage(): void {
		this.elapsedTimePercentage = Math.ceil(this.elapsedTime / this.estimatedTimeConverted * 100);
	}

	ngOnDestroy(): void {
		clearInterval(this.elapsedTimeIntervalID);
		this.timeStatus.unsubscribe();
	}
}
