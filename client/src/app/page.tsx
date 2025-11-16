'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);

  useEffect(() => {
    socket = io('http://localhost:3001');

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('battle-log', (chunk: string) => {
      setBattleLogs((prevLogs) => [...prevLogs, ...chunk.split('\n')]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startBattle = () => {
    setBattleLogs([]); // Limpa os logs antigos
    console.log('Enviando pedido de batalha...');
    socket.emit('procurarBatalha');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Cerulean Core - Fase 3</h1>
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

      <div className="mt-8 w-full max-w-4xl h-96 overflow-y-scroll bg-black p-4 rounded-md font-mono text-sm">
        {battleLogs.map((log, index) => (
          <pre key={index} className="whitespace-pre-wrap">
            {log}
          </pre>
        ))}
      </div>
    </main>
  );
}