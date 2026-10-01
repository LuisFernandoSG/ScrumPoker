import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { roomsManager, DECK_TEMPLATES } from './roomsManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Detección de la dirección IP local para compartir en LAN (Wi-Fi o Ethernet)
export function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  // 1. Priorizar redes Wi-Fi / routers hogareños y oficinas (192.168.x.x)
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal && net.address.startsWith('192.168.')) {
        return net.address;
      }
    }
  }
  // 2. Redes 10.x.x.x o 172.x.x.x
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal && (net.address.startsWith('10.') || net.address.startsWith('172.'))) {
        return net.address;
      }
    }
  }
  // 3. Cualquier otra IPv4 no interna
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const isProduction = process.env.NODE_ENV === 'production';

// Habilitar CORS para localhost y cualquier dispositivo en la misma red local (LAN)
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// Servir archivos estáticos del frontend en producción
if (isProduction) {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));
}

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Endpoint de información de red para compartir en LAN
app.get('/api/network-info', (req, res) => {
  const lanIp = getLocalIpAddress();
  res.json({
    lanIp,
    clientPort: 5173,
    serverPort: PORT,
    lanBaseUrl: `http://${lanIp}:5173`
  });
});

// Endpoint de plantillas de cartas disponibles
app.get('/api/templates', (req, res) => {
  res.json(DECK_TEMPLATES);
});

// Endpoint para verificar si una sala existe
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = roomsManager.getRoom(roomId);
  if (!room) {
    return res.status(404).json({ error: 'La sala no existe o ha expirado.' });
  }
  res.json({
    id: room.id,
    taskName: room.taskName,
    revealed: room.revealed,
    deckTemplate: room.deckTemplate,
    deck: room.deck,
    participantsCount: room.participants.length
  });
});

// Inicialización de Socket.IO con soporte LAN
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 10000,
  pingInterval: 5000,
});

/**
 * Transmite el estado de la sala a cada participante de forma individual y segura
 * Garantiza que nadie pueda inspeccionar votos ajenos en la red antes de revelar
 */
async function broadcastRoomState(roomId) {
  const sockets = await io.in(roomId).fetchSockets();
  for (const s of sockets) {
    const participantId = s.data.participantId;
    if (participantId) {
      const sanitized = roomsManager.getSanitizedRoom(roomId, participantId);
      if (sanitized) {
        s.emit('room_updated', sanitized);
      }
    }
  }
}

io.on('connection', (socket) => {
  // 1. Crear sala con plantilla o cartas personalizadas
  socket.on('create_room', ({ hostName, participantId, deckKey, customCards }, callback) => {
    if (!hostName || !hostName.trim()) {
      return callback({ error: 'El nombre es obligatorio.' });
    }
    if (!participantId) {
      return callback({ error: 'ID de participante no válido.' });
    }

    const room = roomsManager.createRoom(hostName, participantId, socket.id, deckKey, customCards);
    socket.join(room.id);
    socket.data.roomId = room.id;
    socket.data.participantId = participantId;

    const sanitized = roomsManager.getSanitizedRoom(room.id, participantId);
    callback({ success: true, room: sanitized });
  });

  // 2. Unirse a una sala
  socket.on('join_room', ({ roomId, name, participantId }, callback) => {
    if (!roomId) {
      return callback && callback({ error: 'Código de sala no proporcionado.' });
    }
    const cleanRoomId = roomId.trim().toUpperCase();
    const result = roomsManager.joinRoom(cleanRoomId, name, participantId, socket.id);

    if (result.error) {
      return callback && callback({ error: result.error });
    }

    socket.join(cleanRoomId);
    socket.data.roomId = cleanRoomId;
    socket.data.participantId = participantId;

    // Notificar a todos en la sala con su versión segura
    broadcastRoomState(cleanRoomId);

    if (callback) {
      const sanitized = roomsManager.getSanitizedRoom(cleanRoomId, participantId);
      callback({ success: true, room: sanitized });
    }
  });

  // 3. Emitir voto
  socket.on('vote', ({ vote }) => {
    const { roomId, participantId } = socket.data;
    if (!roomId || !participantId) return;

    const success = roomsManager.castVote(roomId, participantId, vote);
    if (success) {
      broadcastRoomState(roomId);
    }
  });

  // 4. Configurar / actualizar baraja de cartas (solo el anfitrión)
  socket.on('update_deck', ({ deck, templateName }) => {
    const { roomId, participantId } = socket.data;
    if (!roomId || !participantId) return;

    const room = roomsManager.getRoom(roomId);
    if (!room) return;

    const participant = room.participants.find(p => p.id === participantId);
    if (!participant || !participant.isHost) return;

    const success = roomsManager.updateDeck(roomId, deck, templateName);
    if (success) {
      broadcastRoomState(roomId);
    }
  });

  // 5. Revelar votos
  socket.on('reveal_votes', () => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const success = roomsManager.revealVotes(roomId);
    if (success) {
      broadcastRoomState(roomId);
    }
  });

  // 6. Reiniciar votación
  socket.on('reset_votes', () => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const success = roomsManager.resetVotes(roomId);
    if (success) {
      broadcastRoomState(roomId);
    }
  });

  // 7. Actualizar nombre de la tarea / historia
  socket.on('update_task', ({ taskName }) => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const success = roomsManager.updateTask(roomId, taskName);
    if (success) {
      broadcastRoomState(roomId);
    }
  });

  // 8. Salir voluntariamente de la sala
  socket.on('leave_room', () => {
    const { roomId, participantId } = socket.data;
    if (roomId && participantId) {
      roomsManager.removeParticipant(roomId, participantId, (rId) => {
        broadcastRoomState(rId);
      });
      socket.leave(roomId);
      socket.data.roomId = null;
    }
  });

  // 9. Desconexión del socket
  socket.on('disconnect', () => {
    const { roomId } = socket.data;
    if (roomId) {
      roomsManager.handleDisconnect(socket.id, (rId) => {
        broadcastRoomState(rId);
      });
      broadcastRoomState(roomId);
    }
  });
});

// En producción, cualquier ruta no capturada entrega el frontend SPA
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  const lanIp = getLocalIpAddress();
  console.log(`[PokerScrum Server] Corriendo localmente en: http://localhost:${PORT}`);
  console.log(`[PokerScrum Server] Accesible en LAN (misma red) en: http://${lanIp}:${PORT}`);
  console.log(`[PokerScrum Client] Accesible en LAN (misma red) en: http://${lanIp}:5173`);
});
