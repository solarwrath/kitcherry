import {createSelector} from "@ngrx/store";
import {AppState} from "./orders-queue.reducer";

export const selectAllCashBoxes = createSelector(
	(state: AppState) => state.ordersQueue.cashBoxState,
	(cashboxes) => cashboxes
);

export const selectCashBox = createSelector(
	(state: AppState) => state.ordersQueue.cashBoxState,
	(cashboxes, props) => cashboxes.find(cashbox => cashbox.id == props.id)
);
