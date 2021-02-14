// Core
import { useQuery } from '@apollo/react-hooks';

// Other
import queryPokemons from './gql/queryPokemons.graphql';

export const usePokemons = () => {

  const { data } = useQuery(queryPokemons, {
    fetchPolicy: 'cache-only',
  });

  return {
    pokemons: data ? data.pokemons : null,
  };
};
