// Core
import { useMemo } from 'react';
import * as R from 'ramda';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  createStore,
  applyMiddleware,
} from 'redux';

// Middleware
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

// Instruments
import { rootReducer } from './rootReducer';
import { rootSaga } from './rootSaga';

let store;

const bindMiddleware = (middleware) => {
  if(process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    middleware.push(
      createLogger({
        duration: true,
        timestamp: true,
        collapsed: true,
        diff: true,
      })
    )
  }

  return composeWithDevTools(applyMiddleware(...middleware));
}

export const initStore = (preloadedState) => {
  console.log('initStore: preloadedState', preloadedState);

  const defaultState = preloadedState ? createStore(rootReducer).getState() : {};
  const currentState = R.mergeDeepRight(
    defaultState,
    preloadedState,
  );

  const sagaMiddleware = createSagaMiddleware();
  const initedStore = createStore(
    rootReducer,
    currentState,
    bindMiddleware([ sagaMiddleware ]),
  );

  initedStore.sagaTask = sagaMiddleware.run(rootSaga);

  console.log('initStore: initedStore.getState()', initedStore.getState());

  return initedStore;
};

export const initializeStore = (preloadedState = {}) => {
  console.log('initializeStore: preloadedState', preloadedState);
  let initializedStore = store || initStore(preloadedState);
  console.log('initializeStore: initializedStore.getState()', initializedStore.getState());

  if (preloadedState && store) {
    initializedStore = initStore(R.mergeDeepRight(
      store.getState(),
      preloadedState
    ));

    store = undefined;
  }

  if (typeof window === 'undefined') {
    return initializedStore;
  }

  if (!store) {
    store = initializedStore;
  }

  return initializedStore;
};

export const useStore = (initialState = {}) => {
  return useMemo(
    () => initializeStore(initialState), [ initialState ])
};
