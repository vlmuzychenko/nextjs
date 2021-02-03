import { useSelector } from "react-redux";
import { UserType } from '../../const/const';

const Message = (props) => {
  const {} = props;
  const { user } = useSelector((state) => state);
  console.log('message', user);

  const guestJSX = user.userType === UserType.GUEST && (
    <h1>Приветствуем тебя странник!</h1>
  );

  const friendJSX = user.userType === UserType.FRIEND && (
    <h1>Приветствуем тебя друг!</h1>
  );

  const famJSX = user.userType === UserType.FAM && (
    <h1>Добро пожаловать в семье!</h1>
  );

  return (
    <>
      { guestJSX }
      { friendJSX }
      { famJSX }
      { user.userType }
    </>
  )
}

export default Message;