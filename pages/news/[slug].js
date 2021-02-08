//Core
import fs from 'fs';
import nookies from 'nookies';
//Redux
import { initialDispatcher } from '../../init/initialDispatcher';
import { initializeStore } from '../../init/store';
import { userActions } from '../../bus/user/actions';
import { newsActions } from '../../bus/news/actions';
import { selectNews } from '../../bus/news/selectors';
import { selectUserType } from '../../bus/user/selectors';
//Components
import BackLink from '../../components/back-link/back-link';
import ArticleComponent from '../../components/article-component/article-component';
//Helpers
import { getParsedFile, getSlugIndex, getUserType, getCurrentUser } from '../../helpers/common';

export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());

  const promises = fs.promises;
  const cookies = nookies.get(context);
  const { user } = cookies;

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

  store.dispatch(userActions.fillUser({user}));
  store.dispatch(userActions.setVisitCounts({userVisitCounts}));
  store.dispatch(userActions.setUserType({userType}));
  store.dispatch(newsActions.fillNews(newsData));

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

  const initialUserType = selectUserType(store.getState());

  const initialReduxState = {
    news: initialNews,
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
      <h1>Article page</h1>
      <ArticleComponent/>
    </>
  );
};

export default Slug;