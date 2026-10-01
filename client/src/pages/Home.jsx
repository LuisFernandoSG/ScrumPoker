import React, { useState, useEffect } from 'react';
import { PlusCircle, LogIn, User, Sparkles, ShieldCheck, Zap, Layers, Wifi, Sliders } from 'lucide-react';
import { getUserName, setUserName, getParticipantId, socket } from '../services/socket';
import { PRESET_TEMPLATES } from '../components/DeckConfigModal';

export default function Home({ onNavigateToRoom }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [selectedDeckKey, setSelectedDeckKey] = useState('sequential');
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [lanInfo, setLanInfo] = useState(null);

  useEffect(() => {
    const savedName = getUserName();
    if (savedName) {
      setName(savedName);
    }

    // Consultar dirección IP LAN
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.lanIp && data.lanIp !== 'localhost') {
          setLanInfo(data);
        }
      })
      .catch(() => { });
  }, []);

  // Validación común del nombre
  const validateName = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor escribe tu nombre para continuar.');
      return false;
    }
    if (cleanName.length > 30) {
      setError('El nombre no puede tener más de 30 caracteres.');
      return false;
    }
    setUserName(cleanName);
    setError('');
    return true;
  };

  // Crear una nueva sala con la baraja elegida
  const handleCreateRoom = () => {
    if (!validateName()) return;
    setIsCreating(true);

    const participantId = getParticipantId();

    socket.emit(
      'create_room',
      {
        hostName: name.trim(),
        participantId,
        deckKey: selectedDeckKey
      },
      (res) => {
        setIsCreating(false);
        if (res && res.success && res.room) {
          onNavigateToRoom(res.room.id);
        } else {
          setError(res?.error || 'Error al crear la sala. Inténtalo de nuevo.');
        }
      }
    );
  };

  // Unirse a una sala existente
  const handleJoinRoom = (e) => {
    if (e) e.preventDefault();
    if (!validateName()) return;

    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Por favor ingresa el código de la sala.');
      return;
    }

    onNavigateToRoom(cleanCode);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between relative overflow-hidden">

      {/* Fondo con resplandores decorativos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white text-2xl font-black">♠</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            PokerScrum
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* {lanInfo?.lanIp && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full font-mono">
              <Wifi className="w-3.5 h-3.5" />
              <span>Red LAN: {lanInfo.lanIp}:{lanInfo.clientPort || 5173}</span>
            </div>
          )} */}

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Votación en tiempo real</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-xl w-full mx-auto px-4 py-8 z-10 flex flex-col items-center text-center">

        {/* Título y subtítulo */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-cyan-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Estimaciones ágiles, rápidas y divertidas</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
          Planning Poker para <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            equipos ágiles
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-md mb-8">
          Vota la complejidad de tus historias de usuario en equipo. Votos anónimos, barajas configurables y promedio automático.
        </p>

        {/* Tarjeta de Inicio */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/50 backdrop-blur-xl">

          {error && (
            <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-300 text-xs text-left animate-in fade-in">
              {error}
            </div>
          )}

          {/* Campo de Nombre */}
          <div className="mb-5 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Tu nombre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ej. Luis, María, Alex..."
                maxLength={30}
                id="user-name-input"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-4 py-3 text-sm sm:text-base text-white placeholder:text-slate-500 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Selector de Baraja / Plantilla inicial (Opcional antes de crear) */}
          <div className="mb-6 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Baraja de Cartas
              </label>
              <button
                type="button"
                onClick={() => setShowDeckSelector(!showDeckSelector)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>{showDeckSelector ? 'Ocultar' : 'Cambiar plantilla'}</span>
              </button>
            </div>

            {showDeckSelector ? (
              <div className="grid grid-cols-1 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800 mt-2 max-h-48 overflow-y-auto custom-scrollbar">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedDeckKey(tmpl.id);
                      setShowDeckSelector(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${selectedDeckKey === tmpl.id
                      ? 'bg-blue-600/20 border-cyan-400 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{tmpl.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tmpl.cards.slice(0, 7).join(', ')}...</div>
                    </div>
                    {selectedDeckKey === tmpl.id && <span className="text-cyan-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between">
                <span>
                  Plantilla seleccionada: <strong className="text-cyan-300 font-semibold">{PRESET_TEMPLATES.find(t => t.id === selectedDeckKey)?.name}</strong>
                </span>
                <span className="text-[11px] text-slate-500">Podrás cambiarla luego</span>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">

            {/* Opción 1: Crear Sala */}
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              id="create-room-btn"
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-500/25 hover:shadow-cyan-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{isCreating ? 'Creando sala...' : 'Crear nueva sala'}</span>
            </button>

            {/* Opción 2: Unirme a una sala */}
            {!showJoinInput ? (
              <button
                type="button"
                onClick={() => setShowJoinInput(true)}
                id="toggle-join-input-btn"
                className="w-full py-3 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm hover:border-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Unirme a una sala</span>
              </button>
            ) : (
              <form onSubmit={handleJoinRoom} className="flex gap-2 mt-2 animate-in fade-in">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO (Ej. ABC123)"
                  maxLength={10}
                  className="flex-1 bg-slate-950 border border-slate-700 uppercase tracking-widest font-mono font-bold text-center focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
                />
                <button
                  type="submit"
                  id="submit-join-room-btn"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all shadow-md shadow-cyan-600/20"
                >
                  Entrar
                </button>
              </form>
            )}

          </div>

        </div>

        {/* Pilares / Ventajas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-10 text-left">

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-200">Tiempo Real & LAN</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Conexión instantánea en tu red Wi-Fi o internet sin demoras.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-200">Votos Secretos</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Protegidos en el servidor hasta que el anfitrión los revela.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-200">Barajas Flexibles</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Fibonacci, T-Shirt, Secuencial o tus cartas personalizadas.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Footer con información de red LAN */}
      {/* <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-900 z-10 px-4">
        {lanInfo?.lanIp ? (
          <span className="flex items-center justify-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compartir en red local (LAN / Wi-Fi): <strong className="text-slate-300 font-mono">http://{lanInfo.lanIp}:{lanInfo.clientPort || 5173}</strong></span>
          </span>
        ) : (
          <span>Planning Poker colaborativo para equipos ágiles</span>
        )}
      </footer> */}

    </div>
  );
}
