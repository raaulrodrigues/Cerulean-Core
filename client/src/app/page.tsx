'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTeamStore } from '@/lib/useTeamStore';
import Link from 'next/link';

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
  active: RequestPokemon[];
  teamPreview?: boolean;
  forceSwitch?: boolean;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [activeMoves, setActiveMoves] = useState<Move[]>([]);
  const [playerID, setPlayerID] = useState<'p1' | 'p2' | null>(null);
  const [status, setStatus] = useState<string>('Conectado');
  
  const { team } = useTeamStore();

  const logsRef = useRef(battleLogs);
  const playerIDRef = useRef(playerID);
  
  useEffect(() => {
    logsRef.current = battleLogs;
  }, [battleLogs]);
  
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
    });

    socket.on('battle-log', (chunk: string) => {
      const lines = chunk.split('\n');
      const newLogs = [...logsRef.current, ...lines];
      setBattleLogs(newLogs);

      const currentPID = playerIDRef.current; 
      if (!currentPID) return;

      for (const line of lines) {
        if (line.startsWith('|request|')) {
          const requestJson = line.substring(9);
          if (requestJson) {
            try {
              const request: BattleRequest = JSON.parse(requestJson);
              
              if (request.side.id === currentPID) {
                if (request.teamPreview) {
                  const teamString = Array.from({ length: team.length }, (_, i) => i + 1).join('');
                  sendChoice(`>${currentPID} team ${teamString}`);
                } else if (request.forceSwitch) {
                  const availableSlot = request.side.pokemon.findIndex(p => p.condition !== '0 fnt' && !p.active);
                  
                  if (availableSlot !== -1) {
                    sendChoice(`>${currentPID} switch ${availableSlot + 1}`);
                  }
                } else if (request.active) {
                  setActiveMoves(request.active[0].moves);
                }
              }
            } catch (e) {
              console.error("Erro ao parsear JSON:", requestJson, e);
            }
          }
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
    
    setBattleLogs([]);
    setActiveMoves([]);
    setPlayerID(null);
    setStatus('Procurando...');
    
    socket.emit('procurarBatalha', team); 
  };

  const handleMoveClick = (moveIndex: number) => {
    sendChoice(`>${playerIDRef.current} move ${moveIndex + 1}`);
    setActiveMoves([]);
  };

  const showBattleUI = status.includes('Batalha') || activeMoves.length > 0;

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

      <p className="mb-6 text-gray-400">
        Status: {isConnected ? status : 'Desconectado'}
      </p>

      <button
        onClick={startBattle}
        disabled={!isConnected || team.length === 0 || status === 'Procurando...'}
        className="rounded-md bg-green-600 px-6 py-3 text-xl font-semibold shadow-sm hover:bg-green-500 disabled:opacity-50"
      >
        Procurar Batalha
      </button>

      {showBattleUI && (
        <>
          <div className="mt-8 w-full max-w-4xl h-96 overflow-y-scroll bg-black p-4 rounded-md font-mono text-sm border-2 border-gray-700">
            {battleLogs.map((log, index) => (
              <pre key={index} className="whitespace-pre-wrap">
                {log}
              </pre>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 w-full max-w-xl">
            {activeMoves.map((move, index) => (
              <button
                key={move.id}
                onClick={() => handleMoveClick(index)}
                disabled={move.disabled}
                className="rounded-md bg-gray-700 p-4 text-left font-bold text-white shadow-sm hover:bg-gray-600 disabled:opacity-50 disabled:bg-red-900"
              >
                <p className="text-xl">{move.move}</p>
                <p className="text-sm font-normal text-gray-300">
                  {move.pp} / {move.maxpp} PP
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </main>
  );
}