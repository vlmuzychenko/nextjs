// Hooks
import { usePokemons } from '../../bus/pokemons/hooks/usePokemons';

const PokemonsComponent = () => {
  const { pokemons } = usePokemons();

  const PokemonsJSX = pokemons && pokemons.map(({ name }) => (
    <li key={name}>
      {name}
    </li>
  ));

  return (
    <>
      <h1>Pokemons</h1>
      {PokemonsJSX}
    </>
  )
}

export default PokemonsComponent;
