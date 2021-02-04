import { useSelector } from "react-redux";
import { updateUserType } from '../../helpers/common';
import { useDispatch } from 'react-redux';
import { userActions } from "../../bus/user/actions";

const UserComponent = () => {
  const { user } = useSelector((state) => state);
  const dispatch = useDispatch();

  const handleUserButtonClick = () => {
    const updatedUserType = updateUserType(user.userVisitCounts);
    console.log(updatedUserType);

    return dispatch(userActions.setUserType({
      userType: updatedUserType
    }))
  }

  return (
    <>
      <h1>User Info</h1>
      <ul>
        <li>id: { user.userId }</li>
        <li>visits: { user.userVisitCounts }</li>
        <li>type: { user.userType }</li>
      </ul>
      <button 
        onClick={handleUserButtonClick}>
        Временно повысить статус
        </button>
    </>
  )
}

export default UserComponent;