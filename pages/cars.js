// Core
import fs from 'fs';
import nookies from 'nookies';
// Reducer
import { initialDispatcher } from "../init/initialDispatcher";
import { initializeStore } from "../init/store";
import { carsActions } from '../bus/cars/actions';
import { selectCars } from '../bus/cars/selectors';
import { selectUserType } from '../bus/user/selectors'; 
import { userActions } from '../bus/user/actions';
// Helpers
import { setDateOfReceiving, getParsedFile, getCurrentUser, getUserType } from '../helpers/common';
// Components
import CarsComponent from '../components/cars-component/cars-component';
// Consts
import { UserType } from '../const/const';


export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const cookies = nookies.get(context);
  const { user } = cookies;

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

  store.dispatch(userActions.fillUser({user}));
  store.dispatch(userActions.setVisitCounts({userVisitCounts}));
  store.dispatch(userActions.setUserType({userType}));
  store.dispatch(carsActions.fillCars(carsData));

  const initialUserType = selectUserType(store.getState());

  if (initialUserType.userType !== UserType.FAM) {
    return {
      redirect: {
        destination: '/',
      }
    }
  }

  const initialReduxState = {
    cars: selectCars(store.getState()),
  };

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
      <h1>Cars</h1>
      <CarsComponent/>
    </>
  );
};

export default Cars;
