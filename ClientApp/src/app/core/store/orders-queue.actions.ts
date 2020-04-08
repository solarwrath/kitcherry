import {createAction, props} from '@ngrx/store';
import Order from "../models/order.model";
import UUID from "../util/uuid";
import ErrorData from "../util/error";

export const LOAD_ORDERS_START = '[Orders Queue API] Load Orders Start';
export const loadOrdersStart = createAction(LOAD_ORDERS_START);

export const LOAD_ORDERS_SUCCESS = '[Orders Queue API] Load Orders Success';
export const loadOrdersSuccess = createAction(LOAD_ORDERS_SUCCESS);

export const MARK_ORDER_AS_ASSIGNED = '[Orders Queue] Mark Order As Assigned';
export const markOrderAsAssigned = createAction(MARK_ORDER_AS_ASSIGNED, props<{ orderToMarkAsAssigned: Order }>());

export const REMOVE_ORDER_FROM_QUEUE = '[Orders Queue API] Remove Order From Queue';
export const removeOrderFromQueue = createAction(REMOVE_ORDER_FROM_QUEUE, props<{ uuidToRemove: UUID }>());

export const ADD_ORDER_TO_QUEUE = '[Orders Queue API] Add Order To Queue';
export const addOrderToQueue = createAction(ADD_ORDER_TO_QUEUE, props<{ order: Order }>());

export const LOAD_ORDERS_ERROR = '[Orders Queue API] Load Orders Error';
export const loadOrdersError = createAction(LOAD_ORDERS_ERROR, props<{ error: ErrorData }>());

export const CASH_BOX_TAB_CLICKED = '[Cash Box Tabs] Cash Box Tab Clicked';
export const cashBoxTabClicked = createAction(CASH_BOX_TAB_CLICKED, props<{ selectedTabHeading: string }>());

/*
	[Section] Action form is used as all the action are passed to all the reducers, so collision of names is likely
* */
