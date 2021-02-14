// Core
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/react-hooks';

// Other
import { useStore } from '../init/store';
import { useApollo } from '../init/apollo';

function MyApp({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState);
  const apolloCLient = useApollo(pageProps.initialApolloState);

  return (
    <Provider store={store}>
      <ApolloProvider client={apolloCLient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </Provider>
  )
}

export default MyApp
