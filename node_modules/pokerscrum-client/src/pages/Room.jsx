import React, { useState, useEffect, useRef } from 'react';
import { socket, getParticipantId, getUserName, setUserName } from '../services/socket';
import Header from '../components/Header';
import PokerTable from '../components/PokerTable';
import VotingDeck from '../components/VotingDeck';
import VotingStats from '../components/VotingStats';
import TaskEditor from '../components/TaskEditor';
import JoinModal from '../components/JoinModal';
import DeckConfigModal from '../components/DeckConfigModal';
import { AlertCircle, ArrowLeft, PlusCircle } from 'lucide-react';
import { playResetSound } from '../utils/audio';

export default function Room({ roomId, onNavigateHome }) {
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [needsName, setNeedsName] = useState(false);
  const [isDeckConfigOpen, setIsDeckConfigOpen] = useState(false);

  const participantId = useRef(getParticipantId()).current;
  const previousRevealedRef = useRef(false);

  // Intentar unirse a la sala
  const joinCurrentRoom = (nameToUse) => {
    setIsLoading(true);
    setError('');

    socket.emit(
      'join_room',
      {
        roomId,
        name: nameToUse,
        participantId,
      },
      (response) => {
        setIsLoading(false);
        if (response && response.error) {
          setError(response.error);
        } else if (response && response.room) {
          setRoom(response.room);
          previousRevealedRef.current = response.room.revealed;
        }
      }
    );
  };

  useEffect(() => {
    const savedName = getUserName();
    if (!savedName) {
      setNeedsName(true);
      setIsLoading(false);
    } else {
      joinCurrentRoom(savedName);
    }

    // Manejadores de conexión Socket.IO
    const onConnect = () => {
      setIsConnected(true);
      // Re-unirse automáticamente en caso de reconexión tras pérdida de red
      const currentName = getUserName();
      if (currentName) {
        socket.emit('join_room', { roomId, name: currentName, participantId });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Actualizaciones de la sala en tiempo real
    const onRoomUpdated = (updatedRoom) => {
      // Si antes estaba revelado y ahora no, se reinició la votación
      if (previousRevealedRef.current && !updatedRoom.revealed) {
        playResetSound();
      }
      previousRevealedRef.current = updatedRoom.revealed;
      setRoom(updatedRoom);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room_updated', onRoomUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_updated', onRoomUpdated);
    };
  }, [roomId]);

  // Manejador para el modal de nombre
  const handleNameSubmit = (enteredName) => {
    setUserName(enteredName);
    setNeedsName(false);
    joinCurrentRoom(enteredName);
  };

  // Votar
  const handleVote = (voteVal) => {
    socket.emit('vote', { vote: voteVal });
  };

  // Guardar configuración de baraja (solo el anfitrión)
  const handleSaveDeck = (newDeck, templateName) => {
    socket.emit('update_deck', { deck: newDeck, templateName });
  };

  // Revelar votos
  const handleRevealVotes = () => {
    socket.emit('reveal_votes');
  };

  // Reiniciar votación
  const handleResetVotes = () => {
    socket.emit('reset_votes');
  };

  // Actualizar tarea
  const handleUpdateTask = (taskName) => {
    socket.emit('update_task', { taskName });
  };

  // Salir de la sala
  const handleLeaveRoom = () => {
    socket.emit('leave_room');
    onNavigateHome();
  };

  // Si requiere nombre antes de entrar
  if (needsName) {
    return (
      <div className="min-h-screen bg-background">
        <JoinModal
          roomId={roomId}
          initialName=""
          onJoin={handleNameSubmit}
          error={error}
        />
      </div>
    );
  }

  // Error de sala no encontrada o expirada
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sala no encontrada</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onNavigateHome}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la página principal</span>
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear una nueva sala</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cargando estado inicial
  if (isLoading || !room) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <span className="text-sm font-medium">Entrando a la sala {roomId}...</span>
      </div>
    );
  }

  // Usuario actual dentro de la sala
  const currentUser = room.participants.find(p => p.id === participantId) || {
    id: participantId,
    name: getUserName(),
    isHost: false,
    hasVoted: false,
    vote: null,
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col pb-36">

      {/* Header con código de sala, botón de invitar, IP LAN y configuración */}
      <Header
        roomId={roomId}
        currentUser={currentUser}
        isConnected={isConnected}
        onLeaveRoom={handleLeaveRoom}
        deckTemplate={room.deckTemplate}
        onOpenDeckConfig={() => setIsDeckConfigOpen(true)}
      />

      {/* Área de trabajo central */}
      <main className="flex-1 flex flex-col items-center justify-start max-w-7xl w-full mx-auto px-2 sm:px-4 pt-4 sm:pt-6">

        {/* Editor o visualizador de la tarea / historia actual */}
        {/* <TaskEditor
          taskName={room.taskName}
          isHost={currentUser.isHost}
          onUpdateTask={handleUpdateTask}
        /> */}

        {/* Mesa de Poker central con los participantes alrededor */}
        <PokerTable
          participants={room.participants}
          isRevealed={room.revealed}
          isHost={currentUser.isHost}
          currentUserId={participantId}
          onRevealVotes={handleRevealVotes}
          onResetVotes={handleResetVotes}
        />

        {/* Estadísticas de la votación (solo se muestran al revelar) */}
        <VotingStats
          stats={room.stats}
          isRevealed={room.revealed}
        />

      </main>

      {/* Deck de cartas fijado abajo con cartas dinámicas y plantilla actual */}
      <VotingDeck
        selectedVote={currentUser.vote}
        onVote={handleVote}
        isRevealed={room.revealed}
        deck={room.deck}
        deckTemplate={room.deckTemplate}
        isHost={currentUser.isHost}
        onOpenDeckConfig={() => setIsDeckConfigOpen(true)}
      />

      {/* Modal para configurar baraja de cartas (solo anfitrión) */}
      {currentUser.isHost && (
        <DeckConfigModal
          isOpen={isDeckConfigOpen}
          onClose={() => setIsDeckConfigOpen(false)}
          currentDeck={room.deck}
          currentTemplate={room.deckTemplate}
          onSaveDeck={handleSaveDeck}
        />
      )}

    </div>
  );
}
