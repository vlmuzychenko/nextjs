// Core
import fs from 'fs';
import * as R from 'ramda';
// Reducer
import { initialDispatcher } from "../init/initialDispatcher";
import { initializeStore } from "../init/store";
import { carsActions } from '../bus/cars/actions';
import { selectCars } from '../bus/cars/selectors';
import { selectUserId, selectUserType } from '../bus/user/selectors'; 
import { userActions } from '../bus/user/actions';
// Helpers
import { setDateOfReceiving, getParsedFile, getCurrentUser, getUserType, serverDispatch } from '../helpers/common';
// Components
import CarsComponent from '../components/cars-component/cars-component';
import Menu from '../components/menu/menu';
// Consts
import { UserType } from '../const/const';


export const getServerSideProps = async (context) => {
  const { store, stateUpdates } = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const user = selectUserId(store.getState());

  let carsData = {};

  try {
    carsData = getParsedFile(await promises.readFile('./data/cars.json', 'utf-8'));

    setDateOfReceiving(carsData, './data/cars.json');
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

  const initialUserType = selectUserType(store.getState());

  if (initialUserType.userType !== UserType.FAM) {
    return {
      redirect: {
        destination: '/',
      }
    }
  }

  const currentPageReduxState = {
    cars: selectCars(store.getState()),
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

const Cars = (props) => {
  const {} = props;

  return (
    <>
      <Menu />
      <h1>Cars</h1>
      <CarsComponent/>
    </>
  );
};

export default Cars;
