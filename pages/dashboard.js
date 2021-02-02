import nookies from 'nookies'
import fs from 'fs'
import News from '../components/news/news.js'
import Discounts from '../components/discounts/discounts.js'
import Cars from '../components/cars/cars.js'
import { USER_COOKIE_NAME } from '../const/const.js'
import { setDateOfReceiving, getCurrentDate, getCurrentUser } from '../helpers/common.js'
import newsData from '../mocks/news.js'
import discountsData from '../mocks/discounts.js'
import carsData from '../mocks/cars.js'

export const getServerSideProps = async (context) => {
  const cookies = nookies.get(context);
  const userId = USER_COOKIE_NAME in cookies ? cookies.userId : null;
  const dateOfReceiving = getCurrentDate();
  const news = setDateOfReceiving(newsData, dateOfReceiving);
  const discounts = setDateOfReceiving(discountsData, dateOfReceiving);
  const cars = setDateOfReceiving(carsData, dateOfReceiving);
  let isGuest = false;
  let isFriend = false;
  let isFam = false;

  try {
    const source = await fs.promises.readFile('./data/users.json', 'utf-8');
    const data = source ? JSON.parse(source) : [];
    const user = getCurrentUser(data, userId);
    const userVisitCount = data[user].vistCount;

    isGuest = userVisitCount < 3;
    isFriend = (userVisitCount >= 3 && userVisitCount < 5);
    isFam = userVisitCount >= 5;
  } catch (error) {
      console.error(error.message)
  }

  return {
    props: {
      isGuest,
      isFriend,
      isFam,
      news,
      discounts,
      cars
    }
  }
}

const Dashboard = (props) => {
  const {
    isGuest,
    isFriend,
    isFam,
    news,
    discounts,
    cars
  } = props;

  const guestJSX = isGuest && (
    <News data={news} />
  );

  const friendJSX = isFriend && (
    <>
      <News data={news} />
      <Discounts data={discounts} />
    </>
  );

  const famJSX = isFam && (
    <>
      <News data={news} />
      <Discounts data={discounts} />
      <Cars data={cars} />
    </>
  );

  return (
    <>
      { guestJSX }
      { friendJSX }
      { famJSX }
    </>
  )
}

export default Dashboard;