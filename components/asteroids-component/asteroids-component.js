// Core
import { useSelector } from 'react-redux';
// Selectors
import { selectAsteroidsEntries  } from '../../bus/asteroids/selectors';

const AsteroidsComponent = () => {
  const entries = useSelector(selectAsteroidsEntries);

  const entriesJSX = entries && entries.map(({ id, full_name }) => (
    <p key={id}>
      {full_name}
    </p>
  ));

  return (
    <>
      <h1>Asteroids</h1>
      {entriesJSX}
    </>
  )
}

export default AsteroidsComponent;
