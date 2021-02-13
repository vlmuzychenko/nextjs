//Core
import fs from 'fs';
import * as R from 'ramda';
//Redux
import { initialDispatcher } from '../../init/initialDispatcher';
import { initializeStore } from '../../init/store';
import { carsActions } from '../../bus/cars/actions';
import { selectCars } from '../../bus/cars/selectors';
import { userActions } from '../../bus/user/actions';
import { selectUserId, selectUserType } from '../../bus/user/selectors';
//Components
import BackLink from '../../components/back-link/back-link';
import CarComponent from '../../components/car-component/car-component';
//Helpers
import { getParsedFile, getSlugIndex, getUserType, getCurrentUser, serverDispatch } from '../../helpers/common';
// Consts
import { UserType } from '../../const/const';

export const getServerSideProps = async (context) => {
  const { store, stateUpdates } = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const user = selectUserId(store.getState());

  let carsData = {};

  try {
    carsData = getParsedFile(await promises.readFile('./data/cars.json', 'utf-8'));
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
    dispatch(carsActions.fillCars(carsData));
  });

  const initialCars = selectCars(store.getState());
  const slug = context.query.slug;
  const slugIndexInCars = getSlugIndex(initialCars, slug);

  if (slugIndexInCars < 0) {
    return {
      redirect: {
        destination: '/404',
      }
    }
  }

  const initialUserType = selectUserType(store.getState());

  if (initialUserType.userType !== UserType.FAM) {
    return {
      redirect: {
        destination: '/',
      }
    }
  }

  const currentPageReduxState = {
    cars: initialCars,
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
      <h1>Car page</h1>
      <CarComponent/>
    </>
  );
};

export default Slug;