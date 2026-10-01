import { io } from 'socket.io-client';

/**
 * Obtiene o crea un ID único y persistente para este navegador
 * Permite reconectarse sin duplicar participantes al recargar
 */
export function getParticipantId() {
  let pid = localStorage.getItem('pokerscrum_pid');
  if (!pid) {
    pid = 'p_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('pokerscrum_pid', pid);
  }
  return pid;
}

export function getUserName() {
  return localStorage.getItem('pokerscrum_name') || '';
}

export function setUserName(name) {
  if (name && name.trim()) {
    localStorage.setItem('pokerscrum_name', name.trim().slice(0, 30));
  }
}

// Configuración del Socket
// En desarrollo, Vite proxiea /socket.io a localhost:4000
// En producción, se conecta al mismo host que sirve la aplicación
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ['websocket', 'polling'],
});
