//Core
import fs from 'fs';
import nookies from 'nookies';
//Redux
import { initialDispatcher } from '../../init/initialDispatcher';
import { initializeStore } from '../../init/store';
//Bus
import { discountsActions } from '../../bus/discounts/actions';
import { selectDiscounts } from '../../bus/discounts/selectors';
import { userActions } from '../../bus/user/actions';
import { selectUserType } from '../../bus/user/selectors';
//Components
import BackLink from '../../components/back-link/back-link';
import DiscountComponent from '../../components/discount-component/discount-component';
//Helpers
import { getParsedFile, getSlugIndex, getUserType, getCurrentUser } from '../../helpers/common';
// Consts
import { UserType } from '../../const/const';

export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const cookies = nookies.get(context);
  const { user } = cookies;

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

  store.dispatch(userActions.fillUser({user}));
  store.dispatch(userActions.setVisitCounts({userVisitCounts}));
  store.dispatch(userActions.setUserType({userType}));
  store.dispatch(discountsActions.fillDiscounts(discountsData));

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

  const initialReduxState = {
    discounts: initiaDiscounts,
  };

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