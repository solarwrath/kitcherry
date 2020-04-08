import Order from "../models/order.model";
import {createReducer, on, Action} from '@ngrx/store';
import * as OrdersQueueActions from "./orders-queue.actions";
import _ from 'lodash';
import ErrorData from "../util/error";

export interface AppState {
  ordersQueue: State;
}

export interface State {
  cashBoxState: CashBox[],
  isLoading: boolean,
  selectedCashBoxTabHeading: string,
  loadError: ErrorData
}

export interface CashBox {
  id: number,
  orders: Order[],
}

const cashBoxCount: number = 8;

const generateCashBoxes = (): CashBox[] => {
  const result: CashBox[] = [];

  for (let i = 0; i < cashBoxCount; i++) {
    result.push({
      id: i + 1,
      orders: [],
    });
  }

  return result;
};

export const initialState: State = {
  cashBoxState: generateCashBoxes(),
  isLoading: false,
  selectedCashBoxTabHeading: '',
  loadError: null,
};

const _ordersQueueReducer = createReducer(
  initialState,
  on(OrdersQueueActions.loadOrdersStart, (state) => {
    return {
      ...state,
      isLoading: true,
    }
  }),
  on(OrdersQueueActions.loadOrdersSuccess, (state) => {
    return {
      ...state,
      isLoading: false,
    }
  }),
  on(OrdersQueueActions.loadOrdersError, (state, {error}) => {
    return {
      ...state,
      loadError: error,
      isLoading: false,
    }
  }),
  on
  (OrdersQueueActions.markOrderAsAssigned, (state, {orderToMarkAsAssigned}) => {
    //Be careful around here as NgRx runtime immutable checks will slaughter once you mutate anything
    //But also be aware that if you blindly go for the deep copies, unnecessary renders will arise
    let newCashBoxState = [...state.cashBoxState];

    const correspondingCashBox = newCashBoxState
      .find((currentCashBox: CashBox) => currentCashBox.id === orderToMarkAsAssigned.cashBoxId);
    const orderIndex = correspondingCashBox.orders
      .findIndex((currentOrder: Order) => currentOrder.id === orderToMarkAsAssigned.id);

    const copiedOrder = _.cloneDeep(orderToMarkAsAssigned);
    copiedOrder.isAssigned = true;

    const indexOfCashBoxToUpdate = newCashBoxState.indexOf(correspondingCashBox);
    newCashBoxState[indexOfCashBoxToUpdate] = _.cloneDeep(correspondingCashBox);
    newCashBoxState[indexOfCashBoxToUpdate].orders[orderIndex] = copiedOrder;

    return {
      ...state,
      cashBoxState: newCashBoxState,
    }
  }),
  on(OrdersQueueActions.removeOrderFromQueue, (state, {uuidToRemove}) => {
    const copiedCashBoxState = [...state.cashBoxState];

    for (let i = 0; i < copiedCashBoxState.length; i++) {
      const indexOfOrderToRemove = copiedCashBoxState[i].orders.findIndex((currentOrder) => currentOrder.id == uuidToRemove);
      if (indexOfOrderToRemove != -1) {
        const copiedCurrentCashBox = _.cloneDeep(copiedCashBoxState[i]);
        copiedCurrentCashBox.orders.splice(indexOfOrderToRemove, 1);

        copiedCashBoxState[i] = copiedCurrentCashBox;

        break;
      }
    }

    return {
      ...state,
      cashBoxState: copiedCashBoxState,
    }
  }),
  on(OrdersQueueActions.addOrderToQueue, (state, {order}) => {
    const copiedCashBoxState = [...state.cashBoxState];

    const cashBoxToAddToIndex = copiedCashBoxState.findIndex(currentCashBox => currentCashBox.id === order.cashBoxId);
    const copiedUpdatedCashBox = _.cloneDeep(copiedCashBoxState[cashBoxToAddToIndex]);
    copiedUpdatedCashBox.orders.push(order);

    copiedCashBoxState.splice(cashBoxToAddToIndex, 1, copiedUpdatedCashBox);

    return {
      ...state,
      cashBoxState: copiedCashBoxState,
      loadError: null,
      isLoading: false,
    }
  }),
  on(OrdersQueueActions.cashBoxTabClicked, (state, {selectedTabHeading}) => {
    return {
      ...state,
      selectedCashBoxTabHeading: selectedTabHeading,
    }
  })
  )
;

export function ordersQueueReducer(state: State | undefined, action: Action) {
  return _ordersQueueReducer(state, action);
}
