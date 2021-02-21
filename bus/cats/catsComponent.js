// Core
import { useSelector, useDispatch } from 'react-redux';
import {useEffect} from 'react';
// Actions
import { catsActions } from './actions';
// Selectors
import { selectCatsEntries } from './selectors';
import { selectUserId } from '../user/selectors';
// Helpers
import { getUniqueId } from '../../helpers/common';
// Instruments
import { environmentVerify } from '../../helpers/common';

export const Cats = () => {
  const dispatch = useDispatch();
  const entries = useSelector(selectCatsEntries);
  const userId = useSelector(selectUserId);
  const { isProduction } = environmentVerify();

  const handlePostRequest = async () => {
    const response = await fetch('/api/logs/rest', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        logId: getUniqueId(),
        created: new Date().toISOString(),
        userId: userId,
        userAgent: window.navigator.userAgent,
        payload: {}
      })
    });
  }

  useEffect(() => {
    dispatch(catsActions.loadCatsAsync());
    if (isProduction) {
      handlePostRequest();
    }
  }, []);

  const entriesJSX = entries && entries.map(({_id, text}) => (
    <p key={_id}>
      {text}
    </p>
  ));

  return (
    <>
      <h1>Cats</h1>
      {entriesJSX}
    </>
  )
}
