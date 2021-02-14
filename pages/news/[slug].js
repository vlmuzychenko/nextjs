//Core
import fs from 'fs';
import * as R from 'ramda';
//Redux
import { initialDispatcher } from '../../init/initialDispatcher';
import { initializeStore } from '../../init/store';
import { userActions } from '../../bus/user/actions';
import { newsActions } from '../../bus/news/actions';
import { selectNews } from '../../bus/news/selectors';
import { selectUserId } from '../../bus/user/selectors';
//Components
import BackLink from '../../components/back-link/back-link';
import ArticleComponent from '../../components/article-component/article-component';
//Helpers
import { getParsedFile, getSlugIndex, getUserType, getCurrentUser, serverDispatch } from '../../helpers/common';

export const getServerSideProps = async (context) => {
  const { store, stateUpdates } = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const user = selectUserId(store.getState());

  let newsData = {};

  try {
    newsData = getParsedFile(await promises.readFile('./data/news.json', 'utf-8'));
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
    dispatch(newsActions.fillNews(newsData));
  });

  const initialNews = selectNews(store.getState());
  const slug = context.query.slug;
  const slugIndexInNews = getSlugIndex(initialNews, slug);

  if (slugIndexInNews < 0) {
    return {
      redirect: {
        destination: '/404',
      }
    }
  }

  const currentPageReduxState = {
    news: initialNews,
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
      <h1>Article page</h1>
      <ArticleComponent/>
    </>
  );
};

export default Slug;