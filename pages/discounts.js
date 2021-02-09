// Core
import fs from 'fs';
import nookies from 'nookies';
// Reducer
import { initialDispatcher } from "../init/initialDispatcher";
import { initializeStore } from "../init/store";
import { discountsActions } from '../bus/discounts/actions';
import { selectDiscounts } from '../bus/discounts/selectors';
import { selectUserType } from '../bus/user/selectors';
import { userActions } from '../bus/user/actions';
// Helpers
import { setDateOfReceiving, getParsedFile, getCurrentUser, getUserType } from '../helpers/common';
// Components
import DiscountsComponent from '../components/discounts-component/discounts-component';
// Consts
import { UserType } from '../const/const';

export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const cookies = nookies.get(context);
  const { user } = cookies;

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

  store.dispatch(userActions.fillUser({user}));
  store.dispatch(userActions.setVisitCounts({userVisitCounts}));
  store.dispatch(userActions.setUserType({userType}));
  store.dispatch(discountsActions.fillDiscounts(discountsData));

  const initialUserType = selectUserType(store.getState());

  if (initialUserType.userType !== UserType.FAM && initialUserType.userType !== UserType.FRIEND) {
    return {
      redirect: {
        destination: '/',
      }
    }
  }

  const initialReduxState = {
    discounts: selectDiscounts(store.getState()),
  };

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
      <h1>Discounts</h1>
      <DiscountsComponent/>
    </>
  );
};

export default Discounts;
