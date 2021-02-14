// Core
import fs from 'fs';
import nookies from 'nookies';
import Link from 'next/link';
import * as R from 'ramda';
// Components
import Menu from '../components/menu/menu';
// Reducer
import { userActions } from "../bus/user/actions";
import { selectUserId, selectUserVisitCounts, selectUserType } from "../bus/user/selectors";
import { initializeStore } from '../init/store';
import { initialDispatcher } from '../init/initialDispatcher';
// Helpers
import { setDateOfReceiving, getCurrentUser, getUserType, getParsedFile, serverDispatch } from '../helpers/common';

export const getServerSideProps = async (context) => {
  const { store, stateUpdates } = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const cookies = nookies.get(context);
  const { isIncreased } = cookies;

  if (Boolean(isIncreased)) {
    nookies.destroy(null, 'isIncreased');
  };

  const user = selectUserId(store.getState());
  let userType = selectUserType(store.getState());
  let userVisitCounts = selectUserVisitCounts(store.getState());
  let newsData = {};
  let discountsData = {};
  let carsData = {};

  try {
    const source = await promises.readFile('./data/users.json', 'utf-8');
    const data = source ? JSON.parse(source) : [];
    const currentUser = getCurrentUser(data, user);
    data[currentUser].visitCount++;
    userVisitCounts = data[currentUser].visitCount;
    userType = getUserType(userVisitCounts);

    await promises.writeFile('./data/users.json', JSON.stringify(data, null, 4));

    newsData = getParsedFile(await promises.readFile('./data/news.json', 'utf-8'));
    discountsData = getParsedFile(await promises.readFile('./data/discounts.json', 'utf-8'));
    carsData = getParsedFile(await promises.readFile('./data/cars.json', 'utf-8'));

    setDateOfReceiving(promises, newsData, './data/news.json');
    setDateOfReceiving(promises, discountsData, './data/discounts.json');
    setDateOfReceiving(promises, carsData, './data/cars.json');

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
      newsData,
      discountsData,
      carsData,
    }
  }
}

const Dashboard = ({initialReduxState}) => {

  return (
    <>
      <Menu />
      <h1>Dashboard</h1>
      <ol>
        <li>
          <Link href='/news'>
            <a>News</a>
          </Link>
        </li>
        <li>
          <Link href='/discounts'>
            <a>Discounts</a>
          </Link>
        </li>
        <li>
          <Link href='/cars'>
            <a>Cars</a>
          </Link>
        </li>
      </ol>
    </>
  )
}

export default Dashboard;