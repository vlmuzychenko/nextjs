// Core
import { useMemo } from 'react';
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import fetch from 'isomorphic-unfetch';
import apolloLogger from 'apollo-link-logger';

let apolloClient;

const isBrowser = typeof window !== 'undefined';

function createApolloClient(context) {
  const httpLink = createHttpLink({
    uri: 'https://graphql-pokemon2.vercel.app/',
    fetch,
  });

  let link;

  if (!isBrowser && context && context.req) {
    const tracingHeaders = setContext((operation, previousContext) => {
      return {
        ...previousContext,
      };
    });

    link = ApolloLink.from([
      tracingHeaders,
      httpLink,
    ]);
  } else {
    const links = [
      httpLink,
    ];

    if (isBrowser) {
      links.unshift(apolloLogger);
    }

    link = ApolloLink.from(links);
  }

  return new ApolloClient ({
    ssrMode: typeof window === 'undefined',
    link,
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(
  initialState, context,
) {
  const initedApolloClient = apolloClient || createApolloClient(context);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    initedApolloClient.cache.restore(initialState);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return initedApolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = initedApolloClient;

  return initedApolloClient;
}

export function useApollo(initialState = {}) {
  return useMemo(() => initializeApollo(initialState), [ initialState ]);
}
