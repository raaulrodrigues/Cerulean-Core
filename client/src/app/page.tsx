'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTeamStore } from '@/lib/useTeamStore';
import { PokemonSet } from '@/lib/constants';
import Link from 'next/link';
import { parseBattleLog, initialBattleState, BattleState } from '@/lib/battleParser';
import HPBar from './hp-bar';

let socket: Socket;

interface Move {
  move: string;
  id: string;
  pp: number;
  maxpp: number;
  target: string;
  disabled: boolean;
}

interface RequestPokemon {
  ident: string;
  details: string;
  condition: string;
  active: boolean;
  item: string;
  moves: Move[];
}

interface Side {
  name: string;
  id: 'p1' | 'p2';
  pokemon: RequestPokemon[];
}

interface BattleRequest {
  side: Side;
  active?: RequestPokemon[];
  teamPreview?: boolean;
  forceSwitch?: boolean;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [battleState, setBattleState] = useState<BattleState>(initialBattleState);
  const [activeMoves, setActiveMoves] = useState<Move[]>([]);
  const [playerID, setPlayerID] = useState<'p1' | 'p2' | null>(null);
  const [status, setStatus] = useState<string>('Conectado');
  const [winner, setWinner] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  
  const { team } = useTeamStore();

  const playerIDRef = useRef(playerID);
  
  useEffect(() => {
    playerIDRef.current = playerID;
  }, [playerID]);

  const sendChoice = (choice: string) => {
    socket.emit('player-choice', choice);
  };

  useEffect(() => {
    socket = io('http://localhost:3001');

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('status', (message: string) => {
      setStatus(message);
    });

    socket.on('battle-start', (id: 'p1' | 'p2') => {
      setPlayerID(id);
      setStatus('Batalha em andamento');
      setBattleState(initialBattleState);
      setWinner(null);
    });

    socket.on('battle-log', (chunk: string) => {
      setBattleState((prevState: BattleState) => {
        const newState = parseBattleLog(prevState, chunk);
        return newState;
      });

      const currentPID = playerIDRef.current; 
      if (!currentPID) return;

      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('|request|')) {
          const requestJson = line.substring(9);
          if (requestJson) {
            try {
              const request: BattleRequest = JSON.parse(requestJson);
              
              if (request.side.id === currentPID) {
                if (request.teamPreview) {
                  const teamString = Array.from({ length: team.length }, (_, i: number) => i + 1).join('');
                  sendChoice(`>${currentPID} team ${teamString}`);
                } else if (request.forceSwitch) {
                  const availableSlot = request.side.pokemon.findIndex((p: RequestPokemon) => p.condition !== '0 fnt' && !p.active);
                  if (availableSlot !== -1) {
                    sendChoice(`>${currentPID} switch ${availableSlot + 1}`);
                  }
                } else if (request.active) {
                  setActiveMoves(request.active[0].moves);
                  setIsSwitching(false); 
                }
              }
            } catch (e) {
              console.error("Erro ao parsear JSON:", requestJson, e);
            }
          }
        }
        
        if (line.startsWith('|win|')) {
          setWinner(line.split('|')[2]);
          setStatus("Batalha Terminada");
          setActiveMoves([]);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startBattle = () => {
    if (team.length === 0) {
      setStatus("Seu time está vazio! Vá montar seu time.");
      return;
    }
    
    setBattleState(initialBattleState);
    setActiveMoves([]);
    setPlayerID(null);
    setWinner(null);
    setIsSwitching(false);
    setStatus('Procurando...');
    
    socket.emit('procurarBatalha', team); 
  };

  const handleMoveClick = (moveIndex: number) => {
    sendChoice(`>${playerIDRef.current} move ${moveIndex + 1}`);
    setActiveMoves([]);
    setIsSwitching(false);
  };

  const handleSwitchClick = (slotIndex: number) => {
    sendChoice(`>${playerIDRef.current} switch ${slotIndex + 1}`);
    setIsSwitching(false);
    setActiveMoves([]);
  };

  const myTeam = playerID === 'p1' ? battleState.p1 : battleState.p2;
  const opponentTeam = playerID === 'p1' ? battleState.p2 : battleState.p1;
  const showBattleUI = status.includes('Batalha') || battleState.isActive;
  const isOpponentActive = opponentTeam.active !== null;
  const isMyPokemonActive = myTeam.active !== null;

  const currentStatusText = winner
    ? `VENCEDOR: ${winner}!`
    : status === 'Batalha em andamento' && isConnected
      ? 'Batalha em andamento'
      : status;
  
  const showActionButtons = !isSwitching && activeMoves.length > 0 && winner === null;
  const showSwitchButtons = isSwitching && winner === null;
  const showSwitchOption = !isSwitching && activeMoves.length > 0 && winner === null;

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Cerulean Core - Lobby</h1>
      
      {!showBattleUI && (
        <Link href="/teambuilder" passHref>
          <button
            className="mt-8 mb-4 rounded-md bg-yellow-600 px-6 py-2 text-lg font-semibold shadow-sm hover:bg-yellow-500"
          >
            Monte seu Time ({team.length}/6)
          </button>
        </Link>
      )}

      <p className={`mb-6 text-xl font-semibold ${winner ? 'text-yellow-400' : 'text-gray-400'}`}>
        Status: {isConnected ? currentStatusText : 'Desconectado'}
      </p>

      <button
        onClick={startBattle}
        disabled={!isConnected || team.length === 0 || status === 'Procurando...' || winner !== null}
        className="rounded-md bg-green-600 px-6 py-3 text-xl font-semibold shadow-sm hover:bg-green-500 disabled:opacity-50"
      >
        {winner ? 'Jogar Novamente' : 'Procurar Batalha'}
      </button>

      {showBattleUI && (
        <div className="mt-8 w-full max-w-4xl border border-gray-700 p-6 rounded-lg bg-gray-800">
          
          {/* Oponente UI (Topo) */}
          <div className="mb-8 p-4 bg-gray-700 rounded-lg">
            <p className="text-lg font-bold mb-2">
              Oponente: {isOpponentActive ? opponentTeam.active!.species : 'Aguardando...'} ({opponentTeam.teamSize} Pokémon)
            </p>
            {isOpponentActive && (
              <div className="flex items-center">
                <span className="text-2xl mr-4">{opponentTeam.active!.species}</span>
                <HPBar percentage={opponentTeam.active!.hpPercent} />
                <span className="ml-3 text-sm">{opponentTeam.active!.hpPercent}%</span>
              </div>
            )}
          </div>

          {/* Player UI (Rodapé) */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <p className="text-lg font-bold mb-2">Seu Pokémon: {isMyPokemonActive ? myTeam.active!.species : '---'}</p>
            {isMyPokemonActive && (
              <div className="flex items-center">
                <span className="text-2xl mr-4">{myTeam.active!.species}</span>
                <HPBar percentage={myTeam.active!.hpPercent} />
                <span className="ml-3 text-sm">{myTeam.active!.hpPercent}%</span>
              </div>
            )}
          </div>

          {/* Botões de Ação - Attack/Switch */}
          <div className="mt-4 w-full max-w-4xl mx-auto">
            {showSwitchOption && (
              <button
                onClick={() => setIsSwitching(true)}
                className="w-full mb-2 p-2 bg-yellow-600 rounded-md font-semibold hover:bg-yellow-500"
              >
                Trocar Pokémon
              </button>
            )}

            {showActionButtons && (
              <div className="grid grid-cols-2 gap-4">
                {activeMoves.map((move: Move, index: number) => (
                  <button
                    key={move.id}
                    onClick={() => handleMoveClick(index)}
                    disabled={move.disabled}
                    className="rounded-md bg-gray-600 p-4 text-left font-bold text-white shadow-sm hover:bg-gray-500"
                  >
                    <p className="text-xl">{move.move}</p>
                    <p className="text-sm font-normal text-gray-400">
                      {move.pp} / {move.maxpp} PP
                    </p>
                  </button>
                ))}
              </div>
            )}

            {showSwitchButtons && (
              <div className="grid grid-cols-3 gap-2">
                {team.map((pokemon, index) => (
                  <button
                    key={pokemon.name}
                    onClick={() => handleSwitchClick(index)}
                    disabled={myTeam.active?.species === pokemon.species || pokemon.name === 'Fainted'} // Simplificado
                    className={`rounded-md p-2 text-sm font-bold text-white shadow-sm ${myTeam.active?.species === pokemon.species ? 'bg-blue-800' : 'bg-gray-600 hover:bg-gray-500'}`}
                  >
                    {pokemon.name}
                  </button>
                ))}
              </div>
            )}
            
            {showSwitchButtons && (
              <button
                onClick={() => setIsSwitching(false)}
                className="w-full mt-2 p-1 bg-red-800 rounded-md font-semibold hover:bg-red-700"
              >
                Cancelar Troca
              </button>
            )}
          </div>

          {/* Log de Debug (Temporário) */}
          <div className="mt-4 h-32 overflow-y-scroll bg-black p-2 rounded-md font-mono text-xs border-2 border-gray-700">
            {battleState.logs.slice(-10).map((log: string, index: number) => (
              <pre key={index} className="whitespace-pre-wrap">
                {log}
              </pre>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}