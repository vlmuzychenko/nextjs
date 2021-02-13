// Core
import fs from 'fs';
import * as R from 'ramda';
// Reducer
import { initialDispatcher } from "../init/initialDispatcher";
import { initializeStore } from "../init/store";
import { discountsActions } from '../bus/discounts/actions';
import { selectDiscounts } from '../bus/discounts/selectors';
import { selectUserId, selectUserType } from '../bus/user/selectors';
import { userActions } from '../bus/user/actions';
// Helpers
import { setDateOfReceiving, getParsedFile, getCurrentUser, getUserType, serverDispatch } from '../helpers/common';
// Components
import DiscountsComponent from '../components/discounts-component/discounts-component';
import Menu from '../components/menu/menu';
// Consts
import { UserType } from '../const/const';

export const getServerSideProps = async (context) => {
  const { store, stateUpdates } = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const user = selectUserId(store.getState());

  let discountsData = {};

  try {
    discountsData = getParsedFile(await promises.readFile('./data/discounts.json', 'utf-8'));

    setDateOfReceiving(discountsData, './data/discounts.json');
  }
  catch (error) {
    console.error(error);
  }

  const data = getParsedFile(await promises.readFile('./data/users.json', 'utf-8'));
  const currentUser = getCurrentUser(data, user);
  const userVisitCounts = data[currentUser].visitCount;
  const userType = getUserType(userVisitCounts);

  await serverDispatch(store, (dispatch) => {
    dispatch(userActions.setVisitCounts({userVisitCounts}));
    dispatch(userActions.setUserType({userType}));
    dispatch(discountsActions.fillDiscounts(discountsData));
  });

  const initialUserType = selectUserType(store.getState());

  if (initialUserType.userType !== UserType.FAM && initialUserType.userType !== UserType.FRIEND) {
    return {
      redirect: {
        destination: '/',
      }
    }
  }

  const currentPageReduxState = {
    discounts: selectDiscounts(store.getState())
  };

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

const Discounts = (props) => {
  const {} = props;

  return (
    <>
      <Menu />
      <h1>Discounts</h1>
      <DiscountsComponent/>
    </>
  );
};

export default Discounts;
