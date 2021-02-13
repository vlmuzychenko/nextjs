// Core
import nookies from 'nookies';
import fs from 'fs';
import * as R from 'ramda';
// Components 
import Menu from '../components/menu/menu';
import Message from '../components/message/message';
import AsteroidsComponent from '../components/asteroids-component/asteroids-component';
import PokemonsComponent from '../components/pokemons-component/pokemons-component';
// Reducer
import { userActions } from "../bus/user/actions";
import { asteroidsActions } from "../bus/asteroids/actions";
import { selectUserId, selectUserVisitCounts, selectUserType } from "../bus/user/selectors";
import { selectAsteroidsEntries } from "../bus/asteroids/selectors";
import { initializeStore } from '../init/store';
import { initialDispatcher } from '../init/initialDispatcher';
// Helpers
import { getCurrentUser, getUserType, serverDispatch, disableSaga } from '../helpers/common';
//Other
import { initApollo } from "../init/initApollo";
import queryPokemons from '../bus/pokemons/hooks/usePokemons/gql/queryPokemons.graphql';

export const getServerSideProps = async (context) => {
  console.log('getServerSideProps: Home');

  const { store, stateUpdates } = await initialDispatcher(context, initializeStore());
  const initialApolloState = await initApollo(context, async (execute) => {
    await execute({
      query: queryPokemons,
    });
  });  
  const cookies = nookies.get(context);
  const { isIncreased } = cookies;
  
  if (Boolean(isIncreased)) {
    nookies.destroy(context, 'isIncreased');
  };

  const userUniqueId = selectUserId(store.getState());
  let userVisitCounts = selectUserVisitCounts(store.getState());
  let userType = selectUserType(store.getState());

  try {
    const source = await fs.promises.readFile('./data/users.json', 'utf-8');
    const data = source ? JSON.parse(source) : [];
    const currentUser = getCurrentUser(data, userUniqueId);

    if (currentUser >= 0) {
      data[currentUser].visitCount++;
      userVisitCounts = data[currentUser].visitCount;
      userType = getUserType(userVisitCounts);
    } else {
      data.push({ id: userUniqueId, visitCount: userVisitCounts });
    }

    await fs.promises.writeFile('./data/users.json', JSON.stringify(data, null, 4))
  } catch (error) {
      console.error(error.message)
  }

  await serverDispatch(store, (dispatch) => {
    dispatch(userActions.setVisitCounts(userVisitCounts));
    dispatch(asteroidsActions.loadAsteroidsAsync());
  });

  await disableSaga(store);

  let currentPageReduxState = {};

  if ('isIncreased' in cookies) {
    currentPageReduxState = {
      user: {
        userVisitCounts: selectUserVisitCounts(store.getState()),
      },
      asteroids: {
        entries: selectAsteroidsEntries(store.getState()),
      },
  
    };
  } else {
    await serverDispatch(store, (dispatch) => {
      dispatch(userActions.setUserType(userType));
    });

    currentPageReduxState = {
      user: {
        userVisitCounts: selectUserVisitCounts(store.getState()),
        userType: selectUserType(store.getState()),
      },
      asteroids: {
        entries: selectAsteroidsEntries(store.getState()),
      },
    };
  }

  const initialReduxState = R.mergeDeepRight( 
    stateUpdates,
    currentPageReduxState
  );

  
  console.log('getServerSideProps: Home will sent to APP ', initialReduxState);
  
  return {
    props: {
      initialReduxState,
      initialApolloState,
    }
  }
}

const Home = ({initialReduxState}) => {
  console.log('Home Page');

  return (
    <>
      <Menu />
      <Message />
      <AsteroidsComponent />
      <PokemonsComponent />
    </>
    
  )
}

export default Home;
