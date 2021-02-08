// Core
import fs from 'fs';
import nookies from 'nookies';
// Reducer
import { initialDispatcher } from "../init/initialDispatcher";
import { initializeStore } from "../init/store";
import { newsActions } from '../bus/news/actions';
import { selectNews } from '../bus/news/selectors';
import { userActions } from '../bus/user/actions';
import { selectUserType } from '../bus/user/selectors';
// Helpers
import { setDateOfReceiving, getParsedFile, getCurrentUser, getUserType } from '../helpers/common';
// Components
import NewsComponent from '../components/news-component/news-component';

export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const cookies = nookies.get(context);
  const { user } = cookies;

  let newsData = {};

  try {
    newsData = getParsedFile(await promises.readFile('./data/news.json', 'utf-8'));

    setDateOfReceiving(promises, newsData, './data/news.json');
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
  store.dispatch(newsActions.fillNews(newsData));

  const initialUserType = selectUserType(store.getState());

  // if (initialUserType !== UserType.FAM && initialUserType !== UserType.FRIEND && initialUserType !== UserType.GUEST) {
  //   console.log('12345');
  //   return {
  //     redirect: {
  //       destination: '/',
  //     }
  //   }
  // }

  const initialReduxState = {
    news: selectNews(store.getState()),
  };

  return {
    props: {
      initialReduxState,
    }
  }
}

const News = (props) => {
  return (
    <>
      <h1>News</h1>
      <NewsComponent />
    </>
  );
};

export default News;