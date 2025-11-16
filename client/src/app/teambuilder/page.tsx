'use client';
import { POKEMON_POOL } from '@/lib/constants';
import { useTeamStore } from '@/lib/useTeamStore';
import Link from 'next/link';

export default function TeamBuilder() {
  const { team, addPokemon, removePokemon } = useTeamStore();

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Monte seu Time</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-6xl">
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pokémon Disponíveis</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {POKEMON_POOL.map((pokemon) => (
              <button
                key={pokemon.name}
                onClick={() => addPokemon(pokemon)}
                className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all text-left"
              >
                <p className="text-lg font-bold">{pokemon.name}</p>
                <p className="text-sm text-gray-400">{pokemon.moves.join(', ')}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Seu Time ({team.length} / 6)</h2>
          <div className="flex flex-col gap-4 min-h-[300px]">
            {team.map((pokemon) => (
              <div
                key={pokemon.name}
                className="p-4 bg-gray-700 rounded-lg flex justify-between items-center"
              >
                <p className="text-lg font-bold">{pokemon.name}</p>
                <button
                  onClick={() => removePokemon(pokemon.name)}
                  className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 text-sm font-semibold"
                >
                  Remover
                </button>
              </div>
            ))}
            {team.length === 0 && (
              <p className="text-gray-500 text-center mt-12">Seu time está vazio.</p>
            )}
          </div>
          
          <Link href="/" passHref>
            <button
              className="mt-8 w-full rounded-md bg-green-600 px-4 py-3 text-lg font-semibold shadow-sm hover:bg-green-500 disabled:opacity-50"
              disabled={team.length === 0}
            >
              Voltar para o Lobby
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}