//Core
import fs from 'fs';
import * as R from 'ramda';
//Redux
import { initialDispatcher } from '../../init/initialDispatcher';
import { initializeStore } from '../../init/store';
//Bus
import { discountsActions } from '../../bus/discounts/actions';
import { selectDiscounts } from '../../bus/discounts/selectors';
import { userActions } from '../../bus/user/actions';
import { selectUserId, selectUserType } from '../../bus/user/selectors';
//Components
import BackLink from '../../components/back-link/back-link';
import DiscountComponent from '../../components/discount-component/discount-component';
//Helpers
import { getParsedFile, getSlugIndex, getUserType, getCurrentUser, serverDispatch } from '../../helpers/common';
// Consts
import { UserType } from '../../const/const';

export const getServerSideProps = async (context) => {
  const { store, stateUpdates } = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const user = selectUserId(store.getState());

  let discountsData = {};

  try {
    discountsData = getParsedFile(await promises.readFile('./data/discounts.json', 'utf-8'));
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

  const initiaDiscounts = selectDiscounts(store.getState());
  const slug = context.query.slug;
  const slugIndexInDiscounts = getSlugIndex(initiaDiscounts, slug);

  if (slugIndexInDiscounts < 0) {
    return {
      redirect: {
        destination: '/404',
      }
    }
  }

  const initialUserType = selectUserType(store.getState());

  if (initialUserType.userType !== UserType.FAM && initialUserType.userType !== UserType.FRIEND) {
    return {
      redirect: {
        destination: '/',
      }
    }
  }

  const currentPageReduxState = {
    discounts: initiaDiscounts,
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
};

const Slug = (props) => {
  const {} = props;

  return (
    <>
      <BackLink/>
      <h1>Discount page</h1>
      <DiscountComponent />
    </>
  );
};

export default Slug;