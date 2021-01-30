const Cars = (props) => {
  const data = props.data;

  return (
    <div>
      {
        data.map((item) => {
          return (
            <>
              <h3>{item.id}</h3>
              <p>{item.content}</p>
              <p><small>{item.dateOfReceiving}</small></p>
              <hr/>
            </>
          )
        })
      }
    </div>
  )
}

export default Cars;