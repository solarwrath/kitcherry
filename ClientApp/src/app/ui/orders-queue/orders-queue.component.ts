import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState, CashBox} from "../../core/store/orders-queue.reducer";
import {cashBoxTabClicked, loadOrdersStart} from "../../core/store/orders-queue.actions";
import {Observable, Subscription} from "rxjs";
import {TabsetComponent} from "ngx-bootstrap/tabs";
import _ from 'lodash';
import ErrorData from "../../core/util/error";

@Component({
  selector: 'app-orders-queue',
  templateUrl: './orders-queue.component.html',
  styleUrls: ['./orders-queue.component.scss']
})
export class OrdersQueueComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('cashBoxTabs', {
    static: true,
  })
  cashBoxTabs: TabsetComponent;

  private tabSelectSubscriptions: { [heading: string]: Subscription } = {};
  private handleCashBoxTabsFlag: boolean = false;

  public isLoading: Observable<boolean> = this.store.select(state => state.ordersQueue.isLoading);
  public loadError: Observable<ErrorData> = this.store.select(state => state.ordersQueue.loadError);
  public cashBoxStateObservable: Observable<CashBox[]> = this.store.select(state => state.ordersQueue.cashBoxState);
  private selectedTabHeading: string;

  constructor(private store: Store<AppState>,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.store.select(state => state.ordersQueue.cashBoxState).subscribe(newCashBoxState => {
      //Keeping this flag as have to subscribe toc ash box tabs,
      //but they are injected in AfterViewInit+; can't use them outright from the subscription
      this.handleCashBoxTabsFlag = true;
    });

    this.store.select(state => state.ordersQueue.selectedCashBoxTabHeading)
      .subscribe(newSelectedTabHeading => this.selectedTabHeading = newSelectedTabHeading);

    this.store.dispatch(loadOrdersStart());
  }

  ngAfterViewChecked(): void {
    //Tabs can be absent if orders haven't been loaded yet, so checking whether thet are undefined
    if (this.handleCashBoxTabsFlag && this.cashBoxTabs !== undefined) {
      //We are subscribing only for new tabs
      this.cashBoxTabs.tabs.filter(tab => {
        return this.tabSelectSubscriptions[tab.heading] === undefined;
      }).forEach((tab) => {
        //Storing subscription to selected tab
        this.tabSelectSubscriptions[tab.heading] = tab.selectTab.subscribe(() => {
          this.store.dispatch(cashBoxTabClicked({selectedTabHeading: tab.heading}));
        });
      });

      //Sorting the tabs by heading (all the headings are integers [1..]),
      //as ngx-bootstrap adds them in random order
      this.cashBoxTabs.tabs = _.orderBy(this.cashBoxTabs.tabs, 'heading', 'asc');

      //If there have not been manually selected tabs yet: select the first sorted by heading tab
      this.selectedTabHeading = this.selectedTabHeading || this.cashBoxTabs.tabs[0].heading;

      //Select tab as we lose that state
      this.cashBoxTabs.tabs.find(tab => tab.heading === this.selectedTabHeading).active = true;

      this.handleCashBoxTabsFlag = false;

      //We changed order and active status of the tabs in the ngAfterViewChecked hook,
      //thus, we have to notify Angular of the changes
      this.cdRef.detectChanges();
    }
  }

  ngOnDestroy(): void {
    Object.values(this.tabSelectSubscriptions)
      .forEach(tabSelectSubscription => tabSelectSubscription.unsubscribe());
  }

  trackByFunction(index: number, item: CashBox) {
    return item.id;
  }
}
