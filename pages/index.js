import nookies from 'nookies'
import fs from 'fs'
import { USER_COOKIE_NAME } from '../const/const.js'
import { getUniqueId, getCurrentUser } from '../helpers/common.js'

export const getServerSideProps = async (context) => {
  const cookies = nookies.get(context);
  const userId = USER_COOKIE_NAME in cookies ? cookies.userId : null;
  let isGuest = false;
  let isFriend = false;
  let isFam = false;

  if (userId) {
    try {
      const source = await fs.promises.readFile('./data/users.json', 'utf-8');
      const data = source ? JSON.parse(source) : [];
      const user = getCurrentUser(data, userId);
      data[user].vistCount++;
      const userVisitCount = data[user].vistCount;

      isGuest = userVisitCount < 3;
      isFriend = (userVisitCount >= 3 && userVisitCount < 5);
      isFam = userVisitCount >= 5;

      await fs.promises.writeFile('./data/users.json', JSON.stringify(data, null, 4))
    } catch (error) {
        console.error(error.message)
    }
  } else {
    isGuest = true;
    const userUniqueId = getUniqueId();
    nookies.set(context, USER_COOKIE_NAME, userUniqueId);

    try {
      const source = await fs.promises.readFile('./data/users.json', 'utf-8');
      const data = source ? JSON.parse(source) : [];
      const newUser = { id: userUniqueId, vistCount: 1 };

      data.push(newUser);

      await fs.promises.writeFile('./data/users.json', JSON.stringify(data, null, 4))
    } catch (error) {
        console.error(error.message)
    }
  }
  
  return {
    props: {
      isGuest,
      isFriend,
      isFam
    }
  }
}

const Home = (props) => {
  const {
    isGuest,
    isFriend,
    isFam
  } = props;

  const guestJSX = isGuest && (
    <h1>Приветствуем тебя странник!</h1>
  );

  const friendJSX = isFriend && (
    <h1>Приветствуем тебя друг!</h1>
  );

  const famJSX = isFam && (
    <h1>Добро пожаловать в семье!</h1>
  );

  return (
    <>
      { guestJSX }
      { friendJSX }
      { famJSX }
    </>
  )
}

export default Home;
