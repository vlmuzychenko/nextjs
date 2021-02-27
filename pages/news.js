// Core
import fs from 'fs';
import path from 'path'
import * as R from 'ramda';
// Reducer
import { initialDispatcher } from "../init/initialDispatcher";
import { initializeStore } from "../init/store";
import { newsActions } from '../bus/news/actions';
import { selectNews } from '../bus/news/selectors';
import { userActions } from '../bus/user/actions';
import { selectUserId } from '../bus/user/selectors';
// Helpers
import { setDateOfReceiving, getParsedFile, getCurrentUser, getUserType, serverDispatch } from '../helpers/common';
// Components
import NewsComponent from '../components/news-component/news-component';
import Menu from '../components/menu/menu';

export const getServerSideProps = async (context) => {
  const { store, stateUpdates }  = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const user = selectUserId(store.getState());

  let newsData = {};

  try {
    newsData = getParsedFile(await promises.readFile(path.resolve('./data/', 'news.json'), 'utf-8'));

    setDateOfReceiving(promises, newsData, path.resolve('./data/', 'news.json'));
  }
  catch (error) {
    console.error(error);
  }

  const data = getParsedFile(await promises.readFile(path.resolve('./data/', 'news.json'), 'utf-8'));
  const currentUser = getCurrentUser(data, user);
  const userVisitCounts = data[currentUser].visitCount;
  const userType = getUserType(userVisitCounts);

  await serverDispatch(store, (dispatch) => {
    dispatch(userActions.setVisitCounts({userVisitCounts}));
    dispatch(userActions.setUserType({userType}));
    dispatch(newsActions.fillNews(newsData));
  });

  const currentPageReduxState = {
    news: selectNews(store.getState()),
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

const News = (props) => {
  return (
    <>
      <Menu />
      <h1>News</h1>
      <NewsComponent />
    </>
  );
};

export default News;