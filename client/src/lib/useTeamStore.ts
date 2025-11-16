import { create } from 'zustand';
import { PokemonSet } from './constants';

interface TeamState {
  team: PokemonSet[];
  addPokemon: (pokemon: PokemonSet) => void;
  removePokemon: (pokemonName: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  team: [],
  addPokemon: (pokemon) =>
    set((state) => {
      if (state.team.length >= 6 || state.team.find(p => p.name === pokemon.name)) {
        return state;
      }
      return { team: [...state.team, pokemon] };
    }),
  removePokemon: (pokemonName) =>
    set((state) => ({
      team: state.team.filter((p) => p.name !== pokemonName),
    })),
}));