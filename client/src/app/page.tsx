'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

interface Move {
  move: string;
  id: string;
  pp: number;
  maxpp: number;
  target: string;
  disabled: boolean;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [activeMoves, setActiveMoves] = useState<Move[]>([]);

  // Usamos uma 'ref' para evitar problemas de estado antigo no 'useEffect'
  const logsRef = useRef(battleLogs);
  useEffect(() => {
    logsRef.current = battleLogs;
  }, [battleLogs]);

  const sendChoice = (choice: string) => {
    console.log("Enviando escolha:", choice);
    socket.emit('player-choice', choice);
  };

  useEffect(() => {
    socket = io('http://localhost:3001');

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('battle-log', (chunk: string) => {
      const lines = chunk.split('\n');
      const newLogs = [...logsRef.current, ...lines];
      setBattleLogs(newLogs);

      // --- O CÉREBRO LÓGICO (CORRIGIDO) ---
      for (const line of lines) {
        if (line.startsWith('|request|')) {
          const requestJson = line.substring(9);
          if (requestJson) {
            try {
              const request = JSON.parse(requestJson);
              
              // Lógica 1: É Team Preview?
              if (request.teamPreview) {
                if (request.side.id === 'p1') {
                  sendChoice('>p1 team 1');
                } else if (request.side.id === 'p2') {
                  sendChoice('>p2 team 1');
                }
              }
              // Lógica 2: É um pedido de jogada (movimento/troca)?
              else if (request.forceSwitch) {
                // Lógica de troca (ainda não implementada)
                // Por enquanto, apenas envia o primeiro Pokémon
                sendChoice(`>p1 switch 1`);
              } else if (request.active) {
                // Se for o P1, mostra os botões
                if (request.side.id === 'p1') {
                  setActiveMoves(request.active[0].moves);
                }
                // Se for o P2 (IA), escolhe o movimento 1
                else if (request.side.id === 'p2') {
                  sendChoice('>p2 move 1');
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
    setBattleLogs([]);
    setActiveMoves([]);
    socket.emit('procurarBatalha');
  };

  const handleMoveClick = (moveIndex: number) => {
    sendChoice(`>p1 move ${moveIndex + 1}`);
    setActiveMoves([]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Cerulean Core - Fase 4 (v3)</h1>
      <p className="mb-6 text-gray-400">
        Status: {isConnected ? 'Conectado' : 'Desconectado'}
      </p>
      <button
        onClick={startBattle}
        disabled={!isConnected}
        className="rounded-md bg-green-600 px-4 py-2 text-lg font-semibold shadow-sm hover:bg-green-500 disabled:opacity-50"
      >
        Procurar Batalha
      </button>

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
    </main>
  );
}