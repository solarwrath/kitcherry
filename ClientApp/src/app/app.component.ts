import {Component} from '@angular/core';
import {OrdersQueueService} from "./core/services/orders-queue.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private ordersQueueService: OrdersQueueService) {
    ordersQueueService.initalizeSignalRConnection();
  }
}
