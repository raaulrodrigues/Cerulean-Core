'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Conectado ao servidor!');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Desconectado do servidor.');
      setIsConnected(false);
    });

    socket.on('pong', () => {
      console.log('Recebemos um PONG do servidor!');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendPing = () => {
    console.log('Enviando PING para o servidor...');
    socket.emit('ping');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Cerulean Core - Teste</h1>
      <p className="mb-6">
        Status da Conexão: {isConnected ? 'Conectado' : 'Desconectado'}
      </p>
      <button
        onClick={sendPing}
        disabled={!isConnected}
        className="rounded-md bg-blue-600 px-4 py-2 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
      >
        Enviar "PING"
      </button>
    </main>
  );
}