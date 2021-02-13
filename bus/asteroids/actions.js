import { types } from './types';

export const asteroidsActions = {
  // Sync
  fillAsteroids: (asteroids) => {
    return {
      type: types.FILL_ASTEROIDS,
      payload: asteroids,
    }
  },
  //Async
  loadAsteroidsAsync: () => {
    return {
      type: types.LOAD_ASTEROIDS_ASYNC,
    }
  }
};