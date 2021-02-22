// Core
import { put, call, delay } from 'redux-saga/effects';

// Instruments
import { catsActions } from '../../actions';

export function* loadCats () {
  try {
    const response = yield call(fetch, 'api/cats');

    const results = yield call([response, response.json]);

    if (response.status !== 200) {
      throw new Error(`We can't receive starships 😢`);
    }

    yield delay(2000);
    yield put(catsActions.fillCats(results));
  } catch (error) {
    console.log('loadCatsAsync', error);
  }
}
