import {Injectable} from '@angular/core';
import Order from "../models/order.model";
import * as signalR from "@microsoft/signalr";
import {
  addOrderToQueue,
  loadOrdersError,
  loadOrdersStart,
  loadOrdersSuccess,
  removeOrderFromQueue
} from "../store/orders-queue.actions";
import {AppState} from "../store/orders-queue.reducer";
import {Store} from "@ngrx/store";
import RawOrder from "../models/raw-order.model";

@Injectable({
  providedIn: 'root'
})
export class OrdersQueueService {
  private static readonly HUB_URL = '/ordersHub';
  private static readonly ADD_ORDER_HUB_METHOD_NAME = 'AddOrder';
  private static readonly REMOVE_ORDER_HUB_METHOD_NAME = 'RemoveOrder';
  private static readonly LOOP_HUB_METHOD_NAME = 'StartRandomSimulation';

  constructor(private store: Store<AppState>) {
  }

  public initalizeSignalRConnection(): void {
    console.log('Trying to connect to SignalR hub...');
    const connection = new signalR.HubConnectionBuilder().withUrl(OrdersQueueService.HUB_URL, {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    }).build();

    connection.on(OrdersQueueService.ADD_ORDER_HUB_METHOD_NAME, (rawOrder: RawOrder) => {
      this.store.dispatch(addOrderToQueue({order: Order.parseOrder(rawOrder)}));
      this.store.dispatch(loadOrdersSuccess());
    });

    connection.on(OrdersQueueService.REMOVE_ORDER_HUB_METHOD_NAME, (orderId: string) => {
      this.store.dispatch(removeOrderFromQueue({uuidToRemove: orderId}));
    });

    connection.start().then(() => {
      console.log('Have succesfully connected!');
      this.store.dispatch(loadOrdersStart());
      connection.invoke(OrdersQueueService.LOOP_HUB_METHOD_NAME);
    }).catch((err) => {
      this.store.dispatch(loadOrdersError({
        error: {
          message: "Виникла помилка: не можу підключитись до серверу!",
        }
      }));

      return console.error(err.toString());
    });
  }

}
