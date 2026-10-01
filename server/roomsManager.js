/**
 * Gestor de salas de Planning Poker en memoria
 * Maneja la lógica de negocio, votos anónimos y cálculo de promedios.
 */

// Plantillas predeterminadas de cartas
export const DECK_TEMPLATES = {
  sequential: {
    id: 'sequential',
    name: 'Secuencial (1 al 13)',
    description: 'Serie correlativa clásica del 1 al 13 más interrogación',
    cards: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '?']
  },
  fibonacci: {
    id: 'fibonacci',
    name: 'Fibonacci Estándar',
    description: 'La serie más popular en Scrum: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']
  },
  scrum: {
    id: 'scrum',
    name: 'Scrum / Fibonacci Modificado',
    description: 'Incluye medios puntos y números redondos (40, 100)',
    cards: ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?']
  },
  tshirt: {
    id: 'tshirt',
    name: 'Tallas de Camiseta (T-Shirt)',
    description: 'Estimación cualitativa para equipos que prefieren tallas',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']
  },
  powersOfTwo: {
    id: 'powersOfTwo',
    name: 'Potencias de 2 (Binario)',
    description: '1, 2, 4, 8, 16, 32, 64',
    cards: ['1', '2', '4', '8', '16', '32', '64', '?']
  }
};

class RoomsManager {
  constructor() {
    /** @type {Map<string, Object>} */
    this.rooms = new Map();
    // Limpieza periódica de salas vacías cada 5 minutos
    setInterval(() => this.cleanupInactiveRooms(), 5 * 60 * 1000);
  }

  /**
   * Genera un código de sala único de 6 caracteres alfanuméricos legibles
   */
  generateRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin O, 0, I, 1 para evitar confusiones
    let id = '';
    do {
      id = '';
      for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(id));
    return id;
  }

  /**
   * Crea una nueva sala con un anfitrión inicial y baraja configurable
   */
  createRoom(hostName, participantId, socketId, deckKey = 'sequential', customCards = null) {
    const roomId = this.generateRoomId();
    
    let deck = DECK_TEMPLATES.sequential.cards;
    let deckTemplate = DECK_TEMPLATES.sequential.name;

    if (deckKey && DECK_TEMPLATES[deckKey]) {
      deck = [...DECK_TEMPLATES[deckKey].cards];
      deckTemplate = DECK_TEMPLATES[deckKey].name;
    } else if (Array.isArray(customCards) && customCards.length > 0) {
      deck = customCards.map(c => String(c).trim()).filter(Boolean).slice(0, 30);
      deckTemplate = 'Personalizada';
    }

    const newRoom = {
      id: roomId,
      taskName: '',
      revealed: false,
      deck: deck,
      deckTemplate: deckTemplate,
      participants: [
        {
          id: participantId,
          socketId: socketId,
          name: hostName.trim().slice(0, 30),
          isHost: true,
          hasVoted: false,
          vote: null,
          connected: true,
          disconnectTimeout: null,
        }
      ],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  /**
   * Actualiza la baraja de cartas de una sala
   */
  updateDeck(roomId, deck, templateName) {
    const room = this.getRoom(roomId);
    if (!room) return false;
    if (!Array.isArray(deck) || deck.length === 0) return false;

    room.deck = deck.map(c => String(c).trim()).filter(Boolean).slice(0, 30);
    room.deckTemplate = templateName || 'Personalizada';

    // Si algún participante tiene un voto que ya no está en la baraja, se limpia su voto
    room.participants.forEach(p => {
      if (p.vote && !room.deck.includes(p.vote)) {
        p.vote = null;
        p.hasVoted = false;
      }
    });

    room.lastActivity = Date.now();
    return true;
  }

  /**
   * Obtiene una sala por su ID
   */
  getRoom(roomId) {
    if (!roomId) return null;
    return this.rooms.get(roomId.toUpperCase()) || null;
  }

  /**
   * Une o reconecta a un participante a una sala
   */
  joinRoom(roomId, participantName, participantId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { error: 'La sala no existe o ha expirado.' };
    }

    room.lastActivity = Date.now();
    const existing = room.participants.find(p => p.id === participantId);

    if (existing) {
      // Cancelar timeout de desconexión si estaba pendiente
      if (existing.disconnectTimeout) {
        clearTimeout(existing.disconnectTimeout);
        existing.disconnectTimeout = null;
      }
      existing.socketId = socketId;
      existing.connected = true;
      if (participantName && participantName.trim()) {
        existing.name = participantName.trim().slice(0, 30);
      }
      return { room, participant: existing };
    }

    // Nuevo participante
    const isFirst = room.participants.filter(p => p.connected).length === 0;
    const newParticipant = {
      id: participantId,
      socketId: socketId,
      name: (participantName || 'Invitado').trim().slice(0, 30),
      isHost: isFirst || room.participants.length === 0,
      hasVoted: false,
      vote: null,
      connected: true,
      disconnectTimeout: null,
    };

    room.participants.push(newParticipant);
    return { room, participant: newParticipant };
  }

  /**
   * Emite el voto de un participante
   */
  castVote(roomId, participantId, vote) {
    const room = this.getRoom(roomId);
    if (!room) return false;
    if (room.revealed) return false; // Bloqueado tras revelar

    const participant = room.participants.find(p => p.id === participantId);
    if (!participant) return false;

    participant.vote = vote;
    participant.hasVoted = vote !== null && vote !== undefined;
    room.lastActivity = Date.now();
    return true;
  }

  /**
   * Revela los votos de la sala
   */
  revealVotes(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return false;
    room.revealed = true;
    room.lastActivity = Date.now();
    return true;
  }

  /**
   * Inicia una nueva ronda de votación (limpia votos)
   */
  resetVotes(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.revealed = false;
    room.participants.forEach(p => {
      p.vote = null;
      p.hasVoted = false;
    });
    room.lastActivity = Date.now();
    return true;
  }

  /**
   * Actualiza el nombre de la tarea en curso
   */
  updateTask(roomId, taskName) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.taskName = (taskName || '').slice(0, 150);
    room.lastActivity = Date.now();
    return true;
  }

  /**
   * Maneja la desconexión temporal de un socket
   */
  handleDisconnect(socketId, onParticipantRemoved) {
    for (const [roomId, room] of this.rooms.entries()) {
      const participant = room.participants.find(p => p.socketId === socketId);
      if (participant) {
        participant.connected = false;
        participant.socketId = null;

        // Esperar 12 segundos antes de removerlo por completo (da tiempo a recargar la página)
        participant.disconnectTimeout = setTimeout(() => {
          this.removeParticipant(roomId, participant.id, onParticipantRemoved);
        }, 12000);

        return { roomId, participant };
      }
    }
    return null;
  }

  /**
   * Remueve definitivamente a un participante y reasigna anfitrión si es necesario
   */
  removeParticipant(roomId, participantId, callback) {
    const room = this.getRoom(roomId);
    if (!room) return;

    const index = room.participants.findIndex(p => p.id === participantId);
    if (index === -1) return;

    const [removed] = room.participants.splice(index, 1);

    // Si el que salió era el anfitrión, reasignar al primer participante conectado
    if (removed.isHost && room.participants.length > 0) {
      const nextHost = room.participants.find(p => p.connected) || room.participants[0];
      if (nextHost) {
        nextHost.isHost = true;
      }
    }

    if (callback) {
      callback(roomId);
    }
  }

  /**
   * Calcula estadísticas de la votación
   */
  calculateStats(participants) {
    const numericVotes = [];
    const allValidVotes = [];
    const voteDistribution = {};
    let questionMarkCount = 0;

    participants.forEach(p => {
      if (p.vote !== null && p.vote !== undefined) {
        voteDistribution[p.vote] = (voteDistribution[p.vote] || 0) + 1;
        if (p.vote === '?') {
          questionMarkCount++;
        } else {
          allValidVotes.push(p.vote);
          const num = Number(p.vote);
          if (!isNaN(num) && p.vote.trim() !== '') {
            numericVotes.push(num);
          }
        }
      }
    });

    // Cálculo de la moda (voto más frecuente excluyendo '?')
    let maxFreq = 0;
    let mode = [];
    for (const [val, freq] of Object.entries(voteDistribution)) {
      if (val === '?') continue;
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = [val];
      } else if (freq === maxFreq) {
        mode.push(val);
      }
    }

    const hasNumericVotes = numericVotes.length > 0;
    const hasValidVotes = allValidVotes.length > 0;

    let average = null;
    let min = null;
    let max = null;

    if (hasNumericVotes) {
      const sum = numericVotes.reduce((acc, val) => acc + val, 0);
      average = Math.round((sum / numericVotes.length) * 10) / 10;
      min = Math.min(...numericVotes);
      max = Math.max(...numericVotes);
    }

    // Hay consenso si todos los votos válidos son idénticos (mínimo 2 votos)
    const agreement = allValidVotes.length > 1 && allValidVotes.every(v => v === allValidVotes[0]);

    return {
      hasValidVotes,
      hasNumericVotes,
      average,
      mode: mode.join(', ') || null,
      min,
      max,
      totalVotes: participants.filter(p => p.hasVoted).length,
      questionMarkCount,
      agreement,
      voteDistribution
    };
  }

  /**
   * Sanitiza el estado de la sala para enviarlo de forma segura a un cliente específico
   * ANTES de revelar: los votos ajenos son estrictamente NULL (seguridad contra inspección de red)
   * DESPUÉS de revelar: se envían todos los votos y las estadísticas calculadas
   */
  getSanitizedRoom(roomId, currentParticipantId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const isRevealed = room.revealed;

    const participants = room.participants.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      connected: p.connected,
      hasVoted: p.hasVoted,
      // Solo el propio jugador ve su voto antes de revelar; después de revelar, todos ven todo
      vote: isRevealed ? p.vote : (p.id === currentParticipantId ? p.vote : null),
    }));

    const stats = isRevealed ? this.calculateStats(room.participants) : null;

    return {
      id: room.id,
      taskName: room.taskName,
      revealed: room.revealed,
      deck: room.deck || DECK_TEMPLATES.sequential.cards,
      deckTemplate: room.deckTemplate || DECK_TEMPLATES.sequential.name,
      participants,
      stats,
      totalParticipants: room.participants.length,
      votedCount: room.participants.filter(p => p.hasVoted).length,
    };
  }

  /**
   * Limpia salas inactivas con más de 30 minutos sin participantes o actividad
   */
  cleanupInactiveRooms() {
    const now = Date.now();
    for (const [roomId, room] of this.rooms.entries()) {
      const activeParticipants = room.participants.filter(p => p.connected);
      const isOld = (now - room.lastActivity) > 30 * 60 * 1000;
      const isEmpty = activeParticipants.length === 0 && (now - room.lastActivity) > 10 * 60 * 1000;

      if (isEmpty || isOld) {
        this.rooms.delete(roomId);
      }
    }
  }
}

export const roomsManager = new RoomsManager();
