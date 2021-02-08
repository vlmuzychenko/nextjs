import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectNews } from '../../bus/news/selectors';

const News = (props) => {
  const data = useSelector(selectNews);

  return (
    <ul>
      {
        data.map((item) => {
          return (
            <li key={ item.id }>
              <h3>
                <Link href={`/news/${item.id}`}>
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

export default News;