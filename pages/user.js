// Core
import nookies from 'nookies';
import fs from 'fs';
// Reducer
import { initializeStore } from '../init/store';
import { initialDispatcher } from '../init/initialDispatcher';
import { userActions } from "../bus/user/actions";
import { selectUserId, selectUserVisitCounts, selectUserType } from "../bus/user/selectors";
// Components
import Menu from '../components/menu/menu';
import UserComponent from '../components/user-component/user-component';
// Helpers
import { getCurrentUser, getUserType } from '../helpers/common';

export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());
  const cookies = nookies.get(context);
  const { user, isIncreased } = cookies;

  if (Boolean(isIncreased)) {
    nookies.destroy(context, 'isIncreased');
  };

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

  store.dispatch(userActions.fillUser(user));
  store.dispatch(userActions.setVisitCounts(userVisitCounts));
  
  let initialReduxState = {};

  if ('isIncreased' in cookies) {
    initialReduxState = {
      user: {
        userId: selectUserId(store.getState()),
        userVisitCounts: selectUserVisitCounts(store.getState()),
      }
    };
  } else {
    store.dispatch(userActions.setUserType(userType));

    initialReduxState = {
      user: {
        userId: selectUserId(store.getState()),
        userVisitCounts: selectUserVisitCounts(store.getState()),
        userType: selectUserType(store.getState()),
      }
    };
  }

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