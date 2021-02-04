const News = (props) => {
  const data = props.data;
  return (
    <ul>
      {
        data.map((item) => {
          return (
            <li key={ item.id }>
              <h3>{ item.id }</h3>
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