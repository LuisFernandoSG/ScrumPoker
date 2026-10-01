import React from 'react';
import { Eye, RefreshCw, Users, CheckCircle2, Clock } from 'lucide-react';
import ParticipantCard from './ParticipantCard';

export default function PokerTable({
  participants = [],
  isRevealed = false,
  isHost = false,
  currentUserId,
  onRevealVotes,
  onResetVotes,
}) {
  const totalCount = participants.length;
  const votedCount = participants.filter(p => p.hasVoted).length;
  const percentVoted = totalCount > 0 ? Math.round((votedCount / totalCount) * 100) : 0;

  // Organizar a los participantes
  const self = participants.find(p => p.id === currentUserId);
  const others = participants.filter(p => p.id !== currentUserId);

  // Distribución para escritorio (4 lados)
  let top = [];
  let left = [];
  let right = [];
  let bottom = self ? [self] : [];

  if (others.length === 1) {
    top.push(others[0]);
  } else if (others.length === 2) {
    top.push(others[0]);
    top.push(others[1]);
  } else if (others.length === 3) {
    left.push(others[0]);
    top.push(others[1]);
    right.push(others[2]);
  } else if (others.length > 3) {
    left.push(others[0]);
    right.push(others[1]);
    const remaining = others.slice(2);
    const half = Math.ceil(remaining.length / 2);
    top = remaining.slice(0, half);
    bottom = bottom.concat(remaining.slice(half));
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center px-2 sm:px-4 py-2 my-auto">
      
      {/* 1. MÓVIL: Participantes superiores (todos los demás jugadores) */}
      <div className="flex sm:hidden flex-wrap items-center justify-center gap-2 mb-2 w-full">
        {others.map(p => (
          <ParticipantCard
            key={p.id}
            participant={p}
            isCurrentUser={p.id === currentUserId}
            isRevealed={isRevealed}
          />
        ))}
      </div>

      {/* 1. ESCRITORIO: Participantes SUPERIOR */}
      <div className="hidden sm:flex flex-wrap items-center justify-center gap-4 sm:gap-6 min-h-[90px] mb-2 sm:mb-4 w-full">
        {top.map(p => (
          <ParticipantCard
            key={p.id}
            participant={p}
            isCurrentUser={p.id === currentUserId}
            isRevealed={isRevealed}
          />
        ))}
      </div>

      {/* 2. Fila CENTRAL: [Lateral Izq] + [MESA DE POKER] + [Lateral Der] */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-6">
        
        {/* Participantes IZQUIERDA (solo en pantallas sm en adelante) */}
        <div className="hidden sm:flex flex-col items-center justify-center gap-4 min-w-[70px] sm:min-w-[90px]">
          {left.map(p => (
            <ParticipantCard
              key={p.id}
              participant={p}
              isCurrentUser={p.id === currentUserId}
              isRevealed={isRevealed}
            />
          ))}
        </div>

        {/* LA MESA DE POKER */}
        <div className="flex-1 w-full max-w-2xl min-h-[140px] sm:min-h-[200px] rounded-[28px] sm:rounded-[60px] bg-gradient-to-b from-[#071530] via-[#040e24] to-[#020919] border-2 sm:border-4 border-blue-600/40 poker-table-glow flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden transition-all duration-300">
          
          {/* Textura sutil y marca de agua de la mesa */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute opacity-5 font-black text-4xl sm:text-8xl tracking-widest text-blue-400 select-none pointer-events-none">
            POKER
          </div>

          {/* Indicador de estado de votación */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3 z-10">
            <span className="text-[11px] sm:text-sm font-medium text-slate-300 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-slate-700/60 shadow-sm">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
              <span>{votedCount} de {totalCount} han votado</span>
              <span className="text-cyan-400 font-bold">({percentVoted}%)</span>
            </span>
          </div>

          {/* Botones de acción central (Anfitrión / Invitado) */}
          <div className="z-10 flex flex-col items-center">
            {!isRevealed ? (
              // ANTES DE REVELAR
              isHost ? (
                <button
                  onClick={onRevealVotes}
                  id="reveal-votes-btn"
                  className="group relative inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-bold text-xs sm:text-base shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-blue-400/30"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                  <span>Revelar votos</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] sm:text-sm text-slate-400 bg-slate-900/70 px-3 py-1.5 rounded-xl border border-slate-800 animate-pulse text-center">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Esperando a que el anfitrión revele...</span>
                </div>
              )
            ) : (
              // DESPUÉS DE REVELAR
              isHost ? (
                <button
                  onClick={onResetVotes}
                  id="reset-votes-btn"
                  className="group relative inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold text-xs sm:text-base shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-180 duration-500" />
                  <span>Nueva votación</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] sm:text-sm text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/60 text-center">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Votos revelados. Esperando nueva ronda...</span>
                </div>
              )
            )}
          </div>

          {/* Barra de progreso de votos en el borde inferior de la mesa */}
          <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-slate-900/80">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
              style={{ width: `${percentVoted}%` }}
            />
          </div>

        </div>

        {/* Participantes DERECHA (solo en pantallas sm en adelante) */}
        <div className="hidden sm:flex flex-col items-center justify-center gap-4 min-w-[70px] sm:min-w-[90px]">
          {right.map(p => (
            <ParticipantCard
              key={p.id}
              participant={p}
              isCurrentUser={p.id === currentUserId}
              isRevealed={isRevealed}
            />
          ))}
        </div>

      </div>

      {/* 3. MÓVIL: Participante actual (TÚ) en la parte inferior */}
      <div className="flex sm:hidden flex-wrap items-center justify-center gap-2 mt-2 w-full">
        {self && (
          <ParticipantCard
            key={self.id}
            participant={self}
            isCurrentUser={true}
            isRevealed={isRevealed}
          />
        )}
      </div>

      {/* 3. ESCRITORIO: Participantes INFERIOR */}
      <div className="hidden sm:flex flex-wrap items-center justify-center gap-4 sm:gap-6 min-h-[90px] mt-2 sm:mt-4 w-full">
        {bottom.map(p => (
          <ParticipantCard
            key={p.id}
            participant={p}
            isCurrentUser={p.id === currentUserId}
            isRevealed={isRevealed}
          />
        ))}
      </div>

    </div>
  );
}
