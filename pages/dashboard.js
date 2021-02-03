import nookies from 'nookies';
import fs from 'fs';
import Menu from '../components/menu/menu';
import News from '../components/news/news';
import Discounts from '../components/discounts/discounts';
import Cars from '../components/cars/cars';
import UserComponent from '../components/user-component/user-component';
import { USER_COOKIE_NAME, UserType } from '../const/const';
import { setDateOfReceiving, getCurrentDate, getCurrentUser, getUserType } from '../helpers/common';
import { initializeStore } from '../init/store';
import { initialDispatcher } from '../init/initialDispatcher';
import { useSelector, useDispatch } from "react-redux";
import { userActions } from "../bus/user/actions";
import newsData from '../mocks/news';
import discountsData from '../mocks/discounts';
import carsData from '../mocks/cars';

export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());
  const cookies = nookies.get(context);
  const userId = USER_COOKIE_NAME in cookies ? cookies.userId : null;
  let userType = UserType.GUEST;
  let userVisitCounts = 1;
  const dateOfReceiving = getCurrentDate();
  const news = setDateOfReceiving(newsData, dateOfReceiving);
  const discounts = setDateOfReceiving(discountsData, dateOfReceiving);
  const cars = setDateOfReceiving(carsData, dateOfReceiving);

  try {
    const source = await fs.promises.readFile('./data/users.json', 'utf-8');
    const data = source ? JSON.parse(source) : [];
    const user = getCurrentUser(data, userId);
    data[user].visitCount++;
    userVisitCounts = data[user].visitCount;
    userType = getUserType(userVisitCounts);

    await fs.promises.writeFile('./data/users.json', JSON.stringify(data, null, 4))
  } catch (error) {
      console.error(error.message)
  }

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
      news,
      discounts,
      cars
    }
  }
}

const Dashboard = (props) => {
  const {
    initialReduxState,
    news,
    discounts,
    cars
  } = props;

  console.log('dashboard', initialReduxState);

  const initialUserVisitCounts = initialReduxState.user.userVisitCounts;
  const initialUserType = initialReduxState.user.userType;
  const dispatch = useDispatch();
  dispatch(userActions.setUserType({ userVisitCounts: initialUserVisitCounts }));
  dispatch(userActions.setVisitCounts({ userType: initialUserType }));

  const { user } = useSelector((state) => state);

  const guestJSX = user.userType === UserType.GUEST && (
    <News data={news} />
  );

  const friendJSX = user.userType === UserType.FRIEND && (
    <>
      <News data={news} />
      <Discounts data={discounts} />
    </>
  );

  const famJSX = user.userType === UserType.FAM && (
    <>
      <News data={news} />
      <Discounts data={discounts} />
      <Cars data={cars} />
    </>
  );

  return (
    <>
      <Menu />
      <UserComponent />
      { guestJSX }
      { friendJSX }
      { famJSX }
    </>
  )
}

export default Dashboard;