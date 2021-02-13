// Core
import nookies from 'nookies';
// Reducer
import { userActions } from "../bus/user/actions";
import { selectUserId } from "../bus/user/selectors";
// Helpers
import { getUniqueId, serverDispatch } from '../helpers/common';
import { USER_COOKIE_NAME } from '../const/const';


export const initialDispatcher = async (context, store) => {
  const cookies = nookies.get(context);
  const { user } = cookies;

  let userUniqueId = selectUserId(store.getState());

  if (user) {
    userUniqueId = parseInt(user);
  } else {
    userUniqueId = getUniqueId();
    nookies.set(context, USER_COOKIE_NAME, userUniqueId);
  }

  await serverDispatch(store, (dispatch) => {
    dispatch(userActions.fillUser(userUniqueId));
  });

  const stateUpdates = {
    user: {
      userId: selectUserId(store.getState()),
    }
  };


  return {
    store,
    stateUpdates,
  };
}