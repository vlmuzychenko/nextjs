import { initializeStore } from '../init/store';
import { initialDispatcher } from '../init/initialDispatcher';
import Menu from '../components/menu/menu';
import UserComponent from '../components/user-component/user-component';

export const getServerSideProps = async (context) => {
  const store = await initialDispatcher(context, initializeStore());
  const initialReduxState = store.getState();

  return {
    props: {
      initialReduxState,
    }
  }
}

const User = (props) => {
  const {
    initialReduxState
  } = props;

  console.log(initialReduxState);

  return (
    <>
      <Menu />
      <UserComponent />
    </>
  )
}

export default User;