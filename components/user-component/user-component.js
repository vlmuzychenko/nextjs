import { setCookie } from 'nookies';
import { useSelector, useDispatch } from "react-redux";
import { userActions } from "../../bus/user/actions";
import { selectUserId, selectUserVisitCounts, selectUserType } from "../../bus/user/selectors";
import { updateUserType } from '../../helpers/common';

const UserComponent = () => {
  console.log('User Component');
  const dispatch = useDispatch();
  const userId = useSelector(selectUserId);
  const userVisitCounts = useSelector(selectUserVisitCounts);
  const userType = useSelector(selectUserType);

  const handleUserButtonClick = () => {
    setCookie(null, 'isIncreased', true);
    const updatedUserType = updateUserType(userType);

    dispatch(userActions.setUserType(updatedUserType));
  }

  return (
    <>
      <h1>User Info</h1>
      <ul>
        <li>id: { userId }</li>
        <li>visits: { userVisitCounts }</li>
        <li>type: { userType }</li>
      </ul>
      <button 
        onClick={handleUserButtonClick}>
        Временно повысить статус
        </button>
    </>
  )
}

export default UserComponent;