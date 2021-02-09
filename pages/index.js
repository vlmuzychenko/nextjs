// Core
import nookies from 'nookies';
import fs from 'fs';
// Components
import Menu from '../components/menu/menu';
import Message from '../components/message/message';
import UserComponent from '../components/user-component/user-component';
// Reducer
import { userActions } from "../bus/user/actions";
import { selectUserId, selectUserVisitCounts, selectUserType } from "../bus/user/selectors";
import { initializeStore } from '../init/store';
import { initialDispatcher } from '../init/initialDispatcher';
import { USER_COOKIE_NAME } from '../const/const';
// Helpers
import { getUniqueId, getCurrentUser, getUserType } from '../helpers/common';

export const getServerSideProps = async (context) => {
  console.log('getServerSideProps: Home');

  const store = await initialDispatcher(context, initializeStore());  
  const cookies = nookies.get(context);
  const { user, isIncreased } = cookies;
  
  if (Boolean(isIncreased)) {
    nookies.destroy(context, 'isIncreased');
  };

  let userUniqueId = selectUserId(store.getState());
  let userVisitCounts = selectUserVisitCounts(store.getState());
  let userType = selectUserType(store.getState());

  if (user) {
    try {
      const source = await fs.promises.readFile('./data/users.json', 'utf-8');
      const data = source ? JSON.parse(source) : [];
      const currentUser = getCurrentUser(data, user);

      if (currentUser >= 0) {
        data[currentUser].visitCount++;
        console.log('data[currentUser]', data[currentUser]);
        userVisitCounts = data[currentUser].visitCount;
        userUniqueId = data[currentUser].id;
        userType = getUserType(userVisitCounts);
      } else {
        data.push({ id: parseInt(user), visitCount: userVisitCounts });
      }

      await fs.promises.writeFile('./data/users.json', JSON.stringify(data, null, 4))
    } catch (error) {
        console.error(error.message)
    }
  } else {
    userType = getUserType(userVisitCounts);
    userUniqueId = getUniqueId();
    nookies.set(context, USER_COOKIE_NAME, userUniqueId);

    try {
      const source = await fs.promises.readFile('./data/users.json', 'utf-8');
      const data = source ? JSON.parse(source) : [];
      data.push({ id: userUniqueId, visitCount: userVisitCounts });

      await fs.promises.writeFile('./data/users.json', JSON.stringify(data, null, 4))
    } catch (error) {
        console.error(error.message)
    }
  }

  store.dispatch(userActions.fillUser(userUniqueId));
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
  
  console.log('getServerSideProps: Home will sent to APP ', initialReduxState);
  
  return {
    props: {
      initialReduxState,
    }
  }
}

const Home = ({initialReduxState}) => {
  console.log('Home Page');

  return (
    <>
      <Menu />
      <UserComponent />
      <Message />
    </>
    
  )
}

export default Home;
