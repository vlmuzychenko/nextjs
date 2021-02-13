// Core
import nookies from 'nookies';
import fs from 'fs';
import * as R from 'ramda';
// Reducer
import { initializeStore } from '../init/store';
import { initialDispatcher } from '../init/initialDispatcher';
import { userActions } from "../bus/user/actions";
import { selectUserId, selectUserVisitCounts, selectUserType } from "../bus/user/selectors";
// Components
import Menu from '../components/menu/menu';
import UserComponent from '../components/user-component/user-component';
// Helpers
import { getCurrentUser, getUserType, serverDispatch } from '../helpers/common';

export const getServerSideProps = async (context) => {
  const { store, stateUpdates } = await initialDispatcher(context, initializeStore());
  const cookies = nookies.get(context);
  const { isIncreased } = cookies;

  if (Boolean(isIncreased)) {
    nookies.destroy(context, 'isIncreased');
  };

  const user = selectUserId(store.getState());
  let userType = selectUserType(store.getState());
  let userVisitCounts = selectUserVisitCounts(store.getState());

  try {
    const source = await fs.promises.readFile('./data/users.json', 'utf-8');
    const data = source ? JSON.parse(source) : [];
    const currentUser = getCurrentUser(data, user);
    userVisitCounts = data[currentUser].visitCount;
    userType = getUserType(userVisitCounts);
  } catch (error) {
      console.error(error.message)
  }

  await serverDispatch(store, (dispatch) => {
    dispatch(userActions.setVisitCounts(userVisitCounts));
  });
  
  let currentPageReduxState = {};

  if ('isIncreased' in cookies) {
    currentPageReduxState = {
      user: {
        userVisitCounts: selectUserVisitCounts(store.getState()),
      }
    };
  } else {
    await serverDispatch(store, (dispatch) => {
      dispatch(userActions.setUserType(userType));
    });

    currentPageReduxState = {
      user: {
        userVisitCounts: selectUserVisitCounts(store.getState()),
        userType: selectUserType(store.getState()),
      }
    };
  }

  const initialReduxState = R.mergeDeepRight( 
    stateUpdates,
    currentPageReduxState
  );

  return {
    props: {
      initialReduxState,
    }
  }
}

const User = ({initialReduxState}) => {
  return (
    <>
      <Menu />
      <UserComponent />
    </>
  )
}

export default User;