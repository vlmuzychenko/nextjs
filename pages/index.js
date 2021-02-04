import nookies from 'nookies';
import fs from 'fs';
import Menu from '../components/menu/menu';
import Message from '../components/message/message';
import UserComponent from '../components/user-component/user-component';
import { USER_COOKIE_NAME, UserType } from '../const/const';
import { getUniqueId, getCurrentUser, getUserType } from '../helpers/common';
import { initializeStore } from '../init/store';
import { initialDispatcher } from '../init/initialDispatcher';
import { useDispatch } from "react-redux";
import { userActions } from "../bus/user/actions";

export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());
  const cookies = nookies.get(context);
  const userId = USER_COOKIE_NAME in cookies ? cookies.userId : null;
  let userUniqueId = 0;
  let userType = UserType.GUEST;
  let userVisitCounts = 1;

  if (userId) {
    try {
      const source = await fs.promises.readFile('./data/users.json', 'utf-8');
      const data = source ? JSON.parse(source) : [];
      const user = getCurrentUser(data, userId);

      if (user >= 0) {
        data[user].visitCount++;
        userVisitCounts = data[user].visitCount;
        userUniqueId = data[user].id;
        userType = getUserType(userVisitCounts);
      } else {
        data.push({ id: parseInt(userId), visitCount: userVisitCounts });
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

  store.dispatch(userActions.fillUser({
    userId: userUniqueId
  }));

  store.dispatch(userActions.setVisitCounts({
    userVisitCounts
  }));

  store.dispatch(userActions.setUserType({
    userType
  }));

  const initialReduxState = store.getState();
  
  return {
    props: {
      initialReduxState,
    }
  }
}

const Home = (props) => {
  const {
    initialReduxState,
  } = props;

  console.log('index', initialReduxState);
  const initialUserId = initialReduxState.user.userId;
  const initialUserVisitCounts = initialReduxState.user.userVisitCounts;
  const initialUserType = initialReduxState.user.userType;
  const dispatch = useDispatch();
  dispatch(userActions.fillUser({ userId: initialUserId }));
  dispatch(userActions.setUserType({ userVisitCounts: initialUserVisitCounts }));
  dispatch(userActions.setVisitCounts({ userType: initialUserType }));

  return (
    <>
      <Menu />
      <UserComponent />
      <Message />
    </>
    
  )
}

export default Home;
