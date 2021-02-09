import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectCars } from '../../bus/cars/selectors';

const CarsComponent = (props) => {
  const {} = props;
  const data = useSelector(selectCars);

  return (
    <ul>
      {
        data.map((item) => {
          return (
            <li key={ item.id }>
              <h3>
                <Link href={`/cars/${item.id}`}>
                  <a style={{color: 'blue'}}>{item.id}</a>
                </Link>
              </h3>
              <p>{ item.content }</p>
              <p><small>{ item.dateOfReceiving }</small></p>
              <hr/>
            </li>
          )
        })
      }
    </ul>
  )
}

export default CarsComponent;