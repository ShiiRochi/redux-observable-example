import {
  Action,
  Reducer,
  compose,
  createStore,
  combineReducers,
  applyMiddleware
} from "redux";
import { createEpicMiddleware, ofType, combineEpics } from "redux-observable";
import * as RxOp from "rxjs/operators";
import { of } from "rxjs";

export interface IProduct {
  name: string;
}

export interface IProductState {
  products: IProduct[];
}

export interface IAppState {
  productState: IProductState;
}

export const FETCH_PRODUCTS_ACTION: string = "FetchProduct";
export const FETCH_PRODUCTS_FULFILLED_ACTION: string = "FetchProductFulfilled";

export const fetchProducts = (): IFetchProductsAction => ({
  type: FETCH_PRODUCTS_ACTION
});

export const fetchProductsFulfilled = (
  payload: IProduct[]
): IFetchProductsFulfilledAction => ({
  type: FETCH_PRODUCTS_FULFILLED_ACTION,
  products: payload
});

export interface IFetchProductsAction
  extends Action<typeof FETCH_PRODUCTS_ACTION> {}

export interface IFetchProductsFulfilledAction
  extends Action<typeof FETCH_PRODUCTS_FULFILLED_ACTION> {
  products: IProduct[];
}

const initialState: IProductState = { products: [] };

// the last call result would be seen, because each time new action came
// switchMap will subscribe to new stream, unsubscrtbing from the previous
export const firstActionEpic = action$ => {
  return action$.pipe(
    ofType("action/first"),
    RxOp.switchMap(action => {
      return of({
        ...action,
        type: "action/first-callback"
      }).pipe(
        RxOp.delay(action.timer),
        RxOp.map(action => {
          console.log({
            ...action,
            type: "action/first-callback"
          });
          return action;
        })
      );
    })
  );
};

// All calls results will be seen in the order they're emitted not only by dispatch,
// but also in the order their timer has finished
export const secondActionEpic = action$ => {
  return action$.pipe(
    ofType("action/second"),
    RxOp.mergeMap(action => {
      return of({
        ...action,
        type: "action/second-callback"
      }).pipe(
        RxOp.delay(action.timer),
        RxOp.map(action => {
          console.log({
            ...action,
            type: "action/second-callback"
          });
          return action;
        })
      );
    })
  );
};

// All result will be seen in the order, they're emitted
// Each one emitted will be listened until completion before emitting the next one
export const thirdActionEpic = action$ => {
  return action$.pipe(
    ofType("action/third"),
    RxOp.concatMap(action => {
      return of({
        ...action,
        type: "action/third-callback"
      }).pipe(
        RxOp.delay(action.timer),
        RxOp.map(action => {
          console.log({
            ...action,
            type: "action/third-callback"
          });
          return action;
        })
      );
    })
  );
};

// only the first call will be seen,
// after the first call, all other calls will be ignored
// new call will be acceptable after current active call is completed
export const fourthActionEpic = action$ => {
  return action$.pipe(
    ofType("action/fourth"),
    RxOp.exhaustMap(action => {
      return of({
        ...action,
        type: "action/fourth-callback"
      }).pipe(
        RxOp.delay(action.timer),
        RxOp.map(action => {
          console.log({
            ...action,
            type: "action/fourth-callback"
          });
          return action;
        })
      );
    })
  );
};

export const fetchProductReducer: Reducer<
  IProductState,
  IFetchProductsAction
> = (
  state: IProductState = initialState,
  action: IFetchProductsFulfilledAction
) => {
  switch (action.type) {
    case FETCH_PRODUCTS_FULFILLED_ACTION:
      return {
        ...state,
        products: action.products
      };
    default:
      return state;
  }
};

const epics = combineEpics(
  firstActionEpic,
  secondActionEpic,
  thirdActionEpic,
  fourthActionEpic
);

const rootReducer = combineReducers<IAppState>({
  productState: fetchProductReducer
});

// @ts-ignore
// prettier-ignore
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const configStore = () => {
  const epicMiddleware = createEpicMiddleware();
  const store = createStore(
    rootReducer,
    composeEnhancer(applyMiddleware(epicMiddleware))
  );
  epicMiddleware.run(epics);

  return store;
};
