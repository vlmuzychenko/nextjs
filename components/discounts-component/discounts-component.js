import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectDiscounts } from '../../bus/discounts/selectors';

const Discounts = (props) => {
  const data = useSelector(selectDiscounts);
  return (
    <ul>
      {
        data.map((item) => {
          return (
            <li key={ item.id }>
              <h3>
                <Link href={`/discounts/${item.id}`}>
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

export default Discounts;